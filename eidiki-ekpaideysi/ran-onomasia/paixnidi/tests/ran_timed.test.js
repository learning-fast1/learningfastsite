/* ============================================================
   RAN — Phase 3 timed-assessment record-building tests (plain Node)
   Run with: node ran_timed.test.js
   ============================================================ */
'use strict';
const assert = require('assert');
const path = require('path');

require(path.join(__dirname, '..', 'js', 'ran_definitions.js'));
require(path.join(__dirname, '..', 'js', 'ran_engine.js'));
require(path.join(__dirname, '..', 'js', 'ran_preparation.js'));
const RAN = require(path.join(__dirname, '..', 'js', 'ran_timed.js'));

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

console.log('RAN timed — Phase 3 tests\n');

const P = RAN.preparation;
function readySession(assessmentId) {
    let s = P.beginFamiliarity(P.createSession(assessmentId));
    RAN.getDefinition(assessmentId).stimuli.forEach(stim => { s = P.markFamiliarity(s, stim, RAN.FAMILIARITY_MARK.KNOWN); });
    s = P.finalizeFamiliarityCheck(s);
    s = P.setPracticeChecklistItem(s, 'startPosition', true);
    s = P.setPracticeChecklistItem(s, 'leftToRight', true);
    s = P.setPracticeChecklistItem(s, 'rowTransition', true);
    return P.completePractice(s);
}

function baseCompletedInput(overrides) {
    return Object.assign({
        studentId: 'stu_test01',
        assessmentId: 'RAN_DIGITS_V1',
        form: 'A',
        durationMs: 18420,
        substitutions: 1,
    }, overrides || {});
}

console.log('canBegin gate:');

['RAN_DIGITS_V1', 'RAN_COLORS_V1', 'RAN_OBJECTS_V1'].forEach(assessmentId => {
    test(`[${assessmentId}] canBegin is true only once READY_FOR_TIMED_ASSESSMENT is reached`, () => {
        assert.strictEqual(RAN.timed.canBegin(P.createSession(assessmentId)), false);
        assert.strictEqual(RAN.timed.canBegin(P.beginFamiliarity(P.createSession(assessmentId))), false);
        assert.strictEqual(RAN.timed.canBegin(readySession(assessmentId)), true);
    });

    test(`[${assessmentId}] canBegin is false for a terminated session`, () => {
        let s = P.beginFamiliarity(P.createSession(assessmentId));
        s = P.markFamiliarity(s, RAN.getDefinition(assessmentId).stimuli[0], RAN.FAMILIARITY_MARK.DIFFICULTY);
        s = P.finalizeFamiliarityCheck(s);
        s = P.endPreparation(s);
        assert.strictEqual(RAN.timed.canBegin(s), false);
    });

    test(`[${assessmentId}] canBegin is false for null/undefined session`, () => {
        assert.strictEqual(RAN.timed.canBegin(null), false);
        assert.strictEqual(RAN.timed.canBegin(undefined), false);
    });
});

console.log('\nEphemeral studentId generation (Phase 3 correction pass):');

test('generateEphemeralStudentId returns a non-empty string', () => {
    const id = RAN.timed.generateEphemeralStudentId();
    assert.strictEqual(typeof id, 'string');
    assert.ok(id.length > 0);
});

test('generateEphemeralStudentId returns a different id on each call (no collisions in practice)', () => {
    const a = RAN.timed.generateEphemeralStudentId();
    const b = RAN.timed.generateEphemeralStudentId();
    assert.notStrictEqual(a, b);
});

test('generateEphemeralStudentId contains no obviously personal data (just a technical id shape)', () => {
    const id = RAN.timed.generateEphemeralStudentId();
    assert.ok(/^stu_[a-z0-9-]+$/i.test(id), `unexpected id shape: ${id}`);
});

console.log('\nCompleted administration:');

test('buildCompletedAdministration: clean run (no procedural events) -> COMPLETED', () => {
    const { administration, validationProblems } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ substitutions: 0 }));
    assert.strictEqual(administration.status, RAN.STATUS.COMPLETED);
    assert.deepStrictEqual(validationProblems, []);
});

test('buildCompletedAdministration: sequenceLoss=true -> COMPLETED_FLAGGED', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ sequenceLoss: true }));
    assert.strictEqual(administration.status, RAN.STATUS.COMPLETED_FLAGGED);
});

test('buildCompletedAdministration: examinerRedirects > 0 -> COMPLETED_FLAGGED', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ examinerRedirects: 1 }));
    assert.strictEqual(administration.status, RAN.STATUS.COMPLETED_FLAGGED);
});

test('buildCompletedAdministration: examinerRedirects = 0 and sequenceLoss = false -> plain COMPLETED', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ examinerRedirects: 0, sequenceLoss: false }));
    assert.strictEqual(administration.status, RAN.STATUS.COMPLETED);
});

/* ---- examinerProvidedAnswers (Scientific Protocol Correction: 3-second rule) ---- */

test('buildCompletedAdministration: examinerProvidedAnswers is preserved as its own raw field', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ examinerProvidedAnswers: 3 }));
    assert.strictEqual(administration.examinerProvidedAnswers, 3);
});

test('buildCompletedAdministration: examinerProvidedAnswers defaults to 0 when not supplied', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput());
    assert.strictEqual(administration.examinerProvidedAnswers, 0);
});

// Scientific Protocol Correction decision §4 (locked): examinerProvidedAnswers
// > 0 now joins sequenceLoss/examinerRedirects in hadProceduralEvent -> flags
// the record COMPLETED_FLAGGED, but never auto-sets the OTHER two fields —
// they stay at whatever the caller independently passed.
test('buildCompletedAdministration: examinerProvidedAnswers never auto-sets sequenceLoss or examinerRedirects', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({
        examinerProvidedAnswers: 4, sequenceLoss: false, examinerRedirects: 0,
    }));
    assert.strictEqual(administration.sequenceLoss, false);
    assert.strictEqual(administration.examinerRedirects, 0);
    assert.strictEqual(administration.examinerProvidedAnswers, 4);
});

test('buildCompletedAdministration: examinerProvidedAnswers > 0 alone -> COMPLETED_FLAGGED (decision §4)', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({
        examinerProvidedAnswers: 1, sequenceLoss: false, examinerRedirects: 0,
    }));
    assert.strictEqual(administration.status, RAN.STATUS.COMPLETED_FLAGGED);
});

test('buildCompletedAdministration: examinerProvidedAnswers = 0, no other procedural event -> plain COMPLETED', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({
        examinerProvidedAnswers: 0, sequenceLoss: false, examinerRedirects: 0,
    }));
    assert.strictEqual(administration.status, RAN.STATUS.COMPLETED);
});

test('buildCompletedAdministration: examinerProvidedAnswers alone never produces INVALID (no numeric cutoff — decision §4)', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({
        examinerProvidedAnswers: 20, substitutions: 0, omissions: 0,
    }));
    assert.strictEqual(administration.status, RAN.STATUS.COMPLETED_FLAGGED);
    assert.notStrictEqual(administration.status, RAN.STATUS.INVALID);
});

test('buildCompletedAdministration: examinerProvidedAnswers is independent from substitutions/omissions (no overloading)', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({
        examinerProvidedAnswers: 2, substitutions: 1, omissions: 1,
    }));
    assert.strictEqual(administration.examinerProvidedAnswers, 2);
    assert.strictEqual(administration.substitutions, 1);
    assert.strictEqual(administration.omissions, 1);
});

test('buildCompletedAdministration: durationMs is rounded to the nearest integer ms', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ durationMs: 18420.4 }));
    assert.strictEqual(administration.durationMs, 18420);
    const { administration: a2 } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ durationMs: 18420.6 }));
    assert.strictEqual(a2.durationMs, 18421);
    assert.ok(Number.isInteger(a2.durationMs));
});

test('buildCompletedAdministration: independentCorrect is derived (never taken as raw input) — matches locked formula', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ substitutions: 2, omissions: 1 }));
    assert.strictEqual(administration.independentCorrect, 17); // 20 - 2 - 1 - 0
});

test('buildCompletedAdministration: independentCorrect also subtracts examinerProvidedAnswers', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ substitutions: 2, omissions: 1, examinerProvidedAnswers: 3 }));
    assert.strictEqual(administration.independentCorrect, 14); // 20 - 2 - 1 - 3
});

test('buildCompletedAdministration: familiarityPassed/practicePassed are true (we only reach here after both)', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput());
    assert.strictEqual(administration.familiarityPassed, true);
    assert.strictEqual(administration.practicePassed, true);
});

test('buildCompletedAdministration: stimulusSequence matches the fixed form exactly (no runtime randomization)', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ assessmentId: 'RAN_DIGITS_V1', form: 'B' }));
    assert.deepStrictEqual(administration.stimulusSequence, RAN.flattenForm(RAN.getDefinition('RAN_DIGITS_V1'), 'B'));
});

test('buildCompletedAdministration: works for RAN_COLORS_V1 too', () => {
    const { administration, validationProblems } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ assessmentId: 'RAN_COLORS_V1' }));
    assert.strictEqual(administration.assessmentType, 'colors');
    assert.deepStrictEqual(validationProblems, []);
});

console.log('\nsequenceLoss / examinerRedirects decoupling (Phase 3 correction pass — status consequence):');

test('sequenceLoss=true, examinerRedirects=0 -> COMPLETED_FLAGGED, examinerRedirects stays 0', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ substitutions: 0, sequenceLoss: true, examinerRedirects: 0 }));
    assert.strictEqual(administration.status, RAN.STATUS.COMPLETED_FLAGGED);
    assert.strictEqual(administration.sequenceLoss, true);
    assert.strictEqual(administration.examinerRedirects, 0);
});

test('sequenceLoss=false, examinerRedirects=1 -> COMPLETED_FLAGGED, sequenceLoss stays false', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ substitutions: 0, sequenceLoss: false, examinerRedirects: 1 }));
    assert.strictEqual(administration.status, RAN.STATUS.COMPLETED_FLAGGED);
    assert.strictEqual(administration.sequenceLoss, false);
    assert.strictEqual(administration.examinerRedirects, 1);
});

test('sequenceLoss=true AND examinerRedirects>0 together -> still just COMPLETED_FLAGGED (not a different status)', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ substitutions: 0, sequenceLoss: true, examinerRedirects: 3 }));
    assert.strictEqual(administration.status, RAN.STATUS.COMPLETED_FLAGGED);
    assert.strictEqual(administration.sequenceLoss, true);
    assert.strictEqual(administration.examinerRedirects, 3);
});

test('multiple redirects are stored exactly as given (no coupling side effect on the count itself)', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ substitutions: 0, examinerRedirects: 5 }));
    assert.strictEqual(administration.examinerRedirects, 5);
    assert.strictEqual(administration.sequenceLoss, false, 'examinerRedirects must never auto-set sequenceLoss');
});

test('neither sequenceLoss nor examinerRedirects, no other flags -> plain COMPLETED', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ substitutions: 0, omissions: 0, sequenceLoss: false, examinerRedirects: 0 }));
    assert.strictEqual(administration.status, RAN.STATUS.COMPLETED);
});

test('buildCompletedAdministration: a bad count (substitutions+omissions+examinerProvidedAnswers > totalStimuli) surfaces via validationProblems, not a thrown error', () => {
    const { administration, validationProblems } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ substitutions: 15, omissions: 10 }));
    assert.ok(administration); // record is still built/returned
    assert.ok(validationProblems.some(p => p.includes('substitutions + omissions + examinerProvidedAnswers')));
});

test('buildCompletedAdministration: boundary where substitutions+omissions+examinerProvidedAnswers = totalStimuli (20) is accepted', () => {
    const { administration, validationProblems } = RAN.timed.buildCompletedAdministration(
        baseCompletedInput({ substitutions: 10, omissions: 5, examinerProvidedAnswers: 5 })
    );
    assert.strictEqual(administration.independentCorrect, 0);
    assert.deepStrictEqual(validationProblems, []);
});

test('buildCompletedAdministration: rejected when the sum exceeds totalStimuli via examinerProvidedAnswers specifically', () => {
    const { validationProblems } = RAN.timed.buildCompletedAdministration(
        baseCompletedInput({ substitutions: 10, omissions: 5, examinerProvidedAnswers: 6 }) // 21 > 20
    );
    assert.ok(validationProblems.some(p => p.includes('substitutions + omissions + examinerProvidedAnswers')));
});

console.log('\nAborted administration — INCOMPLETE:');

test('buildAbortedAdministration: INCOMPLETE with a valid reason', () => {
    const { administration, validationProblems } = RAN.timed.buildAbortedAdministration({
        studentId: 'stu01', assessmentId: 'RAN_DIGITS_V1', form: 'A',
        reasonCategory: 'incomplete', reason: RAN.INCOMPLETE_REASON.CHILD_STOPPED_PARTICIPATING,
    });
    assert.strictEqual(administration.status, RAN.STATUS.INCOMPLETE);
    assert.strictEqual(administration.incompleteReason, RAN.INCOMPLETE_REASON.CHILD_STOPPED_PARTICIPATING);
    assert.strictEqual(administration.invalidReason, null);
    assert.deepStrictEqual(validationProblems, []);
});

test('buildAbortedAdministration: INCOMPLETE with an invalid reason string throws', () => {
    assert.throws(() => RAN.timed.buildAbortedAdministration({
        studentId: 'stu01', assessmentId: 'RAN_DIGITS_V1', form: 'A',
        reasonCategory: 'incomplete', reason: 'NOT_A_REAL_REASON',
    }), /invalid INCOMPLETE reason/);
});

test('buildAbortedAdministration: INCOMPLETE never produces a rate-eligible record (no durationMs required)', () => {
    const { administration, validationProblems } = RAN.timed.buildAbortedAdministration({
        studentId: 'stu01', assessmentId: 'RAN_DIGITS_V1', form: 'A',
        reasonCategory: 'incomplete', reason: RAN.INCOMPLETE_REASON.TECHNICAL_ISSUE,
    });
    assert.strictEqual(administration.durationMs, null);
    assert.deepStrictEqual(validationProblems, []);
    const results = RAN.calcResults(administration);
    assert.strictEqual(results.rateEligible, false);
    assert.strictEqual(results.independentNamingRate, null);
});

console.log('\nAborted administration — INVALID:');

test('buildAbortedAdministration: INVALID with a valid reason', () => {
    const { administration, validationProblems } = RAN.timed.buildAbortedAdministration({
        studentId: 'stu01', assessmentId: 'RAN_COLORS_V1', form: 'B',
        reasonCategory: 'invalid', reason: RAN.INVALID_REASON.BROWSER_REFRESH,
    });
    assert.strictEqual(administration.status, RAN.STATUS.INVALID);
    assert.strictEqual(administration.invalidReason, RAN.INVALID_REASON.BROWSER_REFRESH);
    assert.strictEqual(administration.incompleteReason, null);
    assert.deepStrictEqual(validationProblems, []);
});

test('buildAbortedAdministration: examinerProvidedAnswers is preserved as raw data even on an aborted run', () => {
    const { administration } = RAN.timed.buildAbortedAdministration({
        studentId: 'stu01', assessmentId: 'RAN_COLORS_V1', form: 'B',
        reasonCategory: 'invalid', reason: RAN.INVALID_REASON.BROWSER_REFRESH,
        examinerProvidedAnswers: 2,
    });
    assert.strictEqual(administration.examinerProvidedAnswers, 2);
});

test('buildAbortedAdministration: INVALID with an invalid reason string throws', () => {
    assert.throws(() => RAN.timed.buildAbortedAdministration({
        studentId: 'stu01', assessmentId: 'RAN_DIGITS_V1', form: 'A',
        reasonCategory: 'invalid', reason: 'NOT_A_REAL_REASON',
    }), /invalid INVALID reason/);
});

test('buildAbortedAdministration: unknown reasonCategory throws', () => {
    assert.throws(() => RAN.timed.buildAbortedAdministration({
        studentId: 'stu01', assessmentId: 'RAN_DIGITS_V1', form: 'A',
        reasonCategory: 'oops', reason: 'x',
    }), /reasonCategory must be/);
});

test('buildAbortedAdministration: never produces a rate-eligible record even with a partial duration stored', () => {
    const { administration } = RAN.timed.buildAbortedAdministration({
        studentId: 'stu01', assessmentId: 'RAN_DIGITS_V1', form: 'A',
        reasonCategory: 'invalid', reason: RAN.INVALID_REASON.ACCIDENTAL_TIMER_STOP,
        partialDurationMs: 9000.5,
    });
    assert.strictEqual(administration.durationMs, 9001); // stored, rounded — informational only
    const results = RAN.calcResults(administration);
    assert.strictEqual(results.rateEligible, false, 'INVALID must never be rate-eligible regardless of stored durationMs');
    assert.strictEqual(results.independentNamingRate, null);
});

test('buildAbortedAdministration: preserves familiarityPassed/practicePassed = true (the flow reached READY_FOR_TIMED_ASSESSMENT before aborting)', () => {
    const { administration } = RAN.timed.buildAbortedAdministration({
        studentId: 'stu01', assessmentId: 'RAN_DIGITS_V1', form: 'A',
        reasonCategory: 'incomplete', reason: RAN.INCOMPLETE_REASON.EXTERNAL_INTERRUPTION,
    });
    assert.strictEqual(administration.familiarityPassed, true);
    assert.strictEqual(administration.practicePassed, true);
});

/* ============================================================
   POST-TRIAL CORRECTION (item 15) — examinerReviewAdjusted.
   ran_ui.js renderTimedErrorCapture is the only caller that computes
   this flag (by comparing the reviewed/final values against the
   live-recorded `run.*` ones); buildCompletedAdministration itself
   just forwards whatever boolean it's given, verbatim.
   ============================================================ */
console.log('\nPost-trial correction (examinerReviewAdjusted):');

test('buildCompletedAdministration: examinerReviewAdjusted defaults to false when not supplied', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput());
    assert.strictEqual(administration.examinerReviewAdjusted, false);
});

test('buildCompletedAdministration: examinerReviewAdjusted is forwarded verbatim when true', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ examinerReviewAdjusted: true }));
    assert.strictEqual(administration.examinerReviewAdjusted, true);
});

test('examinerReviewAdjusted does not affect status derivation — only sequenceLoss/examinerRedirects/examinerProvidedAnswers do', () => {
    // A reviewed-but-unchanged record (examinerReviewAdjusted: true, but
    // zero procedural events) must still be plain COMPLETED, not
    // COMPLETED_FLAGGED — the flag is purely a "was this reviewed and
    // edited" marker, never itself a procedural event.
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({
        examinerReviewAdjusted: true, sequenceLoss: false,
    }));
    assert.strictEqual(administration.status, RAN.STATUS.COMPLETED);
});

test('examinerReviewAdjusted does not change durationMs/stimulusSequence/independentCorrect derivation', () => {
    const unreviewed = RAN.timed.buildCompletedAdministration(baseCompletedInput({ substitutions: 2 })).administration;
    const reviewed = RAN.timed.buildCompletedAdministration(baseCompletedInput({ substitutions: 2, examinerReviewAdjusted: true })).administration;
    assert.strictEqual(reviewed.durationMs, unreviewed.durationMs);
    assert.deepStrictEqual(reviewed.stimulusSequence, unreviewed.stimulusSequence);
    assert.strictEqual(reviewed.independentCorrect, unreviewed.independentCorrect);
});

test('a corrected sequenceLoss/examinerRedirects/examinerProvidedAnswers value correctly flips status/flagging (recompute follows the FINAL value, not a live one)', () => {
    // Simulates: live-recorded sequenceLoss=false, examiner corrects it
    // to true during review — buildCompletedAdministration only ever
    // sees the FINAL value (this module has no notion of "live" vs
    // "reviewed" itself), so status must reflect the corrected input.
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({
        substitutions: 0, sequenceLoss: true, examinerReviewAdjusted: true,
    }));
    assert.strictEqual(administration.status, RAN.STATUS.COMPLETED_FLAGGED);
    assert.strictEqual(administration.sequenceLoss, true);
});

test('RAN.validateAdministration rejects a non-boolean examinerReviewAdjusted', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput());
    administration.examinerReviewAdjusted = 'yes';
    const problems = RAN.validateAdministration(administration);
    assert.ok(problems.some(p => p.includes('examinerReviewAdjusted')));
});

test('RAN.calcResults exposes examinerReviewAdjusted as a plain passthrough (never affects rateEligible/independentNamingRate)', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ examinerReviewAdjusted: true }));
    const results = RAN.calcResults(administration);
    assert.strictEqual(results.examinerReviewAdjusted, true);
    assert.strictEqual(results.rateEligible, true);
});

/* ============================================================
   ITEM 16 — familiarityRetriesUsed forwarding. ran_timed.js never
   touches RAN.preparation state itself; it just forwards whatever
   number (or null) the caller (ran_ui.js, reading session.familiarity.
   retriesUsed) passes in.
   ============================================================ */
console.log('\nItem 16 — familiarityRetriesUsed forwarding:');

test('buildCompletedAdministration: familiarityRetriesUsed defaults to null when not supplied', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput());
    assert.strictEqual(administration.familiarityRetriesUsed, null);
});

[0, 1, 2, 5].forEach(n => {
    test(`buildCompletedAdministration: familiarityRetriesUsed=${n} is forwarded verbatim`, () => {
        const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput({ familiarityRetriesUsed: n }));
        assert.strictEqual(administration.familiarityRetriesUsed, n);
    });
});

test('buildCompletedAdministration: familiarityRetriesUsed does not affect status/independentCorrect/durationMs derivation', () => {
    const zero = RAN.timed.buildCompletedAdministration(baseCompletedInput({ substitutions: 1, familiarityRetriesUsed: 0 })).administration;
    const three = RAN.timed.buildCompletedAdministration(baseCompletedInput({ substitutions: 1, familiarityRetriesUsed: 3 })).administration;
    assert.strictEqual(zero.status, three.status);
    assert.strictEqual(zero.independentCorrect, three.independentCorrect);
    assert.strictEqual(zero.durationMs, three.durationMs);
});

test('buildAbortedAdministration: familiarityRetriesUsed is forwarded verbatim too (context survives an aborted run)', () => {
    const { administration } = RAN.timed.buildAbortedAdministration({
        studentId: 'stu01', assessmentId: 'RAN_DIGITS_V1', form: 'A',
        reasonCategory: 'incomplete', reason: RAN.INCOMPLETE_REASON.CHILD_STOPPED_PARTICIPATING,
        familiarityRetriesUsed: 2,
    });
    assert.strictEqual(administration.familiarityRetriesUsed, 2);
});

test('buildAbortedAdministration: familiarityRetriesUsed defaults to null when not supplied', () => {
    const { administration } = RAN.timed.buildAbortedAdministration({
        studentId: 'stu01', assessmentId: 'RAN_DIGITS_V1', form: 'A',
        reasonCategory: 'invalid', reason: RAN.INVALID_REASON.TECHNICAL_MALFUNCTION,
    });
    assert.strictEqual(administration.familiarityRetriesUsed, null);
});

test('RAN.validateAdministration rejects a negative or non-integer familiarityRetriesUsed', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput());
    administration.familiarityRetriesUsed = -1;
    assert.ok(RAN.validateAdministration(administration).some(p => p.includes('familiarityRetriesUsed')));
    administration.familiarityRetriesUsed = 1.5;
    assert.ok(RAN.validateAdministration(administration).some(p => p.includes('familiarityRetriesUsed')));
});

test('RAN.validateAdministration tolerates a MISSING familiarityRetriesUsed (legacy record predating this field)', () => {
    const { administration } = RAN.timed.buildCompletedAdministration(baseCompletedInput());
    delete administration.familiarityRetriesUsed;
    assert.deepStrictEqual(RAN.validateAdministration(administration), []);
});

/* ============================================================ */
console.log(`\n${passed} passed, ${process.exitCode === 1 ? 'with failures above' : '0 failed'}`);
if (process.exitCode !== 1) console.log('ALL TESTS PASSED');
