/* ============================================================
   RAN Objects — production asset safeguard

   Guards against the development-placeholder images silently
   reappearing (or a partial/incomplete asset swap) once the final
   RAN_OBJECTS_V1 artwork is installed. Checks, per canonical stimulus:
     1. The production asset file (assets/objects/<id>.png) exists.
     2. It is a real PNG (magic-byte signature check, not just a file
        extension) with a genuine alpha channel (RGBA color type), and
        does not contain the literal bytes "PLACEHOLDER" anywhere in
        its raw content (binary-safe latin1 scan — never decoded as
        UTF-8, so this is safe to run against arbitrary binary PNG
        data without corrupting or misreading it).
     3. No leftover "not approved" flag/marker file (any filename
        containing "PLACEHOLDER") exists anywhere in assets/objects/.
     4. No leftover .svg placeholder file remains for any canonical
        stimulus (the format this tool shipped with during
        development, before the final PNG artwork was approved).

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

console.log('RAN Objects — production asset safeguard\n');

const assetsDir = path.join(__dirname, '..', 'assets', 'objects');
const def = RAN.getDefinition('RAN_OBJECTS_V1');

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
// PNG color type byte (offset 25 in a standard PNG: 8-byte signature +
// 4-byte IHDR length + 4-byte "IHDR" + 4-byte width + 4-byte height +
// 1-byte bit depth = offset 25). Color type 6 = truecolor with alpha
// (RGBA) — the only type that carries a real per-pixel alpha channel.
const PNG_COLOR_TYPE_OFFSET = 25;
const PNG_COLOR_TYPE_RGBA = 6;

def.stimuli.forEach(id => {
    test(`assets/objects/${id}.png exists, is a real PNG with an alpha channel, and contains no "PLACEHOLDER"`, () => {
        const file = path.join(assetsDir, `${id}.png`);
        assert.ok(fs.existsSync(file), `missing production asset file: ${file}`);
        const buf = fs.readFileSync(file);
        assert.ok(buf.subarray(0, 8).equals(PNG_SIGNATURE), `${id}.png does not have a valid PNG file signature`);
        assert.strictEqual(
            buf[PNG_COLOR_TYPE_OFFSET], PNG_COLOR_TYPE_RGBA,
            `${id}.png color type is ${buf[PNG_COLOR_TYPE_OFFSET]}, expected ${PNG_COLOR_TYPE_RGBA} (RGBA/truecolor+alpha) — the asset must have a real transparent background`
        );
        // Binary-safe substring scan: latin1 maps each byte to one
        // character 1:1, so an ASCII marker string is found reliably
        // regardless of the surrounding binary PNG data.
        const asLatin1 = buf.toString('latin1').toUpperCase();
        assert.ok(
            !asLatin1.includes('PLACEHOLDER'),
            `assets/objects/${id}.png still contains "PLACEHOLDER" — this looks like a leftover development placeholder, not approved final artwork.`
        );
    });

    test(`no leftover placeholder .svg remains for "${id}"`, () => {
        const staleSvg = path.join(assetsDir, `${id}.svg`);
        assert.ok(!fs.existsSync(staleSvg), `found a leftover placeholder file: ${staleSvg} — delete it now that the final PNG artwork is installed`);
    });
});

test('assets/objects/ contains no "not approved" placeholder flag/marker file', () => {
    const entries = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
    const flagFiles = entries.filter(name => name.toUpperCase().includes('PLACEHOLDER'));
    assert.deepStrictEqual(
        flagFiles, [],
        `found placeholder flag/marker file(s) in assets/objects/: ${JSON.stringify(flagFiles)} — `
        + `their presence means the Objects image assets are still marked as not approved for production.`
    );
});

console.log(`\n${passed} passed, ${process.exitCode === 1 ? 'some' : '0'} failed`);
if (process.exitCode !== 1) {
    console.log('ALL TESTS PASSED');
}
