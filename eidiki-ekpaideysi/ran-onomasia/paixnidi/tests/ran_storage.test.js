/* ============================================================
   RAN storage — Phase 5 tests (plain Node)
   Run with: node ran_storage.test.js
   ============================================================ */
'use strict';
const assert = require('assert');
const path = require('path');

require(path.join(__dirname, '..', 'js', 'ran_definitions.js'));
require(path.join(__dirname, '..', 'js', 'ran_engine.js'));
require(path.join(__dirname, '..', 'js', 'ran_preparation.js'));
require(path.join(__dirname, '..', 'js', 'ran_timed.js'));
const RAN = require(path.join(__dirname, '..', 'js', 'ran_storage.js'));

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

console.log('RAN storage — Phase 5 tests\n');

function mockStorage() {
    const store = new Map();
    return {
        getItem(k) { return store.has(k) ? store.get(k) : null; },
        setItem(k, v) { store.set(k, String(v)); },
        removeItem(k) { store.delete(k); },
    };
}

function completedAdmin(overrides) {
    return RAN.timed.buildCompletedAdministration(Object.assign({
        studentId: 'stu_ephemeral_placeholder',
        assessmentId: 'RAN_DIGITS_V1',
        form: 'A',
        durationMs: 12000,
        substitutions: 1,
    }, overrides || {})).administration;
}

console.log('Availability / backend:');

test('isAvailable() is false with no backend configured', () => {
    RAN.storage.configure(null);
    assert.strictEqual(RAN.storage.isAvailable(), false);
});

test('isAvailable() is true once a working backend is configured', () => {
    RAN.storage.configure(mockStorage());
    assert.strictEqual(RAN.storage.isAvailable(), true);
});

console.log('\nProfiles:');

test('createProfile with no label uses the suggested default "Μαθητής 01" for a fresh store', () => {
    RAN.storage.configure(mockStorage());
    const p = RAN.storage.createProfile();
    assert.strictEqual(p.displayLabel, 'Μαθητής 01');
    assert.ok(p.profileId.startsWith('profile_'));
    assert.ok(p.createdAt);
});

test('suggestNextDisplayLabel increments past existing "Μαθητής NN" profiles', () => {
    RAN.storage.configure(mockStorage());
    RAN.storage.createProfile('Μαθητής 01');
    RAN.storage.createProfile('Μαθητής 02');
    assert.strictEqual(RAN.storage.suggestNextDisplayLabel(), 'Μαθητής 03');
});

test('createProfile accepts and trims a custom label', () => {
    RAN.storage.configure(mockStorage());
    const p = RAN.storage.createProfile('  Κωδικός Χ7  ');
    assert.strictEqual(p.displayLabel, 'Κωδικός Χ7');
});

test('renameProfile updates the label; throws on an unknown profileId', () => {
    RAN.storage.configure(mockStorage());
    const p = RAN.storage.createProfile('Μαθητής 01');
    const renamed = RAN.storage.renameProfile(p.profileId, 'Νέο Όνομα');
    assert.strictEqual(renamed.displayLabel, 'Νέο Όνομα');
    assert.strictEqual(RAN.storage.getProfile(p.profileId).displayLabel, 'Νέο Όνομα');
    assert.throws(() => RAN.storage.renameProfile('profile_does_not_exist', 'x'));
});

test('listProfiles returns every created profile', () => {
    RAN.storage.configure(mockStorage());
    RAN.storage.createProfile('A');
    RAN.storage.createProfile('B');
    assert.strictEqual(RAN.storage.listProfiles().length, 2);
});

console.log('\nSaving administrations (ephemeral -> profile re-association):');

test('saveAdministration replaces the ephemeral studentId with the chosen profileId', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile('Μαθητής 01');
    const admin = completedAdmin({ studentId: 'stu_totally_ephemeral' });
    assert.strictEqual(admin.studentId, 'stu_totally_ephemeral');
    const result = RAN.storage.saveAdministration(profile.profileId, admin);
    assert.strictEqual(result.saved, true);
    assert.strictEqual(result.administration.studentId, profile.profileId);
    assert.notStrictEqual(result.administration.studentId, 'stu_totally_ephemeral');
});

test('the ephemeral studentId never becomes a profile by itself — no profile is auto-created by saving', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile('Μαθητής 01');
    const admin = completedAdmin({ studentId: 'stu_ephemeral_xyz' });
    RAN.storage.saveAdministration(profile.profileId, admin);
    assert.strictEqual(RAN.storage.listProfiles().length, 1, 'still only the one explicitly created profile exists');
    assert.strictEqual(RAN.storage.getProfile('stu_ephemeral_xyz'), null, 'the ephemeral id was never turned into a profile');
});

test('saveAdministration rejects an unknown profileId without writing anything', () => {
    RAN.storage.configure(mockStorage());
    const admin = completedAdmin();
    const result = RAN.storage.saveAdministration('profile_unknown', admin);
    assert.strictEqual(result.saved, false);
    assert.ok(result.problems.length > 0);
    assert.strictEqual(RAN.storage.listAllAdministrations().length, 0);
});

test('saveAdministration rejects an administration that fails RAN.validateAdministration, without writing it', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile();
    const badAdmin = completedAdmin();
    badAdmin.durationMs = 0; // invalid for a rate-eligible status
    const result = RAN.storage.saveAdministration(profile.profileId, badAdmin);
    assert.strictEqual(result.saved, false);
    assert.ok(result.problems.some(p => p.includes('durationMs')));
    assert.strictEqual(RAN.storage.listAllAdministrations().length, 0);
});

test('saveAdministration rejects a duplicate administrationId (no silent overwrite)', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile();
    const admin = completedAdmin();
    const first = RAN.storage.saveAdministration(profile.profileId, admin);
    assert.strictEqual(first.saved, true);
    const second = RAN.storage.saveAdministration(profile.profileId, admin);
    assert.strictEqual(second.saved, false);
    assert.strictEqual(RAN.storage.listAllAdministrations().length, 1);
});

test('saved administrations accumulate WITHOUT any cap or ring-buffer deletion (unlike Phono.sessionLog)', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile();
    for (let i = 0; i < 40; i++) {
        const admin = completedAdmin({ studentId: 'stu_' + i, form: i % 2 === 0 ? 'A' : 'B' });
        const result = RAN.storage.saveAdministration(profile.profileId, admin);
        assert.strictEqual(result.saved, true, 'save #' + i + ' should succeed');
    }
    assert.strictEqual(RAN.storage.listAllAdministrations().length, 40, 'all 40 records are retained, none dropped');
});

test('listAdministrations filters strictly to the given profile', () => {
    RAN.storage.configure(mockStorage());
    const p1 = RAN.storage.createProfile('P1');
    const p2 = RAN.storage.createProfile('P2');
    RAN.storage.saveAdministration(p1.profileId, completedAdmin({ studentId: 'a' }));
    RAN.storage.saveAdministration(p2.profileId, completedAdmin({ studentId: 'b' }));
    RAN.storage.saveAdministration(p2.profileId, completedAdmin({ studentId: 'c', form: 'B' }));
    assert.strictEqual(RAN.storage.listAdministrations(p1.profileId).length, 1);
    assert.strictEqual(RAN.storage.listAdministrations(p2.profileId).length, 2);
    assert.ok(RAN.storage.listAdministrations(p1.profileId).every(a => a.studentId === p1.profileId));
});

console.log('\nItem 23 — deleteAdministration:');

test('deleteAdministration removes exactly one administration by id, leaving others untouched', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile();
    const a1 = RAN.storage.saveAdministration(profile.profileId, completedAdmin({ form: 'A' })).administration;
    const a2 = RAN.storage.saveAdministration(profile.profileId, completedAdmin({ form: 'B' })).administration;
    const result = RAN.storage.deleteAdministration(a1.administrationId);
    assert.strictEqual(result.deleted, true);
    const remaining = RAN.storage.listAllAdministrations();
    assert.strictEqual(remaining.length, 1);
    assert.strictEqual(remaining[0].administrationId, a2.administrationId);
});

test('deleteAdministration on an unknown id returns {deleted:false} without throwing and without changing storage', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile();
    RAN.storage.saveAdministration(profile.profileId, completedAdmin());
    const before = RAN.storage.listAllAdministrations().length;
    const result = RAN.storage.deleteAdministration('ran_does_not_exist_1');
    assert.strictEqual(result.deleted, false);
    assert.ok(result.problems.length > 0);
    assert.strictEqual(RAN.storage.listAllAdministrations().length, before, 'nothing was removed');
});

test('deleteAdministration is reflected immediately by listAdministrations/listAllAdministrations (no separate refresh step needed)', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile();
    const admin = RAN.storage.saveAdministration(profile.profileId, completedAdmin()).administration;
    assert.strictEqual(RAN.storage.listAdministrations(profile.profileId).length, 1);
    RAN.storage.deleteAdministration(admin.administrationId);
    assert.strictEqual(RAN.storage.listAdministrations(profile.profileId).length, 0, 'derived live from storage — deletion is visible on the very next read');
});

test('deleting one administration never removes its profile or any other administration of the same profile', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile('Stays');
    const a1 = RAN.storage.saveAdministration(profile.profileId, completedAdmin({ form: 'A' })).administration;
    RAN.storage.saveAdministration(profile.profileId, completedAdmin({ form: 'B' }));
    RAN.storage.deleteAdministration(a1.administrationId);
    assert.strictEqual(RAN.storage.getProfile(profile.profileId).displayLabel, 'Stays', 'profile itself untouched');
    assert.strictEqual(RAN.storage.listAdministrations(profile.profileId).length, 1, 'the other administration survives');
});

console.log('\nItem 23 — deleteProfile (cascade):');

test('deleteProfile removes the profile AND every administration referencing it, returns the correct count', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile('To Delete');
    RAN.storage.saveAdministration(profile.profileId, completedAdmin({ form: 'A' }));
    RAN.storage.saveAdministration(profile.profileId, completedAdmin({ form: 'B' }));
    RAN.storage.saveAdministration(profile.profileId, completedAdmin({ assessmentId: 'RAN_COLORS_V1' }));
    const result = RAN.storage.deleteProfile(profile.profileId);
    assert.strictEqual(result.deleted, true);
    assert.strictEqual(result.deletedAdministrationsCount, 3);
    assert.strictEqual(RAN.storage.getProfile(profile.profileId), null, 'profile itself is gone');
    assert.strictEqual(RAN.storage.listAllAdministrations().length, 0, 'no orphan administrations left behind');
});

test('deleteProfile with zero administrations still deletes the profile cleanly, count 0', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile('Empty');
    const result = RAN.storage.deleteProfile(profile.profileId);
    assert.strictEqual(result.deleted, true);
    assert.strictEqual(result.deletedAdministrationsCount, 0);
    assert.strictEqual(RAN.storage.getProfile(profile.profileId), null);
});

test('deleteProfile never touches a DIFFERENT profile or its administrations', () => {
    RAN.storage.configure(mockStorage());
    const doomed = RAN.storage.createProfile('Doomed');
    const safe = RAN.storage.createProfile('Safe');
    RAN.storage.saveAdministration(doomed.profileId, completedAdmin());
    RAN.storage.saveAdministration(safe.profileId, completedAdmin());
    RAN.storage.saveAdministration(safe.profileId, completedAdmin({ form: 'B' }));
    RAN.storage.deleteProfile(doomed.profileId);
    assert.strictEqual(RAN.storage.getProfile(safe.profileId).displayLabel, 'Safe', 'the other profile survives untouched');
    assert.strictEqual(RAN.storage.listAdministrations(safe.profileId).length, 2, 'its administrations survive untouched');
    assert.strictEqual(RAN.storage.listAllAdministrations().length, 2, 'only the doomed profile\'s administration is gone');
});

test('deleteProfile on an unknown profileId returns {deleted:false} without throwing and without changing storage', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile();
    RAN.storage.saveAdministration(profile.profileId, completedAdmin());
    const result = RAN.storage.deleteProfile('profile_does_not_exist');
    assert.strictEqual(result.deleted, false);
    assert.ok(result.problems.length > 0);
    assert.strictEqual(RAN.storage.listProfiles().length, 1, 'nothing removed');
    assert.strictEqual(RAN.storage.listAllAdministrations().length, 1, 'nothing removed');
});

test('exportAll after deleteProfile never includes the deleted profile or its administrations', () => {
    RAN.storage.configure(mockStorage());
    const doomed = RAN.storage.createProfile('Doomed');
    RAN.storage.saveAdministration(doomed.profileId, completedAdmin());
    const safe = RAN.storage.createProfile('Safe');
    RAN.storage.saveAdministration(safe.profileId, completedAdmin());
    RAN.storage.deleteProfile(doomed.profileId);
    const dump = RAN.storage.exportAll();
    assert.strictEqual(dump.profiles.length, 1);
    assert.strictEqual(dump.profiles[0].profileId, safe.profileId);
    assert.strictEqual(dump.administrations.length, 1);
    assert.strictEqual(dump.administrations[0].studentId, safe.profileId);
});

test('importAll still rejects an orphan administration after deleteProfile exists in the codebase (integrity regression check)', () => {
    // Not a deleteProfile call itself — confirms the pre-existing
    // orphan-rejection invariant (the very one deleteProfile's cascade
    // design is meant to never violate) still holds unmodified.
    RAN.storage.configure(mockStorage());
    const admin = Object.assign({}, completedAdmin(), { studentId: 'profile_never_existed', administrationId: 'ran_orphan_after_delete_1' });
    const report = RAN.storage.importAll({
        formatVersion: 1, exportedAt: new Date().toISOString(),
        profiles: [], administrations: [admin],
    });
    assert.strictEqual(report.skippedAdministrations.length, 1);
    assert.ok(report.skippedAdministrations[0].reason.includes('profileId'));
});

console.log('\nExport / Import:');

test('exportAll returns the locked shape with formatVersion/exportedAt/profiles/administrations', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile();
    RAN.storage.saveAdministration(profile.profileId, completedAdmin());
    const dump = RAN.storage.exportAll();
    assert.strictEqual(dump.formatVersion, 1);
    assert.ok(dump.exportedAt);
    assert.strictEqual(dump.profiles.length, 1);
    assert.strictEqual(dump.administrations.length, 1);
});

test('round-trip: export then import into a fresh empty store reproduces the same data', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile('Μαθητής 01');
    RAN.storage.saveAdministration(profile.profileId, completedAdmin());
    const dump = RAN.storage.exportAll();

    RAN.storage.configure(mockStorage()); // fresh empty store
    const report = RAN.storage.importAll(dump);
    assert.strictEqual(report.importedProfiles.length, 1);
    assert.strictEqual(report.importedAdministrations.length, 1);
    assert.strictEqual(report.skippedProfiles.length, 0);
    assert.strictEqual(report.skippedAdministrations.length, 0);
    assert.strictEqual(RAN.storage.listProfiles().length, 1);
    assert.strictEqual(RAN.storage.listAllAdministrations().length, 1);
});

test('round-trip: a RAN_OBJECTS_V1 administration survives export/import unchanged (Objects round)', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile('Μαθητής Αντικειμένων');
    const saveResult = RAN.storage.saveAdministration(profile.profileId, completedAdmin({ assessmentId: 'RAN_OBJECTS_V1' }));
    assert.strictEqual(saveResult.saved, true, JSON.stringify(saveResult.problems));
    const dump = RAN.storage.exportAll();

    RAN.storage.configure(mockStorage());
    const report = RAN.storage.importAll(dump);
    assert.strictEqual(report.importedAdministrations.length, 1);
    const imported = RAN.storage.listAllAdministrations()[0];
    assert.strictEqual(imported.assessmentId, 'RAN_OBJECTS_V1');
    assert.deepStrictEqual(imported.stimulusSequence, saveResult.administration.stimulusSequence);
});

test('importAll skips (and reports) a profileId that already exists locally, without overwriting it', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile('Original Label');
    const report = RAN.storage.importAll({
        formatVersion: 1, exportedAt: new Date().toISOString(),
        profiles: [{ profileId: profile.profileId, displayLabel: 'Malicious Overwrite', createdAt: new Date().toISOString() }],
        administrations: [],
    });
    assert.strictEqual(report.skippedProfiles.length, 1);
    assert.strictEqual(report.skippedProfiles[0].profileId, profile.profileId);
    assert.strictEqual(RAN.storage.getProfile(profile.profileId).displayLabel, 'Original Label', 'not overwritten');
});

test('importAll skips (and reports) a duplicate administrationId, without overwriting it', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile();
    const admin = completedAdmin();
    RAN.storage.saveAdministration(profile.profileId, admin);
    const stored = RAN.storage.listAllAdministrations()[0];

    const tampered = Object.assign({}, stored, { substitutions: 99 });
    const report = RAN.storage.importAll({
        formatVersion: 1, exportedAt: new Date().toISOString(),
        profiles: [], administrations: [tampered],
    });
    assert.strictEqual(report.skippedAdministrations.length, 1);
    assert.strictEqual(RAN.storage.listAllAdministrations()[0].substitutions, stored.substitutions, 'original untouched');
});

test('importAll rejects a malformed/incompatible administration via RAN.validateAdministration, and reports why', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile();
    const badAdmin = Object.assign({}, completedAdmin(), { studentId: profile.profileId, administrationId: 'ran_bad_1', stimulusSequence: ['999', '999'] });
    const report = RAN.storage.importAll({
        formatVersion: 1, exportedAt: new Date().toISOString(),
        profiles: [], administrations: [badAdmin],
    });
    assert.strictEqual(report.importedAdministrations.length, 0);
    assert.strictEqual(report.skippedAdministrations.length, 1);
    assert.ok(report.skippedAdministrations[0].reason.includes('failed validation'));
    assert.strictEqual(RAN.storage.listAllAdministrations().length, 0);
});

test('importAll rejects an administration referencing a profileId not present locally', () => {
    RAN.storage.configure(mockStorage());
    const admin = Object.assign({}, completedAdmin(), { studentId: 'profile_does_not_exist_locally', administrationId: 'ran_orphan_1' });
    const report = RAN.storage.importAll({
        formatVersion: 1, exportedAt: new Date().toISOString(),
        profiles: [], administrations: [admin],
    });
    assert.strictEqual(report.skippedAdministrations.length, 1);
    assert.ok(report.skippedAdministrations[0].reason.includes('profileId'));
});

test('importAll throws on a fundamentally malformed payload shape', () => {
    RAN.storage.configure(mockStorage());
    assert.throws(() => RAN.storage.importAll({ profiles: 'not-an-array', administrations: [] }));
    assert.throws(() => RAN.storage.importAll(null));
});

console.log('\nMigration: initialCorrect -> independentCorrect (Scientific Protocol Correction decision §1):');

test('migrateAdministrationRecord renames initialCorrect and recomputes via the new formula (not a raw copy)', () => {
    const old = { administrationId: 'x1', totalStimuli: 20, substitutions: 2, omissions: 1, examinerProvidedAnswers: 1, initialCorrect: 17 };
    const migrated = RAN.storage.migrateAdministrationRecord(old);
    assert.strictEqual(migrated.independentCorrect, 16); // 20-2-1-1, NOT the stale 17
    assert.ok(!('initialCorrect' in migrated));
});

test('migrateAdministrationRecord defaults a missing examinerProvidedAnswers to 0', () => {
    const old = { administrationId: 'x2', totalStimuli: 20, substitutions: 1, omissions: 0, initialCorrect: 19 };
    const migrated = RAN.storage.migrateAdministrationRecord(old);
    assert.strictEqual(migrated.independentCorrect, 19);
    assert.strictEqual(migrated.examinerProvidedAnswers, 0);
});

test('migrateAdministrationRecord never mutates the input object', () => {
    const old = { administrationId: 'x3', totalStimuli: 20, substitutions: 0, omissions: 0, initialCorrect: 20 };
    RAN.storage.migrateAdministrationRecord(old);
    assert.ok('initialCorrect' in old, 'original object left untouched');
});

test('migrateAdministrationRecord is a no-op for an already-current record', () => {
    const current = completedAdmin();
    const migrated = RAN.storage.migrateAdministrationRecord(current);
    assert.strictEqual(migrated, current, 'returns the exact same reference, no needless copy');
});

test('listAllAdministrations migrates a raw V1-development record found directly in storage', () => {
    const backend = mockStorage();
    RAN.storage.configure(backend);
    const profile = RAN.storage.createProfile();
    const oldShapeAdmin = Object.assign({}, completedAdmin(), {
        studentId: profile.profileId,
        administrationId: 'ran_old_shape_1',
    });
    delete oldShapeAdmin.independentCorrect;
    oldShapeAdmin.initialCorrect = 19; // pre-examinerProvidedAnswers-era stale value
    backend.setItem(RAN.storage.ADMINISTRATIONS_KEY, JSON.stringify([oldShapeAdmin]));

    const all = RAN.storage.listAllAdministrations();
    assert.strictEqual(all.length, 1);
    assert.ok(!('initialCorrect' in all[0]));
    assert.strictEqual(all[0].independentCorrect, 19); // 20 - 1 (substitutions) - 0 - 0

    const raw = JSON.parse(backend.getItem(RAN.storage.ADMINISTRATIONS_KEY));
    assert.ok('initialCorrect' in raw[0], 'migration is read-time only — localStorage itself is left untouched');
});

test('importAll migrates an old-shaped exported administration before validating/storing it', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile();
    const oldShapeAdmin = Object.assign({}, completedAdmin(), {
        studentId: profile.profileId,
        administrationId: 'ran_old_shape_import_1',
    });
    delete oldShapeAdmin.independentCorrect;
    oldShapeAdmin.initialCorrect = 19;

    const report = RAN.storage.importAll({
        formatVersion: 1, exportedAt: new Date().toISOString(),
        profiles: [], administrations: [oldShapeAdmin],
    });
    assert.strictEqual(report.importedAdministrations.length, 1, JSON.stringify(report.skippedAdministrations));
    const stored = RAN.storage.listAllAdministrations()[0];
    assert.strictEqual(stored.independentCorrect, 19);
    assert.ok(!('initialCorrect' in stored));
});

console.log('\nGrade — strict write / tolerant read:');

test('createProfile stores an optional grade; defaults to null when omitted', () => {
    RAN.storage.configure(mockStorage());
    const withGrade = RAN.storage.createProfile('A', RAN.GRADE.G_DIMOTIKOU);
    assert.strictEqual(withGrade.grade, RAN.GRADE.G_DIMOTIKOU);
    const withoutGrade = RAN.storage.createProfile('B');
    assert.strictEqual(withoutGrade.grade, null);
});

test('createProfile throws on an invalid grade value (strict write — never silently coerced/dropped)', () => {
    RAN.storage.configure(mockStorage());
    assert.throws(() => RAN.storage.createProfile('X', 'NOT_A_REAL_GRADE'));
});

test('updateProfileGrade updates profile.grade; throws on an invalid value; throws on an unknown profileId', () => {
    RAN.storage.configure(mockStorage());
    const p = RAN.storage.createProfile('A', RAN.GRADE.A_DIMOTIKOU);
    const updated = RAN.storage.updateProfileGrade(p.profileId, RAN.GRADE.B_DIMOTIKOU);
    assert.strictEqual(updated.grade, RAN.GRADE.B_DIMOTIKOU);
    assert.strictEqual(RAN.storage.getProfile(p.profileId).grade, RAN.GRADE.B_DIMOTIKOU);
    assert.throws(() => RAN.storage.updateProfileGrade(p.profileId, 'GARBAGE'));
    assert.throws(() => RAN.storage.updateProfileGrade('profile_does_not_exist', RAN.GRADE.A_DIMOTIKOU));
});

test('saveAdministration persists an explicit gradeAtAdministration verbatim — never inferred/defaulted from profile.grade', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile('A', RAN.GRADE.A_DIMOTIKOU);
    const admin = completedAdmin();
    admin.gradeAtAdministration = RAN.GRADE.G_DIMOTIKOU; // deliberately differs from profile.grade
    const result = RAN.storage.saveAdministration(profile.profileId, admin);
    assert.strictEqual(result.saved, true, JSON.stringify(result.problems));
    assert.strictEqual(result.administration.gradeAtAdministration, RAN.GRADE.G_DIMOTIKOU, 'the explicit value is kept exactly as given, not silently replaced by profile.grade (A_DIMOTIKOU)');
});

test('saveAdministration rejects an invalid gradeAtAdministration instead of silently dropping/defaulting it', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile('A');
    const admin = completedAdmin();
    admin.gradeAtAdministration = 'NOT_A_REAL_GRADE';
    const result = RAN.storage.saveAdministration(profile.profileId, admin);
    assert.strictEqual(result.saved, false);
    assert.strictEqual(RAN.storage.listAllAdministrations().length, 0);
});

test('saveAdministration accepts a null/absent gradeAtAdministration (examiner left it unset)', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile('A');
    const result = RAN.storage.saveAdministration(profile.profileId, completedAdmin());
    assert.strictEqual(result.saved, true, JSON.stringify(result.problems));
    assert.strictEqual(result.administration.gradeAtAdministration, null);
});

test('grade snapshot immutability: changing profile.grade afterwards never alters an already-saved gradeAtAdministration', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile('A', RAN.GRADE.A_DIMOTIKOU);
    const admin = completedAdmin();
    admin.gradeAtAdministration = RAN.GRADE.A_DIMOTIKOU;
    const saved = RAN.storage.saveAdministration(profile.profileId, admin);
    RAN.storage.updateProfileGrade(profile.profileId, RAN.GRADE.ST_DIMOTIKOU);
    const stored = RAN.storage.listAdministrations(profile.profileId).find(a => a.administrationId === saved.administration.administrationId);
    assert.strictEqual(stored.gradeAtAdministration, RAN.GRADE.A_DIMOTIKOU, 'snapshot unchanged');
    assert.strictEqual(RAN.storage.getProfile(profile.profileId).grade, RAN.GRADE.ST_DIMOTIKOU, 'profile.grade itself did change');
});

test('export/import round-trip preserves both profile.grade and gradeAtAdministration exactly', () => {
    RAN.storage.configure(mockStorage());
    const profile = RAN.storage.createProfile('A', RAN.GRADE.D_DIMOTIKOU);
    const admin = completedAdmin();
    admin.gradeAtAdministration = RAN.GRADE.E_DIMOTIKOU;
    const saved = RAN.storage.saveAdministration(profile.profileId, admin);
    const dump = RAN.storage.exportAll();

    RAN.storage.configure(mockStorage());
    const report = RAN.storage.importAll(dump);
    assert.strictEqual(report.importedProfiles.length, 1);
    assert.strictEqual(report.importedAdministrations.length, 1);
    assert.strictEqual(RAN.storage.getProfile(profile.profileId).grade, RAN.GRADE.D_DIMOTIKOU);
    const imported = RAN.storage.listAllAdministrations().find(a => a.administrationId === saved.administration.administrationId);
    assert.strictEqual(imported.gradeAtAdministration, RAN.GRADE.E_DIMOTIKOU);
});

test('importAll allowlist includes grade — a profile record with an unrecognized legacy grade still imports (tolerant read)', () => {
    RAN.storage.configure(mockStorage());
    const report = RAN.storage.importAll({
        formatVersion: 1, exportedAt: new Date().toISOString(),
        profiles: [{ profileId: 'profile_legacy_1', displayLabel: 'Legacy', createdAt: new Date().toISOString(), grade: 'SOME_OLD_UNRECOGNIZED_CODE' }],
        administrations: [],
    });
    assert.strictEqual(report.importedProfiles.length, 1);
    assert.strictEqual(RAN.storage.getProfile('profile_legacy_1').grade, 'SOME_OLD_UNRECOGNIZED_CODE', 'raw value preserved as-is, not rejected/rewritten');
});

test('importAll allowlist: a profile record with NO grade field at all (pre-grade export) imports with grade: null', () => {
    RAN.storage.configure(mockStorage());
    const report = RAN.storage.importAll({
        formatVersion: 1, exportedAt: new Date().toISOString(),
        profiles: [{ profileId: 'profile_pregrade_1', displayLabel: 'Pre-grade', createdAt: new Date().toISOString() }],
        administrations: [],
    });
    assert.strictEqual(report.importedProfiles.length, 1);
    assert.strictEqual(RAN.storage.getProfile('profile_pregrade_1').grade, null, 'never left undefined/silently dropped — an explicit null');
});

/* ============================================================ */
console.log(`\n${passed} passed, ${process.exitCode === 1 ? 'with failures above' : '0 failed'}`);
if (process.exitCode !== 1) console.log('ALL TESTS PASSED');
