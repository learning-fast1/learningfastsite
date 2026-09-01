/* ============================================================
   RAN — Phase 2 preparation state machine tests (plain Node)
   Run with: node ran_preparation.test.js
   ============================================================ */
'use strict';
const assert = require('assert');
const path = require('path');

require(path.join(__dirname, '..', 'js', 'ran_definitions.js'));
require(path.join(__dirname, '..', 'js', 'ran_engine.js'));
const RAN = require(path.join(__dirname, '..', 'js', 'ran_preparation.js'));

let passed = 0;
function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  ok  - ${name}`);
    } catch (e) {
        console.error(`FAIL  - ${name}`);
        console.error(`        ${e.message}`);
        process.exitCode = 1;
    }
}

const P = RAN.preparation;
const ASSESSMENTS = ['RAN_DIGITS_V1', 'RAN_COLORS_V1', 'RAN_OBJECTS_V1'];

function markAllKnown(session) {
    const definition = RAN.getDefinition(session.assessmentId);
    let s = session;
    definition.stimuli.forEach(stim => { s = P.markFamiliarity(s, stim, RAN.FAMILIARITY_MARK.KNOWN); });
    return s;
}

function passFamiliarity(assessmentId) {
    let s = P.createSession(assessmentId);
    s = P.beginFamiliarity(s);
    s = markAllKnown(s);
    return P.finalizeFamiliarityCheck(s);
}

function checkAllPracticeItems(session) {
    let s = session;
    s = P.setPracticeChecklistItem(s, 'startPosition', true);
    s = P.setPracticeChecklistItem(s, 'leftToRight', true);
    s = P.setPracticeChecklistItem(s, 'rowTransition', true);
    return s;
}

console.log('RAN preparation — Phase 2 tests\n');

/* ============================================================
   Run every scenario for BOTH Digits and Colors — spec explicitly
   requires both assessments to work identically.
   ============================================================ */
ASSESSMENTS.forEach(assessmentId => {
    console.log(`\n=== ${assessmentId} ===`);

    console.log('Familiarity:');

    test(`[${assessmentId}] createSession starts in ASSESSMENT_SELECTED, no marks set`, () => {
        const s = P.createSession(assessmentId);
        assert.strictEqual(s.state, RAN.PREP_STATE.ASSESSMENT_SELECTED);
        const definition = RAN.getDefinition(assessmentId);
        definition.stimuli.forEach(stim => assert.strictEqual(s.familiarity.marks[stim], null));
    });

    test(`[${assessmentId}] beginFamiliarity moves to FAMILIARITY`, () => {
        const s = P.beginFamiliarity(P.createSession(assessmentId));
        assert.strictEqual(s.state, RAN.PREP_STATE.FAMILIARITY);
    });

    test(`[${assessmentId}] Familiarity PASS: all stimuli marked Known -> PRACTICE, attempt 1`, () => {
        const s = passFamiliarity(assessmentId);
        assert.strictEqual(s.state, RAN.PREP_STATE.PRACTICE);
        assert.strictEqual(s.failureReason, null);
        assert.strictEqual(s.practice.attemptNumber, 1);
    });

    test(`[${assessmentId}] Familiarity FAIL: one stimulus left as Difficulty -> PREPARATION_FAILED/FAMILIARITY_NOT_ESTABLISHED`, () => {
        const definition = RAN.getDefinition(assessmentId);
        let s = P.beginFamiliarity(P.createSession(assessmentId));
        definition.stimuli.forEach((stim, i) => {
            const mark = i === 0 ? RAN.FAMILIARITY_MARK.DIFFICULTY : RAN.FAMILIARITY_MARK.KNOWN;
            s = P.markFamiliarity(s, stim, mark);
        });
        s = P.finalizeFamiliarityCheck(s);
        assert.strictEqual(s.state, RAN.PREP_STATE.PREPARATION_FAILED);
        assert.strictEqual(s.failureReason, RAN.PREPARATION_FAILURE_REASON.FAMILIARITY_NOT_ESTABLISHED);
    });

    test(`[${assessmentId}] Familiarity FAIL: unmarked stimulus also blocks pass (not just Difficulty)`, () => {
        const definition = RAN.getDefinition(assessmentId);
        let s = P.beginFamiliarity(P.createSession(assessmentId));
        definition.stimuli.slice(1).forEach(stim => { s = P.markFamiliarity(s, stim, RAN.FAMILIARITY_MARK.KNOWN); });
        // first stimulus left completely unmarked (null)
        s = P.finalizeFamiliarityCheck(s);
        assert.strictEqual(s.state, RAN.PREP_STATE.PREPARATION_FAILED);
    });

    test(`[${assessmentId}] Familiarity retry ("Επανάληψη ελέγχου"): resets marks, returns to FAMILIARITY`, () => {
        const definition = RAN.getDefinition(assessmentId);
        let s = P.beginFamiliarity(P.createSession(assessmentId));
        s = P.markFamiliarity(s, definition.stimuli[0], RAN.FAMILIARITY_MARK.DIFFICULTY);
        definition.stimuli.slice(1).forEach(stim => { s = P.markFamiliarity(s, stim, RAN.FAMILIARITY_MARK.KNOWN); });
        s = P.finalizeFamiliarityCheck(s);
        assert.strictEqual(s.state, RAN.PREP_STATE.PREPARATION_FAILED);

        s = P.repeatFamiliarityCheck(s);
        assert.strictEqual(s.state, RAN.PREP_STATE.FAMILIARITY);
        assert.strictEqual(s.failureReason, null);
        definition.stimuli.forEach(stim => assert.strictEqual(s.familiarity.marks[stim], null, 'marks must be cleared on retry'));

        // and can pass normally afterward
        s = markAllKnown(s);
        s = P.finalizeFamiliarityCheck(s);
        assert.strictEqual(s.state, RAN.PREP_STATE.PRACTICE);
    });

    console.log('Item 16 — familiarityRetriesUsed audit counter:');

    test(`[${assessmentId}] createSession starts familiarityRetriesUsed at 0 (no re-check happened yet)`, () => {
        const s = P.createSession(assessmentId);
        assert.strictEqual(s.familiarity.retriesUsed, 0);
    });

    test(`[${assessmentId}] a clean pass (all Known first try) never increments familiarityRetriesUsed — stays 0`, () => {
        let s = passFamiliarity(assessmentId);
        assert.strictEqual(s.familiarity.retriesUsed, 0);
    });

    test(`[${assessmentId}] one Δυσκολία -> repeatFamiliarityCheck increments familiarityRetriesUsed to 1`, () => {
        const definition = RAN.getDefinition(assessmentId);
        let s = P.beginFamiliarity(P.createSession(assessmentId));
        s = P.markFamiliarity(s, definition.stimuli[0], RAN.FAMILIARITY_MARK.DIFFICULTY);
        definition.stimuli.slice(1).forEach(stim => { s = P.markFamiliarity(s, stim, RAN.FAMILIARITY_MARK.KNOWN); });
        s = P.finalizeFamiliarityCheck(s);
        s = P.repeatFamiliarityCheck(s);
        assert.strictEqual(s.familiarity.retriesUsed, 1);
        // and it's carried through a clean pass afterward
        s = markAllKnown(s);
        s = P.finalizeFamiliarityCheck(s);
        assert.strictEqual(s.state, RAN.PREP_STATE.PRACTICE);
        assert.strictEqual(s.familiarity.retriesUsed, 1, 'retriesUsed must survive into the passed session, not reset on a successful re-check');
    });

    test(`[${assessmentId}] multiple consecutive re-checks accumulate familiarityRetriesUsed (2, then 3)`, () => {
        const definition = RAN.getDefinition(assessmentId);
        function failOnceAndRetry(s) {
            s = P.markFamiliarity(s, definition.stimuli[0], RAN.FAMILIARITY_MARK.DIFFICULTY);
            definition.stimuli.slice(1).forEach(stim => { s = P.markFamiliarity(s, stim, RAN.FAMILIARITY_MARK.KNOWN); });
            s = P.finalizeFamiliarityCheck(s);
            assert.strictEqual(s.state, RAN.PREP_STATE.PREPARATION_FAILED);
            return P.repeatFamiliarityCheck(s);
        }
        let s = P.beginFamiliarity(P.createSession(assessmentId));
        s = failOnceAndRetry(s);
        assert.strictEqual(s.familiarity.retriesUsed, 1);
        s = failOnceAndRetry(s);
        assert.strictEqual(s.familiarity.retriesUsed, 2);
        s = failOnceAndRetry(s);
        assert.strictEqual(s.familiarity.retriesUsed, 3);
        s = markAllKnown(s);
        s = P.finalizeFamiliarityCheck(s);
        assert.strictEqual(s.state, RAN.PREP_STATE.PRACTICE);
        assert.strictEqual(s.familiarity.retriesUsed, 3, 'all 3 re-checks are preserved through to the passed session');
    });

    test(`[${assessmentId}] returnToFamiliarityFromPractice does NOT increment familiarityRetriesUsed (different trigger — naming errors during Practice, not a Δυσκολία mark)`, () => {
        let s = passFamiliarity(assessmentId);
        assert.strictEqual(s.familiarity.retriesUsed, 0);
        s = P.returnToFamiliarityFromPractice(s);
        assert.strictEqual(s.familiarity.retriesUsed, 0, 'this path must not count as a familiarity re-check for item 16 purposes');
    });

    test(`[${assessmentId}] returnToFamiliarityFromPractice carries an existing familiarityRetriesUsed count forward unchanged (never resets/loses it)`, () => {
        const definition = RAN.getDefinition(assessmentId);
        let s = P.beginFamiliarity(P.createSession(assessmentId));
        s = P.markFamiliarity(s, definition.stimuli[0], RAN.FAMILIARITY_MARK.DIFFICULTY);
        definition.stimuli.slice(1).forEach(stim => { s = P.markFamiliarity(s, stim, RAN.FAMILIARITY_MARK.KNOWN); });
        s = P.finalizeFamiliarityCheck(s);
        s = P.repeatFamiliarityCheck(s);
        assert.strictEqual(s.familiarity.retriesUsed, 1);
        s = markAllKnown(s);
        s = P.finalizeFamiliarityCheck(s); // -> PRACTICE
        s = P.returnToFamiliarityFromPractice(s);
        assert.strictEqual(s.familiarity.retriesUsed, 1, 'the earlier familiarity re-check is still remembered, not lost/reset to 0 or undefined');
    });

    test(`[${assessmentId}] "Τερματισμός προετοιμασίας" ends the session — no further transitions allowed`, () => {
        const definition = RAN.getDefinition(assessmentId);
        let s = P.beginFamiliarity(P.createSession(assessmentId));
        s = P.markFamiliarity(s, definition.stimuli[0], RAN.FAMILIARITY_MARK.DIFFICULTY);
        s = P.finalizeFamiliarityCheck(s);
        s = P.endPreparation(s);
        assert.strictEqual(s.terminated, true);
        assert.throws(() => P.repeatFamiliarityCheck(s), /terminated/);
        assert.throws(() => P.beginFamiliarity(s), /terminated/);
    });

    test(`[${assessmentId}] a correction (Difficulty then re-marked Known) is allowed and results in a pass`, () => {
        const definition = RAN.getDefinition(assessmentId);
        let s = P.beginFamiliarity(P.createSession(assessmentId));
        const first = definition.stimuli[0];
        s = P.markFamiliarity(s, first, RAN.FAMILIARITY_MARK.DIFFICULTY); // examiner corrects out-of-band
        assert.strictEqual(s.familiarity.assistanceGiven[first], 1);
        s = P.markFamiliarity(s, first, RAN.FAMILIARITY_MARK.KNOWN); // re-presented, now consistent
        s = markAllKnown(s); // mark the rest too
        s = P.finalizeFamiliarityCheck(s);
        assert.strictEqual(s.state, RAN.PREP_STATE.PRACTICE, 'a corrected-then-reconfirmed stimulus should not block passing');
    });

    console.log('Practice:');

    test(`[${assessmentId}] Practice PASS on first attempt -> READY_FOR_TIMED_ASSESSMENT`, () => {
        let s = passFamiliarity(assessmentId);
        assert.strictEqual(s.practice.attemptNumber, 1);
        s = checkAllPracticeItems(s);
        s = P.completePractice(s);
        assert.strictEqual(s.state, RAN.PREP_STATE.READY_FOR_TIMED_ASSESSMENT);
    });

    test(`[${assessmentId}] completePractice throws if checklist incomplete`, () => {
        let s = passFamiliarity(assessmentId);
        s = P.setPracticeChecklistItem(s, 'startPosition', true);
        // leftToRight/rowTransition left false
        assert.throws(() => P.completePractice(s), /not fully confirmed/);
    });

    test(`[${assessmentId}] Practice retry: attempt 1 fails procedurally, attempt 2 passes -> READY_FOR_TIMED_ASSESSMENT`, () => {
        let s = passFamiliarity(assessmentId);
        assert.strictEqual(s.practice.attemptNumber, 1);
        s = P.setPracticeChecklistItem(s, 'startPosition', true); // partial, not enough to pass
        s = P.retryPractice(s);
        assert.strictEqual(s.practice.attemptNumber, 2);
        assert.strictEqual(s.practice.checklist.startPosition, false, 'checklist resets on retry');
        s = checkAllPracticeItems(s);
        s = P.completePractice(s);
        assert.strictEqual(s.state, RAN.PREP_STATE.READY_FOR_TIMED_ASSESSMENT);
    });

    test(`[${assessmentId}] retryPractice only allowed once (no unlimited repeats)`, () => {
        let s = passFamiliarity(assessmentId);
        s = P.retryPractice(s); // attempt 2 — allowed
        assert.throws(() => P.retryPractice(s), /already used the one allowed retry/); // attempt 3 — not allowed
    });

    test(`[${assessmentId}] Practice FAIL after the second attempt -> PREPARATION_FAILED/SERIAL_PROCEDURE_NOT_ESTABLISHED`, () => {
        let s = passFamiliarity(assessmentId);
        s = P.retryPractice(s); // now at attempt 2
        s = P.failSerialProcedure(s);
        assert.strictEqual(s.state, RAN.PREP_STATE.PREPARATION_FAILED);
        assert.strictEqual(s.failureReason, RAN.PREPARATION_FAILURE_REASON.SERIAL_PROCEDURE_NOT_ESTABLISHED);
    });

    test(`[${assessmentId}] failSerialProcedure cannot be called before the retry is used (no early bailout)`, () => {
        let s = passFamiliarity(assessmentId); // still attempt 1
        assert.throws(() => P.failSerialProcedure(s), /retry .* must be used/);
    });

    test(`[${assessmentId}] return from Practice to Familiarity (naming uncertainty) resets both familiarity and practice`, () => {
        let s = passFamiliarity(assessmentId);
        s = P.setPracticeChecklistItem(s, 'startPosition', true);
        s = P.returnToFamiliarityFromPractice(s);
        assert.strictEqual(s.state, RAN.PREP_STATE.FAMILIARITY);
        const definition = RAN.getDefinition(assessmentId);
        definition.stimuli.forEach(stim => assert.strictEqual(s.familiarity.marks[stim], null));
        assert.strictEqual(s.practice.attemptNumber, 0);
        assert.deepStrictEqual(s.practice.checklist, { startPosition: false, leftToRight: false, rowTransition: false });
    });

    test(`[${assessmentId}] after returning to Familiarity from Practice, a fresh pass restarts Practice at attempt 1`, () => {
        let s = passFamiliarity(assessmentId);
        s = P.retryPractice(s); // attempt 2
        s = P.returnToFamiliarityFromPractice(s);
        s = markAllKnown(s);
        s = P.finalizeFamiliarityCheck(s);
        assert.strictEqual(s.state, RAN.PREP_STATE.PRACTICE);
        assert.strictEqual(s.practice.attemptNumber, 1, 'attempt count must not carry over from before the return-to-Familiarity');
    });

    console.log('No skip / no bypass:');

    test(`[${assessmentId}] cannot mark familiarity before beginFamiliarity (wrong state)`, () => {
        const s = P.createSession(assessmentId); // still ASSESSMENT_SELECTED
        assert.throws(() => P.markFamiliarity(s, RAN.getDefinition(assessmentId).stimuli[0], RAN.FAMILIARITY_MARK.KNOWN), /expected state/);
    });

    test(`[${assessmentId}] cannot reach PRACTICE without passing through FAMILIARITY (no direct-completePractice from ASSESSMENT_SELECTED)`, () => {
        const s = P.createSession(assessmentId);
        assert.throws(() => P.completePractice(s), /expected state/);
    });

    test(`[${assessmentId}] cannot reach READY_FOR_TIMED_ASSESSMENT from ASSESSMENT_SELECTED directly`, () => {
        const s = P.createSession(assessmentId);
        assert.notStrictEqual(s.state, RAN.PREP_STATE.READY_FOR_TIMED_ASSESSMENT);
        assert.throws(() => P.completePractice(s));
    });

    test(`[${assessmentId}] cannot reach READY_FOR_TIMED_ASSESSMENT from FAMILIARITY directly`, () => {
        const s = P.beginFamiliarity(P.createSession(assessmentId));
        assert.throws(() => P.completePractice(s), /expected state/);
    });

    test(`[${assessmentId}] cannot repeatFamiliarityCheck when the failure was SERIAL_PROCEDURE_NOT_ESTABLISHED (no such spec action)`, () => {
        let s = passFamiliarity(assessmentId);
        s = P.retryPractice(s);
        s = P.failSerialProcedure(s);
        assert.throws(() => P.repeatFamiliarityCheck(s), /only valid after a FAMILIARITY_NOT_ESTABLISHED failure/);
    });

    test(`[${assessmentId}] no third Practice attempt is ever reachable — attemptNumber never exceeds 2 (protects against overtraining)`, () => {
        let s = passFamiliarity(assessmentId); // attempt 1
        s = P.retryPractice(s); // attempt 2 — the one allowed retry
        assert.strictEqual(s.practice.attemptNumber, 2);
        assert.throws(() => P.retryPractice(s), /already used the one allowed retry/); // no attempt 3
        assert.strictEqual(s.practice.attemptNumber, 2, 'a rejected retryPractice call must not silently advance the count');
    });

    test(`[${assessmentId}] after SERIAL_PROCEDURE_NOT_ESTABLISHED, the only reachable action is endPreparation (session terminates, no further Practice/Familiarity)`, () => {
        let s = passFamiliarity(assessmentId);
        s = P.retryPractice(s);
        s = P.failSerialProcedure(s);
        assert.strictEqual(s.state, RAN.PREP_STATE.PREPARATION_FAILED);
        assert.strictEqual(s.failureReason, RAN.PREPARATION_FAILURE_REASON.SERIAL_PROCEDURE_NOT_ESTABLISHED);
        // every other transition function must reject this session —
        // the only legal next call is endPreparation.
        assert.throws(() => P.repeatFamiliarityCheck(s));
        assert.throws(() => P.beginFamiliarity(s));
        assert.throws(() => P.retryPractice(s));
        const ended = P.endPreparation(s);
        assert.strictEqual(ended.terminated, true);
    });

    console.log('No timer / no scoring:');

    test(`[${assessmentId}] a preparation session never carries durationMs, score, or any RAN.STATUS value`, () => {
        let s = passFamiliarity(assessmentId);
        s = checkAllPracticeItems(s);
        s = P.completePractice(s);
        const json = JSON.stringify(s);
        assert.ok(!('durationMs' in s));
        assert.ok(!('independentCorrect' in s));
        assert.ok(!json.includes('COMPLETED'), 'preparation state must never contain an administration STATUS value');
    });

    test(`[${assessmentId}] createSession/markFamiliarity/setPracticeChecklistItem introduce no timers (no setTimeout/Date usage in this module)`, () => {
        // Static check: the module source itself must not reference timing
        // primitives — Familiarity/Practice are explicitly examiner-judged
        // with no time component (spec §14, §19, §22).
        const src = require('fs').readFileSync(path.join(__dirname, '..', 'js', 'ran_preparation.js'), 'utf8');
        assert.ok(!/setTimeout|setInterval|Date\.now|performance\.now/.test(src));
    });
});

/* ============================================================ */
console.log(`\n${passed} passed, ${process.exitCode === 1 ? 'with failures above' : '0 failed'}`);
if (process.exitCode !== 1) console.log('ALL TESTS PASSED');
