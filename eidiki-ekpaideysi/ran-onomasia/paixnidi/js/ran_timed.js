/* ============================================================
   RAN — Phase 3: Timed assessment logic (record-building only)

   Pure logic, no DOM, no performance.now() call itself — the actual
   timing measurement happens in the browser-only UI layer (ran_ui.js),
   which passes the resulting millisecond duration in here. Keeping
   this file DOM-free means it stays Node-testable the same way
   ran_preparation.js is.

   This module answers exactly two questions once a timed run ends:
   "was this a normal completion or an abort, and what administration
   record does that produce?" It does not decide status/timing UI
   flow (that's ran_ui.js) and does not persist anything (that's a
   later phase).
   ============================================================ */
(function (root) {
    'use strict';

    const RAN = root.RAN = root.RAN || {};
    if (!RAN.getDefinition || !RAN.createAdministration || !RAN.validateAdministration || !RAN.STATUS) {
        throw new Error('RAN.timed requires ran_definitions.js and ran_engine.js to be loaded first');
    }
    if (!RAN.PREP_STATE) {
        throw new Error('RAN.timed requires ran_preparation.js to be loaded first');
    }

    RAN.timed = {
        /**
         * Generates a temporary, non-identifying technical id for one
         * administration/session (Phase 3 correction pass: the
         * examiner is never asked to type a student identifier before
         * a timed run — that would add friction and risks a real name
         * being typed in). This is NOT a student profile — Phase 5
         * will connect a real administration to the local profile
         * model. Uses crypto.randomUUID() where available (all modern
         * browsers under a secure/file:// context, and Node for
         * testing), with a safe fallback otherwise.
         */
        generateEphemeralStudentId() {
            if (root.crypto && typeof root.crypto.randomUUID === 'function') {
                return 'stu_' + root.crypto.randomUUID();
            }
            return 'stu_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
        },

        /** true only if the preparation session actually reached
         * READY_FOR_TIMED_ASSESSMENT through the full Familiarity+
         * Practice flow, and was not itself terminated — the sole gate
         * every Phase 3 screen must check before rendering (spec §13:
         * Familiarity/Practice must not be skippable). */
        canBegin(session) {
            return !!session && session.state === RAN.PREP_STATE.READY_FOR_TIMED_ASSESSMENT && !session.terminated;
        },

        /**
         * Builds the administration record for a normally completed run
         * (examiner pressed Finish). Status is COMPLETED unless a
         * procedural event occurred during the run — sequence loss,
         * at least one examiner redirect, and/or at least one
         * examiner-provided answer (Scientific Protocol Correction
         * decision §4) — in which case it's COMPLETED_FLAGGED (spec
         * §39's own examples for that status).
         * `durationMs` is rounded to the nearest integer millisecond
         * here — the one deliberate rounding point where a
         * performance.now() delta becomes the stored value (spec §27
         * requires integer-ms storage; "do not round before storage"
         * there refers to not truncating mid-measurement, not to
         * avoiding this final conversion).
         *
         * Returns `{ administration, validationProblems }` rather than
         * throwing on a data problem — the caller (examiner-facing UI)
         * can display validationProblems and let the examiner correct
         * a mis-entered count instead of losing the whole record.
         */
        buildCompletedAdministration(input) {
            // Scientific Protocol Correction decision §4 (locked):
            // an examiner-provided answer is now also a procedural
            // event that flags the administration, same as sequence
            // loss or a redirect — it does NOT make the record
            // INVALID on its own (no numeric cutoff here); INVALID
            // stays reserved for RAN.INVALID_REASON.EXAMINER_SUPPLIED_ANSWERS
            // as a manual examiner call.
            const hadProceduralEvent = !!input.sequenceLoss
                || (input.examinerRedirects || 0) > 0
                || (input.examinerProvidedAnswers || 0) > 0;
            const administration = RAN.createAdministration({
                studentId: input.studentId,
                assessmentId: input.assessmentId,
                assessmentVersion: RAN.getDefinition(input.assessmentId).version,
                form: input.form,
                status: hadProceduralEvent ? RAN.STATUS.COMPLETED_FLAGGED : RAN.STATUS.COMPLETED,
                durationMs: Math.round(input.durationMs),
                substitutions: input.substitutions || 0,
                omissions: input.omissions || 0,
                repetitions: input.repetitions || 0,
                selfCorrections: input.selfCorrections || 0,
                examinerRedirects: input.examinerRedirects || 0,
                examinerProvidedAnswers: input.examinerProvidedAnswers || 0,
                sequenceLoss: !!input.sequenceLoss,
                // Post-trial correction (item 15): forwarded verbatim —
                // the caller (ran_ui.js renderTimedErrorCapture) is the
                // one place that compares reviewed-vs-live values and
                // decides this boolean; this function never re-derives
                // it and never looks at "the live value" itself.
                examinerReviewAdjusted: !!input.examinerReviewAdjusted,
                // Item 16: forwarded verbatim from the caller (ran_ui.js
                // reads it off session.familiarity.retriesUsed) — this
                // function never touches RAN.preparation state itself.
                familiarityRetriesUsed: input.familiarityRetriesUsed != null ? input.familiarityRetriesUsed : null,
                familiarityPassed: true,
                practicePassed: true,
                notes: input.notes || '',
            });
            return { administration, validationProblems: RAN.validateAdministration(administration) };
        },

        /**
         * Builds the record for an aborted run — either INCOMPLETE or
         * INVALID depending on the examiner's selected reason (spec
         * §40-41). `reasonCategory` must be 'incomplete' or 'invalid',
         * and `reason` must be a member of the matching enum
         * (RAN.INCOMPLETE_REASON / RAN.INVALID_REASON).
         * `partialDurationMs`, if supplied, is stored purely as
         * informational raw data (spec §42: never discard raw data) —
         * it is never used for a naming-rate calculation, since
         * RAN.calcResults() already excludes INCOMPLETE/INVALID from
         * rate-eligibility regardless of what's stored here.
         */
        buildAbortedAdministration(input) {
            let status, reasonField;
            if (input.reasonCategory === 'incomplete') {
                if (!Object.values(RAN.INCOMPLETE_REASON).includes(input.reason)) {
                    throw new Error(`RAN.timed.buildAbortedAdministration: invalid INCOMPLETE reason "${input.reason}"`);
                }
                status = RAN.STATUS.INCOMPLETE;
                reasonField = 'incompleteReason';
            } else if (input.reasonCategory === 'invalid') {
                if (!Object.values(RAN.INVALID_REASON).includes(input.reason)) {
                    throw new Error(`RAN.timed.buildAbortedAdministration: invalid INVALID reason "${input.reason}"`);
                }
                status = RAN.STATUS.INVALID;
                reasonField = 'invalidReason';
            } else {
                throw new Error(`RAN.timed.buildAbortedAdministration: reasonCategory must be "incomplete" or "invalid", got "${input.reasonCategory}"`);
            }

            const base = {
                studentId: input.studentId,
                assessmentId: input.assessmentId,
                assessmentVersion: RAN.getDefinition(input.assessmentId).version,
                form: input.form,
                status,
                durationMs: input.partialDurationMs != null ? Math.round(input.partialDurationMs) : null,
                substitutions: input.substitutions || 0,
                omissions: input.omissions || 0,
                repetitions: input.repetitions || 0,
                selfCorrections: input.selfCorrections || 0,
                examinerRedirects: input.examinerRedirects || 0,
                examinerProvidedAnswers: input.examinerProvidedAnswers || 0,
                sequenceLoss: !!input.sequenceLoss,
                // Item 16: same forwarding as buildCompletedAdministration
                // — an aborted (INCOMPLETE/INVALID) run still went through
                // Familiarity/Practice first (this function is only ever
                // reachable post-READY_FOR_TIMED_ASSESSMENT), so the same
                // context is just as meaningful here.
                familiarityRetriesUsed: input.familiarityRetriesUsed != null ? input.familiarityRetriesUsed : null,
                familiarityPassed: true,
                practicePassed: true,
                notes: input.notes || '',
            };
            base[reasonField] = input.reason;

            const administration = RAN.createAdministration(base);
            return { administration, validationProblems: RAN.validateAdministration(administration) };
        },
    };

    if (typeof module !== 'undefined' && module.exports) module.exports = RAN;
})(typeof window !== 'undefined' ? window : globalThis);
