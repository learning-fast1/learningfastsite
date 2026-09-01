/* ============================================================
   RAN — Phase 1 engine tests (plain Node, no framework)

   Run with: node ran_engine.test.js
   Exits with code 1 if any assertion fails, 0 if all pass — no test
   runner/dependency needed, matching this repo's zero-tooling
   convention (no package.json, no npm install anywhere in the site).
   ============================================================ */
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');

require(path.join(__dirname, '..', 'js', 'ran_definitions.js'));
const RAN = require(path.join(__dirname, '..', 'js', 'ran_engine.js'));

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

console.log('RAN engine — Phase 1 (+ correction pass) tests\n');

/* ============================================================
   FORMS — exact counts + exact sequences match the specification
   verbatim (spec §10, §11, §71 "Forms")
   ============================================================ */
console.log('Forms:');

test('RAN_DIGITS_V1 exists with version 1 and 2 forms', () => {
    const def = RAN.getDefinition('RAN_DIGITS_V1');
    assert.strictEqual(def.version, 1);
    assert.deepStrictEqual(Object.keys(def.forms).sort(), ['A', 'B']);
});

test('RAN_COLORS_V1 exists with version 1 and 2 forms', () => {
    const def = RAN.getDefinition('RAN_COLORS_V1');
    assert.strictEqual(def.version, 1);
    assert.deepStrictEqual(Object.keys(def.forms).sort(), ['A', 'B']);
});

test('unknown assessment ID throws', () => {
    assert.throws(() => RAN.getDefinition('RAN_NOPE_V1'));
});

test('RAN_OBJECTS_V1 exists with version 1 and 2 forms', () => {
    const def = RAN.getDefinition('RAN_OBJECTS_V1');
    assert.strictEqual(def.version, 1);
    assert.deepStrictEqual(Object.keys(def.forms).sort(), ['A', 'B']);
});

['RAN_DIGITS_V1', 'RAN_COLORS_V1', 'RAN_OBJECTS_V1'].forEach(id => {
    ['A', 'B'].forEach(form => {
        test(`${id} Form ${form}: exactly 20 items, 4×5 layout, 4 per stimulus`, () => {
            const def = RAN.getDefinition(id);
            const flat = RAN.flattenForm(def, form);
            assert.strictEqual(flat.length, 20);
            assert.strictEqual(def.forms[form].length, 4, 'expected 4 rows');
            def.forms[form].forEach(row => assert.strictEqual(row.length, 5, 'expected 5 columns'));

            const counts = {};
            flat.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
            def.stimuli.forEach(s => assert.strictEqual(counts[s], 4, `stimulus ${s} should appear 4 times`));
        });
    });
});

test('RAN.validateAllDefinitions() reports every registered form as valid', () => {
    const result = RAN.validateAllDefinitions();
    assert.strictEqual(result.valid, true, JSON.stringify(result.problems));
});

test('RAN_DIGITS_V1 Form A sequence matches spec §10 exactly', () => {
    const def = RAN.getDefinition('RAN_DIGITS_V1');
    assert.deepStrictEqual(def.forms.A, [
        ['2', '5', '1', '4', '3'],
        ['4', '2', '5', '3', '1'],
        ['3', '1', '4', '5', '2'],
        ['5', '3', '2', '1', '4'],
    ]);
});

test('RAN_DIGITS_V1 Form B sequence matches spec §10 exactly', () => {
    const def = RAN.getDefinition('RAN_DIGITS_V1');
    assert.deepStrictEqual(def.forms.B, [
        ['3', '1', '5', '2', '4'],
        ['5', '4', '2', '1', '3'],
        ['2', '5', '3', '4', '1'],
        ['4', '2', '1', '3', '5'],
    ]);
});

test('RAN_COLORS_V1 Form A sequence matches spec §11 exactly', () => {
    const def = RAN.getDefinition('RAN_COLORS_V1');
    assert.deepStrictEqual(def.forms.A, [
        ['BLUE', 'RED', 'YELLOW', 'GREEN', 'BLACK'],
        ['GREEN', 'YELLOW', 'BLUE', 'BLACK', 'RED'],
        ['BLACK', 'BLUE', 'RED', 'YELLOW', 'GREEN'],
        ['YELLOW', 'BLACK', 'GREEN', 'RED', 'BLUE'],
    ]);
});

test('RAN_COLORS_V1 Form B sequence matches spec §11 exactly', () => {
    const def = RAN.getDefinition('RAN_COLORS_V1');
    assert.deepStrictEqual(def.forms.B, [
        ['GREEN', 'BLACK', 'RED', 'BLUE', 'YELLOW'],
        ['RED', 'GREEN', 'YELLOW', 'BLACK', 'BLUE'],
        ['BLUE', 'YELLOW', 'BLACK', 'GREEN', 'RED'],
        ['BLACK', 'BLUE', 'GREEN', 'YELLOW', 'RED'],
    ]);
});

test('RAN_COLORS_V1 verbal labels match spec §3/§11 exactly', () => {
    const def = RAN.getDefinition('RAN_COLORS_V1');
    assert.deepStrictEqual(def.stimulusLabels, {
        RED: 'κόκκινο', BLUE: 'μπλε', GREEN: 'πράσινο', YELLOW: 'κίτρινο', BLACK: 'μαύρο',
    });
});

test('RAN_OBJECTS_V1 Form A sequence matches the locked data exactly', () => {
    const def = RAN.getDefinition('RAN_OBJECTS_V1');
    assert.deepStrictEqual(def.forms.A, [
        ['vase', 'gift', 'ball', 'apple', 'hen'],
        ['ball', 'apple', 'hen', 'vase', 'gift'],
        ['hen', 'vase', 'gift', 'ball', 'apple'],
        ['gift', 'ball', 'apple', 'hen', 'vase'],
    ]);
});

test('RAN_OBJECTS_V1 Form B sequence matches the locked data exactly', () => {
    const def = RAN.getDefinition('RAN_OBJECTS_V1');
    assert.deepStrictEqual(def.forms.B, [
        ['hen', 'ball', 'apple', 'vase', 'gift'],
        ['apple', 'vase', 'gift', 'hen', 'ball'],
        ['gift', 'hen', 'ball', 'apple', 'vase'],
        ['ball', 'apple', 'vase', 'gift', 'hen'],
    ]);
});

test('RAN_OBJECTS_V1 Form A and Form B share no identical row (not a copy of each other)', () => {
    const def = RAN.getDefinition('RAN_OBJECTS_V1');
    def.forms.A.forEach(rowA => {
        def.forms.B.forEach(rowB => {
            assert.notDeepStrictEqual(rowA, rowB);
        });
    });
});

test('RAN_OBJECTS_V1 has exactly 5 canonical stimuli with fixed internal IDs', () => {
    const def = RAN.getDefinition('RAN_OBJECTS_V1');
    assert.deepStrictEqual(def.stimuli, ['apple', 'hen', 'vase', 'gift', 'ball']);
});

test('RAN_OBJECTS_V1 verbal labels match the locked canonical mapping exactly', () => {
    const def = RAN.getDefinition('RAN_OBJECTS_V1');
    assert.deepStrictEqual(def.stimulusLabels, {
        apple: 'μήλο', hen: 'κότα', vase: 'βάζο', gift: 'δώρο', ball: 'μπάλα',
    });
});

test('RAN_OBJECTS_V1 type is "objects"', () => {
    assert.strictEqual(RAN.getDefinition('RAN_OBJECTS_V1').type, 'objects');
});

// Versioning (V2): CURRENT_VERSIONS was bumped to the new semi-random
// V2 arrays for every type — every NEW administration starts from
// here, while RAN_*_V1 stays fully addressable/frozen/unchanged for
// historical records (see the "V1 definitions remain byte-for-byte
// unchanged" and "V2 forms" test blocks below).
test('RAN.CURRENT_VERSIONS points at the V2 definition for every type', () => {
    assert.strictEqual(RAN.CURRENT_VERSIONS.digits, 'RAN_DIGITS_V2');
    assert.strictEqual(RAN.CURRENT_VERSIONS.colors, 'RAN_COLORS_V2');
    assert.strictEqual(RAN.CURRENT_VERSIONS.objects, 'RAN_OBJECTS_V2');
});

test('every RAN_OBJECTS_V1 stimulus ID resolves to a real image asset file', () => {
    const def = RAN.getDefinition('RAN_OBJECTS_V1');
    const assetsDir = path.join(__dirname, '..', 'assets', 'objects');
    def.stimuli.forEach(id => {
        const file = path.join(assetsDir, `${id}.png`);
        assert.ok(fs.existsSync(file), `missing image asset for stimulus "${id}": ${file}`);
    });
});

test('flattenForm reads left-to-right then next row (row-major)', () => {
    const def = RAN.getDefinition('RAN_DIGITS_V1');
    const flat = RAN.flattenForm(def, 'A');
    assert.strictEqual(flat[0], '2');
    assert.strictEqual(flat[4], '3');   // end of row 1
    assert.strictEqual(flat[5], '4');   // start of row 2
});

test('validateFormSequence flags a corrupted form (wrong stimulus count)', () => {
    const fakeDef = {
        id: 'FAKE', stimuli: ['1', '2', '3', '4', '5'], itemsPerStimulus: 4, totalStimuli: 20,
        layout: { rows: 4, columns: 5 },
        forms: { A: [['1', '1', '1', '4', '5'], ['1', '2', '3', '4', '5'], ['1', '2', '3', '4', '5'], ['1', '2', '3', '4', '5']] },
    };
    const problems = RAN.validateFormSequence(fakeDef, 'A');
    assert.ok(problems.length > 0);
    assert.ok(problems.some(p => p.includes('"1"')));
});

/* ============================================================
   DEFINITION IMMUTABILITY — spec §9, §62 (no runtime mutation)
   ============================================================ */
console.log('\nImmutability:');

test('definitions object is frozen', () => {
    assert.strictEqual(Object.isFrozen(RAN.definitions), true);
});

test('a form array is frozen (cannot push/alter stimulus sequence)', () => {
    const def = RAN.getDefinition('RAN_DIGITS_V1');
    assert.strictEqual(Object.isFrozen(def.forms.A), true);
    assert.strictEqual(Object.isFrozen(def.forms.A[0]), true);
    assert.throws(() => { def.forms.A[0][0] = '9'; }, TypeError);
});

test('mutating a definition field silently fails in non-strict eval, throws in strict', () => {
    'use strict';
    const def = RAN.getDefinition('RAN_COLORS_V1');
    assert.throws(() => { def.version = 999; }, TypeError);
});

/* ============================================================
   ADMINISTRATION RECORD — spec §42
   ============================================================ */
console.log('\nAdministration record:');

function baseInput(overrides) {
    return Object.assign({
        studentId: 'stu_test01',
        assessmentId: 'RAN_DIGITS_V1',
        assessmentVersion: 1,
        form: 'A',
        status: RAN.STATUS.COMPLETED,
    }, overrides || {});
}

test('createAdministration fills every §42 field', () => {
    const admin = RAN.createAdministration(baseInput());
    const expectedFields = [
        'administrationId', 'studentId', 'assessmentId', 'assessmentVersion', 'assessmentType',
        'form', 'stimulusSequence', 'dateISO', 'durationMs', 'totalStimuli', 'independentCorrect',
        'substitutions', 'omissions', 'repetitions', 'selfCorrections', 'examinerRedirects',
        'examinerProvidedAnswers',
        'sequenceLoss', 'familiarityPassed', 'practicePassed', 'gradeAtAdministration',
        'examinerReviewAdjusted', 'familiarityRetriesUsed',
        'status', 'validityFlags', 'notes',
    ];
    expectedFields.forEach(f => assert.ok(f in admin, `missing field ${f}`));
    assert.ok(!('initialCorrect' in admin), 'old field name must not linger alongside the new one');
});

test('createAdministration derives stimulusSequence from assessmentId/form', () => {
    const admin = RAN.createAdministration(baseInput());
    assert.deepStrictEqual(admin.stimulusSequence, RAN.flattenForm(RAN.getDefinition('RAN_DIGITS_V1'), 'A'));
});

test('createAdministration throws on missing required field', () => {
    const input = baseInput();
    delete input.studentId;
    assert.throws(() => RAN.createAdministration(input), /studentId/);
});

test('createAdministration throws on invalid status', () => {
    assert.throws(() => RAN.createAdministration(baseInput({ status: 'NOT_A_STATUS' })), /invalid status/);
});

test('createAdministration throws on version mismatch', () => {
    assert.throws(() => RAN.createAdministration(baseInput({ assessmentVersion: 2 })), /does not match/);
});

test('createAdministration throws on unknown form', () => {
    assert.throws(() => RAN.createAdministration(baseInput({ form: 'C' })), /form "C"/);
});

/* ---- examinerProvidedAnswers (Scientific Protocol Correction: 3-second rule) ---- */

test('examinerProvidedAnswers defaults to 0 when not provided', () => {
    const admin = RAN.createAdministration(baseInput());
    assert.strictEqual(admin.examinerProvidedAnswers, 0);
});

test('examinerProvidedAnswers accepts an explicit non-negative integer', () => {
    const admin = RAN.createAdministration(baseInput({ examinerProvidedAnswers: 3 }));
    assert.strictEqual(admin.examinerProvidedAnswers, 3);
});

test('examinerProvidedAnswers is a distinct field from examinerRedirects/omissions/substitutions (not overloaded)', () => {
    const admin = RAN.createAdministration(baseInput({ examinerProvidedAnswers: 2, examinerRedirects: 5, omissions: 1, substitutions: 1 }));
    assert.strictEqual(admin.examinerProvidedAnswers, 2);
    assert.strictEqual(admin.examinerRedirects, 5);
    assert.strictEqual(admin.omissions, 1);
    assert.strictEqual(admin.substitutions, 1);
});

test('two administrations get distinct administrationIds', () => {
    const a = RAN.createAdministration(baseInput());
    const b = RAN.createAdministration(baseInput());
    assert.notStrictEqual(a.administrationId, b.administrationId);
});

/* ---- independentCorrect: renamed + reformulated (Scientific Protocol
   Correction decision §1) — locked as a DERIVED field, formula now also
   subtracts examinerProvidedAnswers ---- */

test('independentCorrect is auto-derived from totalStimuli/substitutions/omissions/examinerProvidedAnswers, never taken from input', () => {
    const admin = RAN.createAdministration(baseInput({ substitutions: 1, omissions: 0, independentCorrect: 999 }));
    assert.strictEqual(admin.independentCorrect, 19); // 20 - 1 - 0 - 0, NOT the bogus 999 passed in
});

test('independentCorrect with zero errors equals totalStimuli', () => {
    const admin = RAN.createAdministration(baseInput());
    assert.strictEqual(admin.independentCorrect, 20);
});

test('independentCorrect is unaffected by repetitions/selfCorrections', () => {
    const admin = RAN.createAdministration(baseInput({ substitutions: 2, omissions: 1, repetitions: 5, selfCorrections: 1 }));
    assert.strictEqual(admin.independentCorrect, 17); // 20 - 2 - 1, repetitions/selfCorrections don't subtract
});

test('independentCorrect also subtracts examinerProvidedAnswers (decision §1)', () => {
    const admin = RAN.createAdministration(baseInput({ substitutions: 1, omissions: 1, examinerProvidedAnswers: 2 }));
    assert.strictEqual(admin.independentCorrect, 16); // 20 - 1 - 1 - 2
});

test('a self-correction does NOT reduce independentCorrect (decision §1/§5)', () => {
    const admin = RAN.createAdministration(baseInput({ substitutions: 0, omissions: 0, examinerProvidedAnswers: 0, selfCorrections: 1 }));
    assert.strictEqual(admin.independentCorrect, 20);
});

test('deriveIndependentCorrect matches the locked formula directly', () => {
    assert.strictEqual(RAN.deriveIndependentCorrect(20, 1, 0, 0), 19);
    assert.strictEqual(RAN.deriveIndependentCorrect(20, 0, 0, 0), 20);
    assert.strictEqual(RAN.deriveIndependentCorrect(20, 2, 3, 0), 15);
    assert.strictEqual(RAN.deriveIndependentCorrect(20, 2, 3, 4), 11);
});

test('deriveIndependentCorrect treats a missing/undefined examinerProvidedAnswers as 0', () => {
    assert.strictEqual(RAN.deriveIndependentCorrect(20, 1, 0), 19);
});

test('RAN.deriveInitialCorrect / RAN.calcNamingRate no longer exist (real rename, not an alias)', () => {
    assert.strictEqual(RAN.deriveInitialCorrect, undefined);
    assert.strictEqual(RAN.calcNamingRate, undefined);
});

/* ============================================================
   ADMINISTRATION VALIDATION
   ============================================================ */
console.log('\nAdministration validation:');

test('a well-formed COMPLETED administration passes validation', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 18420, substitutions: 1 }));
    const problems = RAN.validateAdministration(admin);
    assert.deepStrictEqual(problems, []);
});

test('COMPLETED without durationMs fails validation', () => {
    const admin = RAN.createAdministration(baseInput({ substitutions: 1 }));
    const problems = RAN.validateAdministration(admin);
    assert.ok(problems.some(p => p.includes('durationMs')));
});

test('COMPLETED with non-integer durationMs fails validation', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 1842.5, substitutions: 1 }));
    const problems = RAN.validateAdministration(admin);
    assert.ok(problems.some(p => p.includes('durationMs')));
});

test('PREPARATION_FAILED without a reason fails validation', () => {
    const admin = RAN.createAdministration(baseInput({ status: RAN.STATUS.PREPARATION_FAILED }));
    const problems = RAN.validateAdministration(admin);
    assert.ok(problems.some(p => p.includes('preparationFailureReason')));
});

test('PREPARATION_FAILED with a valid reason passes that check', () => {
    const admin = RAN.createAdministration(baseInput({
        status: RAN.STATUS.PREPARATION_FAILED,
        preparationFailureReason: RAN.PREPARATION_FAILURE_REASON.FAMILIARITY_NOT_ESTABLISHED,
    }));
    const problems = RAN.validateAdministration(admin);
    assert.ok(!problems.some(p => p.includes('preparationFailureReason')));
});

test('INVALID without a reason fails validation', () => {
    const admin = RAN.createAdministration(baseInput({ status: RAN.STATUS.INVALID }));
    const problems = RAN.validateAdministration(admin);
    assert.ok(problems.some(p => p.includes('invalidReason')));
});

test('INCOMPLETE without a reason fails validation', () => {
    const admin = RAN.createAdministration(baseInput({ status: RAN.STATUS.INCOMPLETE }));
    const problems = RAN.validateAdministration(admin);
    assert.ok(problems.some(p => p.includes('incompleteReason')));
});

test('tampered stimulusSequence is detected', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 18420, substitutions: 1 }));
    const tampered = Object.assign({}, admin, { stimulusSequence: ['9', '9', '9'] });
    const problems = RAN.validateAdministration(tampered);
    assert.ok(problems.some(p => p.includes('stimulusSequence')));
});

/* ---- new invariants (correction pass) ---- */

test('validateAdministration rejects a hand-edited/imported independentCorrect that disagrees with raw counts', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 18420, substitutions: 1 }));
    const corrupted = Object.assign({}, admin, { independentCorrect: 5 }); // should be 19
    const problems = RAN.validateAdministration(corrupted);
    assert.ok(problems.some(p => p.includes('independentCorrect') && p.includes('does not match')));
});

test('validateAdministration rejects independentCorrect outside 0..totalStimuli', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 18420, substitutions: 1 }));
    const corrupted = Object.assign({}, admin, { independentCorrect: 25 });
    const problems = RAN.validateAdministration(corrupted);
    assert.ok(problems.some(p => p.includes('between 0 and totalStimuli')));
});

/* ---- re-audit validation (Scientific Protocol Correction decision §6):
   substitutions + omissions + examinerProvidedAnswers <= totalStimuli ---- */

test('validateAdministration rejects substitutions + omissions + examinerProvidedAnswers > totalStimuli', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 18420 }));
    const corrupted = Object.assign({}, admin, { substitutions: 15, omissions: 10 }); // 25 > 20
    const problems = RAN.validateAdministration(corrupted);
    assert.ok(problems.some(p => p.includes('substitutions + omissions + examinerProvidedAnswers')));
});

test('validateAdministration rejects the sum exceeding totalStimuli even when examinerProvidedAnswers is the tipping field', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 18420 }));
    // 10 + 5 + 6 = 21 > 20, independentCorrect would also disagree.
    const corrupted = Object.assign({}, admin, { substitutions: 10, omissions: 5, examinerProvidedAnswers: 6, independentCorrect: -1 });
    const problems = RAN.validateAdministration(corrupted);
    assert.ok(problems.some(p => p.includes('substitutions + omissions + examinerProvidedAnswers')));
});

test('boundary: substitutions + omissions + examinerProvidedAnswers exactly equal to totalStimuli (20) is valid', () => {
    const admin = RAN.createAdministration(baseInput({
        durationMs: 18420, substitutions: 10, omissions: 5, examinerProvidedAnswers: 5,
    }));
    assert.strictEqual(admin.independentCorrect, 0);
    const problems = RAN.validateAdministration(admin);
    assert.deepStrictEqual(problems, []);
});

/* Scientific Protocol Correction (3-second rule + error
   classification): the old "selfCorrections must not exceed
   substitutions" invariant is REMOVED — see RAN.validateAdministration
   for the full reasoning. A substitution is now an incorrect naming
   that stays incorrect (never self-corrected); a self-correction is
   the child spontaneously fixing it WITHOUT examiner help. They are
   independent counts, so selfCorrections may legitimately exceed
   substitutions. */
test('selfCorrections may exceed substitutions — the old invariant is gone', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 18420, substitutions: 1 }));
    const corrected = Object.assign({}, admin, { selfCorrections: 5 });
    const problems = RAN.validateAdministration(corrected);
    assert.ok(!problems.some(p => p.includes('selfCorrections')), JSON.stringify(problems));
});

test('a self-correction with zero substitutions is valid (no double-counting requirement)', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 18420, substitutions: 0, selfCorrections: 1 }));
    const problems = RAN.validateAdministration(admin);
    assert.deepStrictEqual(problems, []);
});

test('selfCorrections equal to substitutions is still allowed (unremarkable case)', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 18420, substitutions: 2, selfCorrections: 2 }));
    const problems = RAN.validateAdministration(admin);
    assert.ok(!problems.some(p => p.includes('selfCorrections')));
});

[
    ['totalStimuli', -1], ['totalStimuli', 1.5],
    ['substitutions', -1], ['substitutions', 2.5],
    ['omissions', -1], ['omissions', 2.5],
    ['repetitions', -1], ['repetitions', 2.5],
    ['selfCorrections', -1], ['selfCorrections', 2.5],
    ['examinerRedirects', -1], ['examinerRedirects', 2.5],
    ['examinerProvidedAnswers', -1], ['examinerProvidedAnswers', 2.5],
].forEach(([field, badValue]) => {
    test(`validateAdministration rejects non-negative-integer violation: ${field} = ${badValue}`, () => {
        const admin = RAN.createAdministration(baseInput({ durationMs: 18420, substitutions: 1 }));
        const corrupted = Object.assign({}, admin, { [field]: badValue });
        const problems = RAN.validateAdministration(corrupted);
        assert.ok(problems.some(p => p.includes(`"${field}"`) && p.includes('non-negative integer')), JSON.stringify(problems));
    });
});

test('all-zero counts (perfect run) pass every new invariant', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 15000 }));
    const problems = RAN.validateAdministration(admin);
    assert.deepStrictEqual(problems, []);
    assert.strictEqual(admin.independentCorrect, 20);
});

/* ---- mixed/isolated case matrix (regression per decision §6) ---- */

test('self-correction-only case: valid, independentCorrect unaffected', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 15000, selfCorrections: 3 }));
    assert.deepStrictEqual(RAN.validateAdministration(admin), []);
    assert.strictEqual(admin.independentCorrect, 20);
});

test('examiner-answer-only case: valid, independentCorrect reduced by examinerProvidedAnswers', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 15000, examinerProvidedAnswers: 4 }));
    assert.deepStrictEqual(RAN.validateAdministration(admin), []);
    assert.strictEqual(admin.independentCorrect, 16);
});

test('substitution-only case: valid, independentCorrect reduced by substitutions', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 15000, substitutions: 6 }));
    assert.deepStrictEqual(RAN.validateAdministration(admin), []);
    assert.strictEqual(admin.independentCorrect, 14);
});

test('omission-only case: valid, independentCorrect reduced by omissions', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 15000, omissions: 5 }));
    assert.deepStrictEqual(RAN.validateAdministration(admin), []);
    assert.strictEqual(admin.independentCorrect, 15);
});

test('mixed case: substitutions + omissions + examinerProvidedAnswers + selfCorrections + repetitions all together', () => {
    const admin = RAN.createAdministration(baseInput({
        durationMs: 15000, substitutions: 3, omissions: 2, examinerProvidedAnswers: 4,
        selfCorrections: 2, repetitions: 1,
    }));
    assert.deepStrictEqual(RAN.validateAdministration(admin), []);
    assert.strictEqual(admin.independentCorrect, 11); // 20 - 3 - 2 - 4; selfCorrections/repetitions don't subtract
});

/* ============================================================
   ITEM 20 audit — confirms the engine ALREADY enforces substitutions +
   omissions + examinerProvidedAnswers <= totalStimuli (this is the
   existing rule the item-20 UI-level prevention in ran_ui.js mirrors,
   not a second/different one). Boundary = exactly totalStimuli (20 for
   RAN_DIGITS_V1); attempted = 21, one over.
   ============================================================ */
console.log('\nItem 20 — primary-error-sum boundary (substitutions + omissions + examinerProvidedAnswers <= totalStimuli):');

test('boundary: sum exactly 20 (10 + 5 + 5) is VALID, independentCorrect is 0', () => {
    const admin = RAN.createAdministration(baseInput({
        durationMs: 15000, substitutions: 10, omissions: 5, examinerProvidedAnswers: 5,
    }));
    assert.deepStrictEqual(RAN.validateAdministration(admin), []);
    assert.strictEqual(admin.independentCorrect, 0);
});

test('attempted: sum of 21 (10 + 5 + 6, one over totalStimuli=20) is REJECTED with the exact locked message', () => {
    const admin = RAN.createAdministration(baseInput({
        durationMs: 15000, substitutions: 10, omissions: 5, examinerProvidedAnswers: 6,
    }));
    const problems = RAN.validateAdministration(admin);
    assert.ok(problems.includes('substitutions + omissions + examinerProvidedAnswers must not exceed totalStimuli'));
});

test('repetitions/selfCorrections are never part of this sum — a huge repetitions/selfCorrections count alone never triggers this rule', () => {
    const admin = RAN.createAdministration(baseInput({
        durationMs: 15000, substitutions: 5, omissions: 5, examinerProvidedAnswers: 5, // sum 15, well under 20
        repetitions: 500, selfCorrections: 500,
    }));
    assert.deepStrictEqual(RAN.validateAdministration(admin), []);
});

/* ============================================================
   SCORING — spec §44-§46
   ============================================================ */
console.log('\nScoring:');

test('calcIndependentNamingRate matches the spec §45 worked example', () => {
    // 19 correct / 18.42 sec ≈ 1.031...
    const rate = RAN.calcIndependentNamingRate(19, 18420);
    assert.ok(Math.abs(rate - 1.0314) < 0.001, `got ${rate}`);
});

test('calcIndependentNamingRate returns null for zero/negative duration', () => {
    assert.strictEqual(RAN.calcIndependentNamingRate(19, 0), null);
    assert.strictEqual(RAN.calcIndependentNamingRate(19, -100), null);
});

test('calcIndependentNamingRate returns null for non-numeric inputs', () => {
    assert.strictEqual(RAN.calcIndependentNamingRate(null, 18420), null);
    assert.strictEqual(RAN.calcIndependentNamingRate(19, undefined), null);
});

test('calcResults gives a rate for COMPLETED, using the derived independentCorrect', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 18420, substitutions: 1 })); // independentCorrect -> 19
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.rateEligible, true);
    assert.strictEqual(results.independentCorrect, 19);
    assert.ok(Math.abs(results.independentNamingRate - 1.0314) < 0.001);
    assert.strictEqual(results.completionTimeSec, 18.42);
});

test('calcResults factors examinerProvidedAnswers into independentCorrect/independentNamingRate', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 20000, substitutions: 1, examinerProvidedAnswers: 3 }));
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.independentCorrect, 16); // 20 - 1 - 0 - 3
    assert.ok(Math.abs(results.independentNamingRate - (16 / 20)) < 0.0001);
});

test('calcResults gives a rate for COMPLETED_FLAGGED', () => {
    const admin = RAN.createAdministration(baseInput({
        status: RAN.STATUS.COMPLETED_FLAGGED, durationMs: 20000, substitutions: 2, sequenceLoss: true,
    }));
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.rateEligible, true);
    assert.notStrictEqual(results.independentNamingRate, null);
});

test('calcResults withholds rate for INVALID (spec §46)', () => {
    const admin = RAN.createAdministration(baseInput({
        status: RAN.STATUS.INVALID, invalidReason: RAN.INVALID_REASON.TECHNICAL_MALFUNCTION,
        durationMs: 18420, substitutions: 1,
    }));
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.rateEligible, false);
    assert.strictEqual(results.independentNamingRate, null);
});

test('calcResults withholds rate for INCOMPLETE (spec §46)', () => {
    const admin = RAN.createAdministration(baseInput({
        status: RAN.STATUS.INCOMPLETE, incompleteReason: RAN.INCOMPLETE_REASON.CHILD_STOPPED_PARTICIPATING,
    }));
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.rateEligible, false);
    assert.strictEqual(results.independentNamingRate, null);
});

test('calcResults withholds rate for PREPARATION_FAILED', () => {
    const admin = RAN.createAdministration(baseInput({
        status: RAN.STATUS.PREPARATION_FAILED,
        preparationFailureReason: RAN.PREPARATION_FAILURE_REASON.FAMILIARITY_NOT_ESTABLISHED,
    }));
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.rateEligible, false);
    assert.strictEqual(results.independentNamingRate, null);
});

/* ============================================================
   INCOMPLETE/INVALID correctness fix: an aborted run's raw
   independentCorrect (computed at creation time assuming every
   totalStimuli item was reached) must never surface as a performance
   result, and INVALID's raw elapsed time must never surface as a
   completion time. Regression tests for that fix.
   ============================================================ */
console.log('\nINCOMPLETE/INVALID correctness fix (calcResults):');

test('calcResults: INCOMPLETE with few recorded errors does NOT show a fictitious independentCorrect', () => {
    // Simulates the real bug: an administration aborted after only a
    // handful of stimuli, with just 1 substitution recorded so far —
    // the old formula would have reported independentCorrect = 19/20,
    // implying near-perfect performance on a run that never finished.
    const admin = RAN.createAdministration(baseInput({
        status: RAN.STATUS.INCOMPLETE, incompleteReason: RAN.INCOMPLETE_REASON.CHILD_STOPPED_PARTICIPATING,
        durationMs: 6100, substitutions: 1,
    }));
    assert.strictEqual(admin.independentCorrect, 19, 'the raw stored field is unaffected — schema/derivation unchanged');
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.independentCorrect, null, 'calcResults must withhold the misleading derived count for INCOMPLETE');
});

test('calcResults: INCOMPLETE never gets an independentNamingRate', () => {
    const admin = RAN.createAdministration(baseInput({
        status: RAN.STATUS.INCOMPLETE, incompleteReason: RAN.INCOMPLETE_REASON.CHILD_STOPPED_PARTICIPATING,
        durationMs: 6100, substitutions: 1,
    }));
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.independentNamingRate, null);
    assert.strictEqual(results.rateEligible, false, 'not rate/comparison/graph eligible — every eligibility check in the UI keys off this same flag');
});

test('calcResults: INCOMPLETE never reports completionTimeSec, but exposes the same raw elapsed time separately as interruptedAtTimeSec', () => {
    const admin = RAN.createAdministration(baseInput({
        status: RAN.STATUS.INCOMPLETE, incompleteReason: RAN.INCOMPLETE_REASON.SERIAL_PROCEDURE_LOST,
        durationMs: 6100,
    }));
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.completionTimeSec, null, 'must never be presented as a completion time');
    assert.strictEqual(results.interruptedAtTimeSec, 6.1, 'the real observed elapsed time is preserved under its own distinct name');
});

test('calcResults: INCOMPLETE with no recorded durationMs gets interruptedAtTimeSec null too (nothing to show)', () => {
    const admin = RAN.createAdministration(baseInput({
        status: RAN.STATUS.INCOMPLETE, incompleteReason: RAN.INCOMPLETE_REASON.TECHNICAL_ISSUE,
    }));
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.interruptedAtTimeSec, null);
});

test('calcResults: INVALID never reports completionTimeSec (no raw elapsed time as a performance result)', () => {
    const admin = RAN.createAdministration(baseInput({
        status: RAN.STATUS.INVALID, invalidReason: RAN.INVALID_REASON.ACCIDENTAL_TIMER_STOP,
        durationMs: 6100, substitutions: 1,
    }));
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.completionTimeSec, null);
    assert.strictEqual(admin.durationMs, 6100, 'the raw duration remains stored internally as audit data — only the presentation layer withholds it');
});

test('calcResults: INVALID also never reports interruptedAtTimeSec (that label is INCOMPLETE-only)', () => {
    const admin = RAN.createAdministration(baseInput({
        status: RAN.STATUS.INVALID, invalidReason: RAN.INVALID_REASON.TECHNICAL_MALFUNCTION,
        durationMs: 6100,
    }));
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.interruptedAtTimeSec, null);
});

test('calcResults: INVALID never reports independentCorrect', () => {
    const admin = RAN.createAdministration(baseInput({
        status: RAN.STATUS.INVALID, invalidReason: RAN.INVALID_REASON.WRONG_FORM_SHOWN,
        substitutions: 1,
    }));
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.independentCorrect, null);
});

test('calcResults: INVALID is not rate/comparison/graph eligible', () => {
    const admin = RAN.createAdministration(baseInput({
        status: RAN.STATUS.INVALID, invalidReason: RAN.INVALID_REASON.OTHER_PROCEDURAL_DEVIATION,
        durationMs: 6100,
    }));
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.rateEligible, false);
});

test('calcResults: COMPLETED behavior is completely unchanged by the INCOMPLETE/INVALID fix', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 18420, substitutions: 1 }));
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.completionTimeSec, 18.42);
    assert.strictEqual(results.independentCorrect, 19);
    assert.strictEqual(results.interruptedAtTimeSec, null, 'interruptedAtTimeSec is INCOMPLETE-only, never populated for COMPLETED');
    assert.strictEqual(results.rateEligible, true);
    assert.notStrictEqual(results.independentNamingRate, null);
});

test('calcResults: COMPLETED_FLAGGED behavior is completely unchanged by the INCOMPLETE/INVALID fix', () => {
    const admin = RAN.createAdministration(baseInput({
        status: RAN.STATUS.COMPLETED_FLAGGED, durationMs: 20000, substitutions: 2, sequenceLoss: true,
    }));
    const results = RAN.calcResults(admin);
    assert.strictEqual(results.completionTimeSec, 20);
    assert.strictEqual(results.independentCorrect, 18);
    assert.strictEqual(results.interruptedAtTimeSec, null);
    assert.strictEqual(results.rateEligible, true);
    assert.notStrictEqual(results.independentNamingRate, null);
});

/* ============================================================
   LONGITUDINAL COMPARISON — spec §51, corrected formula
   percentChange = ((currentMs - previousMs) / previousMs) * 100
   negative = faster (less time), positive = slower (more time)
   ============================================================ */
console.log('\nLongitudinal comparison (corrected §51):');

test('calcTimeDifference: 20.0s -> 17.0s gives deltaSec -3 and percentChange -15%', () => {
    const diff = RAN.calcTimeDifference(20000, 17000);
    assert.strictEqual(diff.deltaSec, -3);
    assert.ok(Math.abs(diff.percentChange - (-15)) < 0.0001, `got ${diff.percentChange}`);
});

test('calcTimeDifference: 17.0s -> 20.0s gives deltaSec +3 and percentChange +17.65%', () => {
    const diff = RAN.calcTimeDifference(17000, 20000);
    assert.strictEqual(diff.deltaSec, 3);
    assert.ok(Math.abs(diff.percentChange - 17.647) < 0.001, `got ${diff.percentChange}`);
});

test('calcTimeDifference: negative deltaSec means faster (less time)', () => {
    const diff = RAN.calcTimeDifference(20000, 17000);
    assert.ok(diff.deltaSec < 0);
});

test('calcTimeDifference: positive deltaSec means slower (more time)', () => {
    const diff = RAN.calcTimeDifference(17000, 20000);
    assert.ok(diff.deltaSec > 0);
});

test('calcTimeDifference: no change gives deltaSec 0 and percentChange 0', () => {
    const diff = RAN.calcTimeDifference(18000, 18000);
    assert.strictEqual(diff.deltaSec, 0);
    assert.strictEqual(diff.percentChange, 0);
});

test('calcTimeDifference returns null for invalid previousMs', () => {
    assert.strictEqual(RAN.calcTimeDifference(0, 100), null);
    assert.strictEqual(RAN.calcTimeDifference(null, 100), null);
});

test('calcTimeDifference does not use the old absoluteDiffSec/percentChangeAsSpecFormula names', () => {
    const diff = RAN.calcTimeDifference(20000, 17000);
    assert.ok(!('absoluteDiffSec' in diff));
    assert.ok(!('percentChangeAsSpecFormula' in diff));
});

/* ============================================================
   VERSIONING (V2) — new semi-random Forms A/B, added ALONGSIDE the
   frozen V1 definitions (never mutated in place). V1's own Form A/B
   exact-sequence tests above already guarantee it stays byte-for-byte
   unchanged; this block covers what's new: the V2 forms themselves,
   and that a fresh administration built against a V1 ID still
   validates/imports correctly (backward compatibility).
   ============================================================ */
console.log('\nVersioning (V2):');

test('V1 definitions remain byte-for-byte unchanged (spot check against the locked V1 arrays)', () => {
    const d1 = RAN.getDefinition('RAN_DIGITS_V1');
    assert.deepStrictEqual(d1.forms.A, [
        ['2', '5', '1', '4', '3'], ['4', '2', '5', '3', '1'], ['3', '1', '4', '5', '2'], ['5', '3', '2', '1', '4'],
    ]);
    assert.deepStrictEqual(d1.forms.B, [
        ['3', '1', '5', '2', '4'], ['5', '4', '2', '1', '3'], ['2', '5', '3', '4', '1'], ['4', '2', '1', '3', '5'],
    ]);
    assert.strictEqual(d1.version, 1);
    assert.ok(Object.isFrozen(d1) && Object.isFrozen(d1.forms) && Object.isFrozen(d1.forms.A), 'V1 definitions stay deep-frozen');
});

['RAN_DIGITS_V2', 'RAN_COLORS_V2', 'RAN_OBJECTS_V2'].forEach(id => {
    test(`${id} exists with version 2, same stimuli/itemsPerStimulus/layout as its V1 counterpart`, () => {
        const v2 = RAN.getDefinition(id);
        const v1 = RAN.getDefinition(id.replace('_V2', '_V1'));
        assert.strictEqual(v2.version, 2);
        assert.deepStrictEqual(v2.stimuli, v1.stimuli);
        assert.strictEqual(v2.itemsPerStimulus, v1.itemsPerStimulus);
        assert.deepStrictEqual(v2.layout, v1.layout);
        assert.strictEqual(v2.totalStimuli, v1.totalStimuli);
    });

    ['A', 'B'].forEach(form => {
        test(`${id} Form ${form}: 20 items, each stimulus exactly 4×, no adjacent duplicate (incl. row boundaries)`, () => {
            const def = RAN.getDefinition(id);
            const flat = RAN.flattenForm(def, form);
            assert.strictEqual(flat.length, 20);
            const counts = {};
            flat.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
            def.stimuli.forEach(s => assert.strictEqual(counts[s], 4, `stimulus ${s} should appear 4 times`));
            for (let i = 1; i < flat.length; i++) {
                assert.notStrictEqual(flat[i], flat[i - 1], `adjacent duplicate "${flat[i]}" at position ${i}`);
            }
        });
    });

    test(`${id}: Form B is not a rotation, reversal, or fixed relabeling of Form A`, () => {
        const def = RAN.getDefinition(id);
        const a = RAN.flattenForm(def, 'A');
        const b = RAN.flattenForm(def, 'B');
        const isRotation = Array.from({ length: a.length }, (_, shift) => shift)
            .some(shift => a.every((v, i) => v === b[(i + shift) % b.length]));
        assert.ok(!isRotation, 'Form B must not be a rotation of Form A');
        assert.notDeepStrictEqual(a, b.slice().reverse(), 'Form B must not be a reversal of Form A');
        const map = {};
        let isFixedRelabeling = true;
        for (let i = 0; i < a.length; i++) {
            if (map[a[i]] === undefined) map[a[i]] = b[i];
            else if (map[a[i]] !== b[i]) { isFixedRelabeling = false; break; }
        }
        assert.ok(!isFixedRelabeling, 'Form B must not be a fixed 1:1 relabeling of Form A');
    });
});

test('RAN.validateAllDefinitions() reports V1 AND V2 definitions as valid together', () => {
    const result = RAN.validateAllDefinitions();
    assert.strictEqual(result.valid, true, JSON.stringify(result.problems));
    assert.strictEqual(Object.keys(RAN.definitions).length, 6, 'exactly 3 V1 + 3 V2 definitions registered');
});

test('a fresh administration built against a V1 assessmentId still validates correctly (backward compatibility)', () => {
    const admin = RAN.createAdministration(baseInput({
        assessmentId: 'RAN_DIGITS_V1', assessmentVersion: 1, durationMs: 15000,
    }));
    const problems = RAN.validateAdministration(admin);
    assert.deepStrictEqual(problems, [], 'a V1 administration must keep validating with zero problems');
});

test('a fresh administration built against a V2 assessmentId validates correctly, with its own version', () => {
    const admin = RAN.createAdministration(baseInput({
        assessmentId: 'RAN_DIGITS_V2', assessmentVersion: 2, durationMs: 15000,
    }));
    const problems = RAN.validateAdministration(admin);
    assert.deepStrictEqual(problems, []);
    assert.strictEqual(admin.assessmentVersion, 2);
});

test('V1 and V2 administrations for the same type are never mixed: assessmentId<->assessmentVersion stays 1:1', () => {
    // This is the exact invariant the History/comparison/graph code in
    // ran_ui.js relies on: rows filtered by ONE fixed assessmentId can
    // never carry a foreign assessmentVersion, so a naive numeric
    // longitudinal comparison across versions is structurally
    // impossible, not just policy.
    Object.keys(RAN.definitions).forEach(id => {
        assert.strictEqual(RAN.definitions[id].id, id);
        // Every definition's own version matches what RAN.createAdministration
        // would derive/require for that exact id — verified via createAdministration's
        // own assessmentVersion-mismatch guard.
        assert.throws(
            () => RAN.createAdministration(baseInput({ assessmentId: id, assessmentVersion: 999 })),
            /does not match/,
            `${id}: a mismatched assessmentVersion must be rejected`
        );
    });
});

/* ============================================================
   GRADE — strict-write/tolerant-read metadata (RAN.GRADE,
   RAN.isValidGrade). Purely contextual: never read by scoring, so no
   test here touches calcResults/comparison/graph eligibility.
   ============================================================ */
console.log('\nGrade (RAN.GRADE / RAN.isValidGrade):');

test('RAN.GRADE contains the 10 school grades (item 7: + Νηπιαγωγείο/Προδημοτική, + Γ΄ Γυμνασίου) plus the explicit OTHER_UNSPECIFIED choice', () => {
    const values = Object.values(RAN.GRADE);
    assert.strictEqual(values.length, 11);
    assert.ok(values.includes('OTHER_UNSPECIFIED'));
    assert.ok(values.includes('NIPIAGOGEIO'));
    assert.ok(values.includes('G_GYMNASIOU'));
});

test('RAN.isValidGrade: null (nothing chosen) is valid', () => {
    assert.strictEqual(RAN.isValidGrade(null), true);
});

test('RAN.isValidGrade: every real RAN.GRADE value is valid', () => {
    Object.values(RAN.GRADE).forEach(g => assert.strictEqual(RAN.isValidGrade(g), true, g));
});

test('RAN.isValidGrade: an unrecognized/corrupt value is invalid (strict-write gate)', () => {
    assert.strictEqual(RAN.isValidGrade('NOT_A_REAL_GRADE'), false);
    assert.strictEqual(RAN.isValidGrade(undefined), false);
    assert.strictEqual(RAN.isValidGrade(''), false);
});

test('createAdministration fills gradeAtAdministration, defaulting to null (not known at creation time)', () => {
    const admin = RAN.createAdministration(baseInput());
    assert.ok('gradeAtAdministration' in admin);
    assert.strictEqual(admin.gradeAtAdministration, null);
});

test('createAdministration honors an explicitly-passed gradeAtAdministration', () => {
    const admin = RAN.createAdministration(baseInput({ gradeAtAdministration: RAN.GRADE.G_DIMOTIKOU }));
    assert.strictEqual(admin.gradeAtAdministration, RAN.GRADE.G_DIMOTIKOU);
});

test('RAN.validateAdministration does NOT reject an unrecognized gradeAtAdministration (tolerant read for legacy/imported data)', () => {
    const admin = RAN.createAdministration(baseInput({ durationMs: 15000 }));
    admin.gradeAtAdministration = 'SOME_LEGACY_UNRECOGNIZED_VALUE';
    const problems = RAN.validateAdministration(admin);
    assert.deepStrictEqual(problems, [], 'grade validity is intentionally NOT part of the shared validateAdministration gate — see RAN.isValidGrade for the separate strict-write guard used by the live save path');
});

/* ============================================================
   ITEM 16 — familiarityRetriesUsed at the createAdministration/
   validateAdministration level (ran_timed.js's own forwarding is
   covered separately in tests/ran_timed.test.js).
   ============================================================ */
console.log('\nItem 16 — familiarityRetriesUsed (createAdministration/validateAdministration):');

test('createAdministration defaults familiarityRetriesUsed to null when not supplied', () => {
    const admin = RAN.createAdministration(baseInput());
    assert.ok('familiarityRetriesUsed' in admin);
    assert.strictEqual(admin.familiarityRetriesUsed, null);
});

[0, 1, 4].forEach(n => {
    test(`createAdministration honors an explicitly-passed familiarityRetriesUsed=${n}`, () => {
        const admin = RAN.createAdministration(baseInput({ familiarityRetriesUsed: n }));
        assert.strictEqual(admin.familiarityRetriesUsed, n);
    });
});

test('familiarityRetriesUsed never influences scoring/status: two administrations differing only in it are otherwise identical', () => {
    const a = RAN.createAdministration(baseInput({ durationMs: 12000, substitutions: 2, familiarityRetriesUsed: 0 }));
    const b = RAN.createAdministration(baseInput({ durationMs: 12000, substitutions: 2, familiarityRetriesUsed: 4 }));
    assert.strictEqual(a.status, b.status);
    assert.strictEqual(a.independentCorrect, b.independentCorrect);
    const ra = RAN.calcResults(a), rb = RAN.calcResults(b);
    assert.strictEqual(ra.rateEligible, rb.rateEligible);
    assert.strictEqual(ra.independentNamingRate, rb.independentNamingRate);
});

test('RAN.validateAdministration accepts familiarityRetriesUsed 0/1/multiple, rejects negative/non-integer, tolerates a missing field', () => {
    [0, 1, 6].forEach(n => {
        const admin = RAN.createAdministration(baseInput({ durationMs: 10000, familiarityRetriesUsed: n }));
        assert.deepStrictEqual(RAN.validateAdministration(admin), []);
    });
    const negative = RAN.createAdministration(baseInput({ durationMs: 10000 }));
    negative.familiarityRetriesUsed = -2;
    assert.ok(RAN.validateAdministration(negative).some(p => p.includes('familiarityRetriesUsed')));

    const legacy = RAN.createAdministration(baseInput({ durationMs: 10000 }));
    delete legacy.familiarityRetriesUsed; // simulates a pre-item-16 stored record
    assert.deepStrictEqual(RAN.validateAdministration(legacy), [], 'a legacy record missing this field entirely must still validate cleanly');
});

/* ============================================================ */
console.log(`\n${passed} passed, ${process.exitCode === 1 ? 'with failures above' : '0 failed'}`);
if (process.exitCode !== 1) console.log('ALL TESTS PASSED');
