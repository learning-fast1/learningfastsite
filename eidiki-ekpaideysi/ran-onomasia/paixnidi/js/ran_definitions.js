/* ============================================================
   RAN — Assessment Definitions (Phase 1: data model only)

   Fixed, versioned stimulus matrices for Rapid Automatized Naming.
   Per spec §9 ("ABSOLUTELY NO RUNTIME RANDOMIZATION"), every form
   below is a literal, hand-authored sequence copied from the
   specification — never generated, shuffled, or derived at runtime.
   Definitions are deep-frozen at load time so no later code path can
   silently mutate a stored sequence (spec §62, §9).

   Dual Node/browser module: attaches to `window.RAN` in a browser,
   and is `require()`-able from a plain Node test script (no bundler,
   no build step — matches this repo's zero-tooling convention).
   ============================================================ */
(function (root) {
    'use strict';

    const RAN = root.RAN = root.RAN || {};

    /** Recursively Object.freeze()s an object/array tree. Used on every
     * assessment definition so a form's stimulus sequence can never be
     * mutated after load — the spec treats "no runtime randomization"
     * as a measurement requirement, not just a coding convention, so
     * this is enforced structurally rather than by trust alone. */
    function deepFreeze(value) {
        if (value && typeof value === 'object' && !Object.isFrozen(value)) {
            Object.getOwnPropertyNames(value).forEach(key => deepFreeze(value[key]));
            Object.freeze(value);
        }
        return value;
    }

    /* ----------------------------------------------------------
       RAN_DIGITS_V1 — spec §10
       ---------------------------------------------------------- */
    const RAN_DIGITS_V1 = {
        id: 'RAN_DIGITS_V1',
        type: 'digits',
        version: 1,
        label: 'Αριθμοί',
        // Plain digit strings — no verbal-label lookup needed, the
        // stimulus text IS what the child says.
        stimuli: ['1', '2', '3', '4', '5'],
        itemsPerStimulus: 4,
        totalStimuli: 20,
        layout: { rows: 4, columns: 5 },
        forms: {
            A: [
                ['2', '5', '1', '4', '3'],
                ['4', '2', '5', '3', '1'],
                ['3', '1', '4', '5', '2'],
                ['5', '3', '2', '1', '4'],
            ],
            B: [
                ['3', '1', '5', '2', '4'],
                ['5', '4', '2', '1', '3'],
                ['2', '5', '3', '4', '1'],
                ['4', '2', '1', '3', '5'],
            ],
        },
    };

    /* ----------------------------------------------------------
       RAN_COLORS_V1 — spec §11
       Internal stimulus IDs are the color codes (RED/BLUE/...); the
       verbal label a child is expected to say lives in
       `stimulusLabels`, kept separate from the ID on purpose so the
       rendering layer (Phase 3) can draw an identical filled-circle
       shape for every stimulus and vary ONLY the fill color, per
       spec §5.2 ("color as the only variable").
       ---------------------------------------------------------- */
    const RAN_COLORS_V1 = {
        id: 'RAN_COLORS_V1',
        type: 'colors',
        version: 1,
        label: 'Χρώματα',
        stimuli: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK'],
        stimulusLabels: {
            RED: 'κόκκινο',
            BLUE: 'μπλε',
            GREEN: 'πράσινο',
            YELLOW: 'κίτρινο',
            BLACK: 'μαύρο',
        },
        itemsPerStimulus: 4,
        totalStimuli: 20,
        layout: { rows: 4, columns: 5 },
        forms: {
            A: [
                ['BLUE', 'RED', 'YELLOW', 'GREEN', 'BLACK'],
                ['GREEN', 'YELLOW', 'BLUE', 'BLACK', 'RED'],
                ['BLACK', 'BLUE', 'RED', 'YELLOW', 'GREEN'],
                ['YELLOW', 'BLACK', 'GREEN', 'RED', 'BLUE'],
            ],
            B: [
                ['GREEN', 'BLACK', 'RED', 'BLUE', 'YELLOW'],
                ['RED', 'GREEN', 'YELLOW', 'BLACK', 'BLUE'],
                ['BLUE', 'YELLOW', 'BLACK', 'GREEN', 'RED'],
                ['BLACK', 'BLUE', 'GREEN', 'YELLOW', 'RED'],
            ],
        },
    };

    /* ----------------------------------------------------------
       RAN_OBJECTS_V1 — controlled extension (Objects round).
       5 canonical stimuli, LOCKED as of this pass: apple/hen/vase/
       gift/ball (Greek: μήλο/κότα/βάζο/δώρο/μπάλα). Internal IDs are
       plain English words — never the Greek label itself — so an ID
       can never accidentally leak the expected answer into a CSS
       selector, log line, or `data-stimulus` attribute; the verbal
       label a child is expected to say lives separately in
       `stimulusLabels`, exactly like RAN_COLORS_V1's own pattern.
       Rendering is image-based (see ran_ui.js renderStimulus) —
       `assets/objects/<id>.png` is the fixed filename convention, one
       file per canonical ID. PNG (not SVG) because that's the real
       format the final approved artwork was supplied in. Form A/B
       sequences below were verified
       against RAN.validateFormSequence's exact invariants (occurrence
       counts, no unknown IDs) plus additionally hand-checked for zero
       immediate repeats and no shared/duplicate rows between Form A
       and Form B before being locked here — see the Objects round's
       own verification script, not committed to this repo, that
       confirmed this before these arrays were written by hand.
       Form A and Form B are this tool's own forms — NOT standardized,
       normed, validated, or claimed psychometrically equivalent to
       each other. The A/B longitudinal policy (locked separately)
       already treats them accordingly regardless of assessment type.
       ---------------------------------------------------------- */
    const RAN_OBJECTS_V1 = {
        id: 'RAN_OBJECTS_V1',
        type: 'objects',
        version: 1,
        label: 'Αντικείμενα',
        stimuli: ['apple', 'hen', 'vase', 'gift', 'ball'],
        stimulusLabels: {
            apple: 'μήλο',
            hen: 'κότα',
            vase: 'βάζο',
            gift: 'δώρο',
            ball: 'μπάλα',
        },
        itemsPerStimulus: 4,
        totalStimuli: 20,
        layout: { rows: 4, columns: 5 },
        forms: {
            A: [
                ['vase', 'gift', 'ball', 'apple', 'hen'],
                ['ball', 'apple', 'hen', 'vase', 'gift'],
                ['hen', 'vase', 'gift', 'ball', 'apple'],
                ['gift', 'ball', 'apple', 'hen', 'vase'],
            ],
            B: [
                ['hen', 'ball', 'apple', 'vase', 'gift'],
                ['apple', 'vase', 'gift', 'hen', 'ball'],
                ['gift', 'hen', 'ball', 'apple', 'vase'],
                ['ball', 'apple', 'vase', 'gift', 'hen'],
            ],
        },
    };

    RAN.definitions = {
        RAN_DIGITS_V1: deepFreeze(RAN_DIGITS_V1),
        RAN_COLORS_V1: deepFreeze(RAN_COLORS_V1),
        RAN_OBJECTS_V1: deepFreeze(RAN_OBJECTS_V1),
    };
    deepFreeze(RAN.definitions);

    /** Which definition ID is "current" per assessment type — lets
     * future code ask "give me the current Digits assessment" without
     * hardcoding a version number, while still keeping every version
     * ever administered individually addressable by its own fixed ID
     * (spec §12). */
    RAN.CURRENT_VERSIONS = deepFreeze({
        digits: 'RAN_DIGITS_V1',
        colors: 'RAN_COLORS_V1',
        objects: 'RAN_OBJECTS_V1',
    });

    /** Looks up a definition by its fixed ID. Throws rather than
     * returning undefined — every call site needs a real definition to
     * proceed safely (form rendering, sequence flattening, scoring all
     * depend on it existing), so a typo'd/unknown ID should fail loud
     * immediately instead of surfacing as a confusing null downstream. */
    RAN.getDefinition = function (assessmentId) {
        const def = RAN.definitions[assessmentId];
        if (!def) throw new Error(`RAN: unknown assessment definition "${assessmentId}"`);
        return def;
    };

    RAN.deepFreeze = deepFreeze;

    if (typeof module !== 'undefined' && module.exports) module.exports = RAN;
})(typeof window !== 'undefined' ? window : globalThis);
