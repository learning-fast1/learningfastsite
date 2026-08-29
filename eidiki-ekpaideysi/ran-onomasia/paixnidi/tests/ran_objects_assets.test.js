/* ============================================================
   RAN Objects — placeholder-asset safeguard (dedicated, separate
   from the other suites on purpose)

   This suite is EXPECTED TO FAIL as long as the RAN_OBJECTS_V1 image
   assets are still the development placeholders — that failure is the
   safeguard, not a bug. It exists so nobody can ship this feature
   without a deliberate, visible step: replacing every
   assets/objects/<id>.svg with an approved final asset AND deleting
   assets/objects/README-PLACEHOLDER.md (the "not approved yet" flag).

   Two independent checks, either of which alone is enough to catch a
   forgotten placeholder:
     1. No production object asset file may contain the string
        "PLACEHOLDER" (case-insensitive) anywhere in its contents.
     2. No "not approved" flag/marker file (any filename containing
        "PLACEHOLDER") may exist in assets/objects/.

   Run with: node ran_objects_assets.test.js
   Does not touch runtime code — this only reads files already in the
   repo, exactly like ran_engine.test.js's own asset-existence check.
   ============================================================ */
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const RAN = require(path.join(__dirname, '..', 'js', 'ran_definitions.js'));

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

console.log('RAN Objects — placeholder-asset safeguard\n');
console.log('NOTE: failures here are EXPECTED until final assets are approved and installed.\n');

const assetsDir = path.join(__dirname, '..', 'assets', 'objects');
const def = RAN.getDefinition('RAN_OBJECTS_V1');

def.stimuli.forEach(id => {
    test(`assets/objects/${id}.svg exists and does not contain "PLACEHOLDER"`, () => {
        const file = path.join(assetsDir, `${id}.svg`);
        assert.ok(fs.existsSync(file), `missing asset file: ${file}`);
        const contents = fs.readFileSync(file, 'utf8');
        assert.ok(
            !contents.toUpperCase().includes('PLACEHOLDER'),
            `assets/objects/${id}.svg still contains "PLACEHOLDER" — this is a development placeholder, not an approved final asset. `
            + `Replace it with the approved final artwork before this test may pass.`
        );
    });
});

test('assets/objects/ contains no "not approved" placeholder flag/marker file', () => {
    const entries = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
    const flagFiles = entries.filter(name => name.toUpperCase().includes('PLACEHOLDER'));
    assert.deepStrictEqual(
        flagFiles, [],
        `found placeholder flag/marker file(s) in assets/objects/: ${JSON.stringify(flagFiles)} — `
        + `their presence means the Objects image assets have not been approved for production yet. `
        + `Delete them only once every stimulus asset above has been replaced with approved final artwork.`
    );
});

console.log(`\n${passed} passed, ${process.exitCode === 1 ? 'some' : '0'} failed`);
if (process.exitCode !== 1) {
    console.log('ALL TESTS PASSED');
} else {
    console.log('EXPECTED (until final Objects assets are approved): placeholder safeguard is correctly blocking production readiness.');
}
