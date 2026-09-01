/* ============================================================
   RAN — Phase 2: Preparation state machine (Familiarity + Practice)

   Pure logic only — no DOM. Every transition is an explicit, named
   function; there is no path from ASSESSMENT_SELECTED to
   READY_FOR_TIMED_ASSESSMENT that skips a passed Familiarity check and
   a passed Practice attempt (spec §13 "Familiarity and Practice must
   NOT be skipped in the normal workflow").

   State machine:
     ASSESSMENT_SELECTED
       -> FAMILIARITY
     FAMILIARITY
       -> PRACTICE                (finalizeFamiliarityCheck, all known)
       -> PREPARATION_FAILED      (finalizeFamiliarityCheck, not all known)
                                   reason: FAMILIARITY_NOT_ESTABLISHED
     PRACTICE
       -> READY_FOR_TIMED_ASSESSMENT  (all 3 procedural checks confirmed)
       -> FAMILIARITY              (returnToFamiliarityFromPractice — naming errors)
       -> PRACTICE                 (retryPractice — only from attempt 1)
       -> PREPARATION_FAILED       (failSerialProcedure — only from attempt 2)
                                    reason: SERIAL_PROCEDURE_NOT_ESTABLISHED
     PREPARATION_FAILED
       -> FAMILIARITY               (repeatFamiliarityCheck, only reachable
                                      when the failure came from Familiarity)
       (terminated: true)           (endPreparation — dead end, no further
                                      state changes; UI shows a closing screen)

   No timers, no scored fields, no arbitrary time cutoffs anywhere in
   this file — Familiarity/Practice are examiner-judged, per spec
   §14-24.

   Dual Node/browser module, same pattern as ran_definitions.js /
   ran_engine.js.
   ============================================================ */
(function (root) {
    'use strict';

    const RAN = root.RAN = root.RAN || {};
    if (!RAN.definitions || !RAN.getDefinition) {
        throw new Error('RAN.preparation requires ran_definitions.js to be loaded first');
    }
    if (!RAN.PREPARATION_FAILURE_REASON) {
        throw new Error('RAN.preparation requires ran_engine.js to be loaded first');
    }

    RAN.PREP_STATE = RAN.deepFreeze({
        ASSESSMENT_SELECTED: 'ASSESSMENT_SELECTED',
        FAMILIARITY: 'FAMILIARITY',
        PRACTICE: 'PRACTICE',
        READY_FOR_TIMED_ASSESSMENT: 'READY_FOR_TIMED_ASSESSMENT',
        PREPARATION_FAILED: 'PREPARATION_FAILED',
    });

    RAN.FAMILIARITY_MARK = RAN.deepFreeze({
        KNOWN: 'known',
        DIFFICULTY: 'difficulty',
    });

    const MAX_PRACTICE_ATTEMPTS = 2; // initial attempt + exactly one retry (spec §24)

    /* ----------------------------------------------------------
       Practice content — LOCKED in the Phase 2 correction pass.
       2 rows x 5 items = 10 stimuli per assessment (spec §20's "short
       practice matrix," given a concrete fixed size). Fixed, never
       randomized; kept in its own namespace, never merged into
       RAN.definitions, so it can never be mistaken for scoreable/
       versioned assessment content. Hand-checked (and verified by
       RAN.validatePracticeMaterials() below / tests) to satisfy:
         - only stimuli from the assessment's own definition,
         - no immediately-repeated stimulus anywhere in the flattened
           10-item sequence (including across the row boundary),
         - no row identical to any row of that assessment's Form A/B,
         - no obviously predictable pattern (not the identity order,
           not the definition's own stimuli order, not sorted).
       ---------------------------------------------------------- */
    RAN.practiceMaterials = RAN.deepFreeze({
        RAN_DIGITS_V1: { rows: [['2', '4', '1', '5', '3'], ['4', '1', '3', '2', '5']] },
        RAN_COLORS_V1: { rows: [['YELLOW', 'RED', 'BLACK', 'BLUE', 'GREEN'], ['BLACK', 'GREEN', 'RED', 'YELLOW', 'BLUE']] },
        RAN_OBJECTS_V1: { rows: [['apple', 'vase', 'ball', 'hen', 'gift'], ['vase', 'gift', 'apple', 'ball', 'hen']] },
        // V2 reuses the exact same practice rows as V1 — Practice is an
        // untimed, unscored procedural check independent of which timed
        // Forms A/B are in play, and these rows were re-checked against
        // RAN.validatePracticeMaterials's own invariants (no row shared
        // with any V2 Form A/B row either) before being reused here.
        RAN_DIGITS_V2: { rows: [['2', '4', '1', '5', '3'], ['4', '1', '3', '2', '5']] },
        RAN_COLORS_V2: { rows: [['YELLOW', 'RED', 'BLACK', 'BLUE', 'GREEN'], ['BLACK', 'GREEN', 'RED', 'YELLOW', 'BLUE']] },
        RAN_OBJECTS_V2: { rows: [['apple', 'vase', 'ball', 'hen', 'gift'], ['vase', 'gift', 'apple', 'ball', 'hen']] },
    });

    /** Validates RAN.practiceMaterials against the invariants locked
     * above. Returns `{ valid, problems: [{ assessmentId, problems }] }`,
     * same shape as RAN.validateAllDefinitions() in ran_engine.js. */
    RAN.validatePracticeMaterials = function () {
        const allProblems = [];
        Object.keys(RAN.practiceMaterials).forEach(assessmentId => {
            const problems = [];
            const definition = RAN.getDefinition(assessmentId);
            const material = RAN.practiceMaterials[assessmentId];
            const rows = material.rows;

            if (rows.length !== 2) problems.push(`Expected 2 rows, got ${rows.length}`);
            rows.forEach((row, i) => {
                if (row.length !== 5) problems.push(`Row ${i} expected 5 items, got ${row.length}`);
            });

            const flat = rows.flat();
            if (flat.length !== 10) problems.push(`Expected 10 total stimuli, got ${flat.length}`);

            flat.forEach(s => {
                if (!definition.stimuli.includes(s)) problems.push(`Unknown stimulus "${s}" not in ${assessmentId}'s definition`);
            });

            for (let i = 1; i < flat.length; i++) {
                if (flat[i] === flat[i - 1]) problems.push(`Immediate repeat of "${flat[i]}" at position ${i}`);
            }

            Object.keys(definition.forms).forEach(formKey => {
                definition.forms[formKey].forEach((formRow, i) => {
                    rows.forEach((practiceRow, j) => {
                        if (JSON.stringify(formRow) === JSON.stringify(practiceRow)) {
                            problems.push(`Practice row ${j} is identical to Form ${formKey} row ${i}`);
                        }
                    });
                });
            });

            const isSorted = arr => arr.every((v, i) => i === 0 || definition.stimuli.indexOf(v) > definition.stimuli.indexOf(arr[i - 1]));
            rows.forEach((row, i) => {
                if (JSON.stringify(row) === JSON.stringify(definition.stimuli)) {
                    problems.push(`Practice row ${i} matches the definition's own stimuli order exactly (obvious pattern)`);
                } else if (isSorted(row)) {
                    problems.push(`Practice row ${i} is in ascending definition order (obvious pattern)`);
                }
            });

            if (problems.length > 0) allProblems.push({ assessmentId, problems });
        });
        return { valid: allProblems.length === 0, problems: allProblems };
    };

    /** Starts a new preparation session for one assessment definition.
     * Nothing here is persisted/scored — this session object lives only
     * in memory for the duration of the preparation flow. */
    RAN.preparation = {
        createSession(assessmentId) {
            const definition = RAN.getDefinition(assessmentId); // throws if unknown
            const marks = {};
            const assistanceGiven = {};
            definition.stimuli.forEach(s => { marks[s] = null; assistanceGiven[s] = 0; });

            return {
                assessmentId,
                state: RAN.PREP_STATE.ASSESSMENT_SELECTED,
                terminated: false,
                failureReason: null,
                // Item 16 (audit/context metadata): counts how many
                // FAMILIARITY_NOT_ESTABLISHED re-checks this session has
                // gone through (repeatFamiliarityCheck below is the only
                // place that increments it — that's the only path
                // reachable exclusively via a Δυσκολία mark). 0 here
                // means "no re-check happened yet"; flows through to
                // administration.familiarityRetriesUsed at build time
                // (ran_ui.js), never derived/recomputed anywhere else.
                familiarity: { marks, assistanceGiven, retriesUsed: 0 },
                practice: {
                    attemptNumber: 0,
                    checklist: { startPosition: false, leftToRight: false, rowTransition: false },
                },
            };
        },

        /** ASSESSMENT_SELECTED -> FAMILIARITY. The only entry point into
         * the flow — there is no other way to reach FAMILIARITY. */
        beginFamiliarity(session) {
            assertState(session, [RAN.PREP_STATE.ASSESSMENT_SELECTED]);
            return Object.assign(cloneSession(session), { state: RAN.PREP_STATE.FAMILIARITY });
        },

        /** Sets/changes one stimulus's Known/Difficulty mark. Re-callable
         * any number of times before finalization — this is how §18's
         * "present it again later" correction flow is captured: the
         * examiner marks it Difficulty, corrects the child verbally
         * (outside the app), re-presents it, and marks it Known if it's
         * now consistent. `assistanceGiven` is incremented every time a
         * stimulus is (re-)marked Difficulty, as a record that help was
         * needed — it does not by itself block a later Known mark, since
         * the pass/fail gate only looks at each stimulus's CURRENT mark
         * at finalization (spec §18: "do not automatically treat an
         * immediately corrected response as established familiarity" —
         * the correction alone doesn't grant Known, a deliberate
         * examiner re-mark does). */
        markFamiliarity(session, stimulus, mark) {
            assertState(session, [RAN.PREP_STATE.FAMILIARITY]);
            if (!Object.values(RAN.FAMILIARITY_MARK).includes(mark)) {
                throw new Error(`RAN.preparation.markFamiliarity: invalid mark "${mark}"`);
            }
            const definition = RAN.getDefinition(session.assessmentId);
            if (!definition.stimuli.includes(stimulus)) {
                throw new Error(`RAN.preparation.markFamiliarity: unknown stimulus "${stimulus}" for ${session.assessmentId}`);
            }

            const next = cloneSession(session);
            next.familiarity.marks[stimulus] = mark;
            if (mark === RAN.FAMILIARITY_MARK.DIFFICULTY) {
                next.familiarity.assistanceGiven[stimulus] += 1;
            }
            return next;
        },

        /** true only if every stimulus is currently marked Known — the
         * sole pass criterion (spec §17: "if a child cannot consistently
         * name one or more stimuli without assistance, the main timed
         * assessment should NOT proceed"). No response-time component
         * anywhere (spec §19). */
        isFamiliarityEstablished(session) {
            const definition = RAN.getDefinition(session.assessmentId);
            return definition.stimuli.every(s => session.familiarity.marks[s] === RAN.FAMILIARITY_MARK.KNOWN);
        },

        /** FAMILIARITY -> PRACTICE (all known) or PREPARATION_FAILED
         * (spec §17, reason FAMILIARITY_NOT_ESTABLISHED). This is the
         * only way out of FAMILIARITY — no separate "skip" path. */
        finalizeFamiliarityCheck(session) {
            assertState(session, [RAN.PREP_STATE.FAMILIARITY]);
            const next = cloneSession(session);
            if (RAN.preparation.isFamiliarityEstablished(session)) {
                next.state = RAN.PREP_STATE.PRACTICE;
                next.practice.attemptNumber = 1;
            } else {
                next.state = RAN.PREP_STATE.PREPARATION_FAILED;
                next.failureReason = RAN.PREPARATION_FAILURE_REASON.FAMILIARITY_NOT_ESTABLISHED;
            }
            return next;
        },

        /** PREPARATION_FAILED (from a Familiarity failure) -> FAMILIARITY,
         * with every mark reset — "Επανάληψη ελέγχου" (spec §17). Only
         * valid when the failure being retried was actually a
         * Familiarity failure (not a Practice/serial-procedure one, which
         * has no repeat-familiarity action per spec — see the Phase 2
         * report). */
        repeatFamiliarityCheck(session) {
            assertState(session, [RAN.PREP_STATE.PREPARATION_FAILED]);
            if (session.failureReason !== RAN.PREPARATION_FAILURE_REASON.FAMILIARITY_NOT_ESTABLISHED) {
                throw new Error('RAN.preparation.repeatFamiliarityCheck: only valid after a FAMILIARITY_NOT_ESTABLISHED failure');
            }
            if (session.terminated) {
                throw new Error('RAN.preparation.repeatFamiliarityCheck: session already terminated');
            }
            const definition = RAN.getDefinition(session.assessmentId);
            const marks = {};
            const assistanceGiven = {};
            definition.stimuli.forEach(s => { marks[s] = null; assistanceGiven[s] = 0; });

            const next = cloneSession(session);
            next.state = RAN.PREP_STATE.FAMILIARITY;
            next.failureReason = null;
            // Item 16: this IS the "a new familiarity re-check was
            // needed because at least one stimulus was Δυσκολία" event
            // — the only place this counter increments.
            next.familiarity = { marks, assistanceGiven, retriesUsed: session.familiarity.retriesUsed + 1 };
            return next;
        },

        /** Ends the preparation flow from a PREPARATION_FAILED screen —
         * "Τερματισμός προετοιμασίας". Terminal: sets `terminated: true`
         * and leaves `state` at PREPARATION_FAILED; no further
         * transition function accepts a terminated session (each one
         * checks `assertNotTerminated`). */
        endPreparation(session) {
            assertState(session, [RAN.PREP_STATE.PREPARATION_FAILED]);
            const next = cloneSession(session);
            next.terminated = true;
            return next;
        },

        /** Sets one of the examiner's three procedural-observation
         * checkboxes during Practice (spec §22: start position,
         * left-to-right scanning, correct row transition). No speed
         * criterion is ever part of this checklist (spec §22: "Practice
         * does NOT assess whether the child is fast enough"). */
        setPracticeChecklistItem(session, key, value) {
            assertState(session, [RAN.PREP_STATE.PRACTICE]);
            if (!(key in session.practice.checklist)) {
                throw new Error(`RAN.preparation.setPracticeChecklistItem: unknown checklist key "${key}"`);
            }
            const next = cloneSession(session);
            next.practice.checklist[key] = !!value;
            return next;
        },

        /** true only if all three procedural checks are confirmed. */
        isPracticeChecklistComplete(session) {
            const c = session.practice.checklist;
            return !!(c.startPosition && c.leftToRight && c.rowTransition);
        },

        /** PRACTICE -> READY_FOR_TIMED_ASSESSMENT, once every checklist
         * item is confirmed (spec §25). This is the ONLY path into
         * READY_FOR_TIMED_ASSESSMENT — there is no other function in
         * this module that sets that state. */
        completePractice(session) {
            assertState(session, [RAN.PREP_STATE.PRACTICE]);
            if (!RAN.preparation.isPracticeChecklistComplete(session)) {
                throw new Error('RAN.preparation.completePractice: checklist is not fully confirmed yet');
            }
            const next = cloneSession(session);
            next.state = RAN.PREP_STATE.READY_FOR_TIMED_ASSESSMENT;
            return next;
        },

        /** PRACTICE -> FAMILIARITY, for repeated naming errors during
         * Practice (spec §23: "If the child repeatedly makes naming
         * errors, return to Familiarity"). Does NOT consume a practice
         * attempt and does NOT count toward the retry limit — it's a
         * different failure mode (naming, not serial procedure), so
         * attemptNumber is left as-is; a fresh Practice attempt only
         * starts again once Familiarity is re-passed
         * (finalizeFamiliarityCheck resets attemptNumber to 1). */
        returnToFamiliarityFromPractice(session) {
            assertState(session, [RAN.PREP_STATE.PRACTICE]);
            const definition = RAN.getDefinition(session.assessmentId);
            const marks = {};
            const assistanceGiven = {};
            definition.stimuli.forEach(s => { marks[s] = null; assistanceGiven[s] = 0; });

            const next = cloneSession(session);
            next.state = RAN.PREP_STATE.FAMILIARITY;
            // Item 16: this return path is triggered by naming errors
            // observed live during Practice, never by a Δυσκολία mark
            // (reaching Practice at all already required every stimulus
            // to have been Known) — so it must NOT increment
            // retriesUsed. It must also not silently drop the count
            // down to undefined, hence carrying the existing value
            // forward unchanged.
            next.familiarity = { marks, assistanceGiven, retriesUsed: session.familiarity.retriesUsed };
            next.practice = { attemptNumber: 0, checklist: { startPosition: false, leftToRight: false, rowTransition: false } };
            return next;
        },

        /** PRACTICE -> PRACTICE, attempt 1 only (spec §24: "initial
         * Practice, one repeat if needed" — not unlimited repeats).
         * Resets the checklist for the fresh attempt. */
        retryPractice(session) {
            assertState(session, [RAN.PREP_STATE.PRACTICE]);
            if (session.practice.attemptNumber >= MAX_PRACTICE_ATTEMPTS) {
                throw new Error(`RAN.preparation.retryPractice: already used the one allowed retry (attempt ${session.practice.attemptNumber})`);
            }
            const next = cloneSession(session);
            next.practice.attemptNumber += 1;
            next.practice.checklist = { startPosition: false, leftToRight: false, rowTransition: false };
            return next;
        },

        /** PRACTICE -> PREPARATION_FAILED, reason
         * SERIAL_PROCEDURE_NOT_ESTABLISHED — only reachable once the
         * one allowed retry has already been used (spec §23: "If
         * serial procedure remains unclear: do NOT proceed"). There is
         * no bypass from here to READY_FOR_TIMED_ASSESSMENT. */
        failSerialProcedure(session) {
            assertState(session, [RAN.PREP_STATE.PRACTICE]);
            if (session.practice.attemptNumber < MAX_PRACTICE_ATTEMPTS) {
                throw new Error(
                    `RAN.preparation.failSerialProcedure: the retry (attempt ${MAX_PRACTICE_ATTEMPTS}) must be used before failing — `
                    + `currently at attempt ${session.practice.attemptNumber}`
                );
            }
            const next = cloneSession(session);
            next.state = RAN.PREP_STATE.PREPARATION_FAILED;
            next.failureReason = RAN.PREPARATION_FAILURE_REASON.SERIAL_PROCEDURE_NOT_ESTABLISHED;
            return next;
        },
    };

    function cloneSession(session) {
        return {
            assessmentId: session.assessmentId,
            state: session.state,
            terminated: session.terminated,
            failureReason: session.failureReason,
            familiarity: {
                marks: Object.assign({}, session.familiarity.marks),
                assistanceGiven: Object.assign({}, session.familiarity.assistanceGiven),
                retriesUsed: session.familiarity.retriesUsed,
            },
            practice: {
                attemptNumber: session.practice.attemptNumber,
                checklist: Object.assign({}, session.practice.checklist),
            },
        };
    }

    function assertState(session, allowedStates) {
        if (session.terminated) {
            throw new Error('RAN.preparation: session is terminated, no further transitions are allowed');
        }
        if (!allowedStates.includes(session.state)) {
            throw new Error(`RAN.preparation: expected state in [${allowedStates.join(', ')}], got "${session.state}"`);
        }
    }

    if (typeof module !== 'undefined' && module.exports) module.exports = RAN;
})(typeof window !== 'undefined' ? window : globalThis);
