/* ============================================================
   RAN — Assessment Engine (Phase 1: data model, validation, scoring)

   Pure logic only — no DOM, no localStorage, no UI. Screens/flow are
   Phase 2+. This file defines the administration record shape, the
   status/reason enums, definition-integrity validation, and the
   scoring/comparison math described in spec §39-§46, §51.

   Dual Node/browser module, same pattern as ran_definitions.js.
   Requires RAN.definitions / RAN.getDefinition to already be loaded.
   ============================================================ */
(function (root) {
    'use strict';

    const RAN = root.RAN = root.RAN || {};
    if (!RAN.definitions || !RAN.getDefinition) {
        throw new Error('RAN.engine requires ran_definitions.js to be loaded first');
    }

    /* ----------------------------------------------------------
       STATUS MODEL — spec §39
       ---------------------------------------------------------- */
    RAN.STATUS = RAN.deepFreeze({
        COMPLETED: 'COMPLETED',
        COMPLETED_FLAGGED: 'COMPLETED_FLAGGED',
        INCOMPLETE: 'INCOMPLETE',
        INVALID: 'INVALID',
        PREPARATION_FAILED: 'PREPARATION_FAILED',
    });

    /* ----------------------------------------------------------
       REASON ENUMS — spec §17 (preparation), §40 (invalid), §41 (incomplete)
       ---------------------------------------------------------- */
    RAN.PREPARATION_FAILURE_REASON = RAN.deepFreeze({
        FAMILIARITY_NOT_ESTABLISHED: 'FAMILIARITY_NOT_ESTABLISHED',
        SERIAL_PROCEDURE_NOT_ESTABLISHED: 'SERIAL_PROCEDURE_NOT_ESTABLISHED',
    });

    RAN.INVALID_REASON = RAN.deepFreeze({
        EXAMINER_SUPPLIED_ANSWERS: 'EXAMINER_SUPPLIED_ANSWERS',
        TECHNICAL_MALFUNCTION: 'TECHNICAL_MALFUNCTION',
        ACCIDENTAL_TIMER_STOP: 'ACCIDENTAL_TIMER_STOP',
        BROWSER_REFRESH: 'BROWSER_REFRESH',
        EXTERNAL_INTERRUPTION: 'EXTERNAL_INTERRUPTION',
        WRONG_FORM_SHOWN: 'WRONG_FORM_SHOWN',
        FEEDBACK_PROVIDED_DURING_ADMINISTRATION: 'FEEDBACK_PROVIDED_DURING_ADMINISTRATION',
        OTHER_PROCEDURAL_DEVIATION: 'OTHER_PROCEDURAL_DEVIATION',
    });

    RAN.INCOMPLETE_REASON = RAN.deepFreeze({
        CHILD_STOPPED_PARTICIPATING: 'CHILD_STOPPED_PARTICIPATING',
        SERIAL_PROCEDURE_LOST: 'SERIAL_PROCEDURE_LOST',
        STIMULUS_KNOWLEDGE_UNCERTAIN: 'STIMULUS_KNOWLEDGE_UNCERTAIN',
        TECHNICAL_ISSUE: 'TECHNICAL_ISSUE',
        EXTERNAL_INTERRUPTION: 'EXTERNAL_INTERRUPTION',
        OTHER: 'OTHER',
    });

    /** Grade/context metadata enum (spec: grade proposal). Purely
     * contextual — never read by scoring, norms, cut-offs, risk
     * classification, comparison eligibility, or graph eligibility
     * anywhere in this codebase. OTHER_UNSPECIFIED is an EXPLICIT
     * examiner choice ("Άλλο/Μη προσδιορισμένο") and must stay
     * distinct from an absent/unknown/corrupt value — see
     * RAN.isValidGrade and RAN.wording.resolveGradeLabel, which never
     * coerce one into the other. */
    RAN.GRADE = RAN.deepFreeze({
        // Item 7: additive-only expansion (two new members, everything
        // else byte-for-byte unchanged) — existing keys/values keep
        // their exact string identity, so legacy stored profile.grade/
        // gradeAtAdministration values remain valid RAN.GRADE members
        // and RAN.isValidGrade below needs no change at all (it already
        // just checks membership in Object.values(RAN.GRADE)).
        NIPIAGOGEIO: 'NIPIAGOGEIO',
        A_DIMOTIKOU: 'A_DIMOTIKOU',
        B_DIMOTIKOU: 'B_DIMOTIKOU',
        G_DIMOTIKOU: 'G_DIMOTIKOU',
        D_DIMOTIKOU: 'D_DIMOTIKOU',
        E_DIMOTIKOU: 'E_DIMOTIKOU',
        ST_DIMOTIKOU: 'ST_DIMOTIKOU',
        A_GYMNASIOU: 'A_GYMNASIOU',
        B_GYMNASIOU: 'B_GYMNASIOU',
        G_GYMNASIOU: 'G_GYMNASIOU',
        OTHER_UNSPECIFIED: 'OTHER_UNSPECIFIED',
    });

    /** Strict-write gate for NEW/live-written grade data (profile.grade
     * and administration.gradeAtAdministration): valid only as `null`
     * (nothing chosen) or a real RAN.GRADE value. Deliberately NOT
     * used by RAN.validateAdministration (the shared gate import also
     * goes through) — that stays fully tolerant of any legacy/unknown
     * grade value, per the strict-write/tolerant-read split. Only the
     * live write paths (RAN.storage.createProfile/updateProfileGrade/
     * saveAdministration) call this. */
    RAN.isValidGrade = function (value) {
        return value === null || Object.values(RAN.GRADE).includes(value);
    };

    /** Statuses for which a naming-rate result may be calculated and
     * shown (spec §46: INVALID/INCOMPLETE must not get a normal
     * naming-rate comparison; PREPARATION_FAILED never reached a timed
     * attempt at all). */
    const RATE_ELIGIBLE_STATUSES = [RAN.STATUS.COMPLETED, RAN.STATUS.COMPLETED_FLAGGED];

    /* ----------------------------------------------------------
       DEFINITION INTEGRITY VALIDATION — spec §71 "Forms"
       ---------------------------------------------------------- */

    /**
     * Validates that `definition.forms[formKey]` is structurally sound:
     * correct row/column counts, every stimulus appearing exactly
     * `itemsPerStimulus` times, no unknown stimulus IDs. Returns an
     * array of human-readable problem strings (empty = valid) rather
     * than throwing, so a test can assert on the exact list of issues.
     */
    RAN.validateFormSequence = function (definition, formKey) {
        const problems = [];
        const form = definition.forms && definition.forms[formKey];
        if (!form) {
            problems.push(`Form "${formKey}" does not exist on ${definition.id}`);
            return problems;
        }

        const { rows, columns } = definition.layout;
        if (form.length !== rows) {
            problems.push(`Expected ${rows} rows, got ${form.length}`);
        }
        form.forEach((row, i) => {
            if (row.length !== columns) {
                problems.push(`Row ${i} expected ${columns} columns, got ${row.length}`);
            }
        });

        const flat = form.flat();
        if (flat.length !== definition.totalStimuli) {
            problems.push(`Expected ${definition.totalStimuli} total stimuli, got ${flat.length}`);
        }

        const counts = {};
        flat.forEach(s => { counts[s] = (counts[s] || 0) + 1; });

        definition.stimuli.forEach(s => {
            const count = counts[s] || 0;
            if (count !== definition.itemsPerStimulus) {
                problems.push(`Stimulus "${s}" appears ${count} times, expected ${definition.itemsPerStimulus}`);
            }
        });

        Object.keys(counts).forEach(s => {
            if (!definition.stimuli.includes(s)) {
                problems.push(`Unknown stimulus "${s}" found in form (not in definition.stimuli)`);
            }
        });

        return problems;
    };

    /** Validates every form of every registered definition. Returns
     * `{ valid: bool, problems: [{ assessmentId, formKey, problems }] }`. */
    RAN.validateAllDefinitions = function () {
        const problems = [];
        Object.keys(RAN.definitions).forEach(assessmentId => {
            const def = RAN.definitions[assessmentId];
            Object.keys(def.forms).forEach(formKey => {
                const formProblems = RAN.validateFormSequence(def, formKey);
                if (formProblems.length > 0) {
                    problems.push({ assessmentId, formKey, problems: formProblems });
                }
            });
        });
        return { valid: problems.length === 0, problems };
    };

    /** Flattens `definition.forms[formKey]` (rows of stimulus IDs) into
     * the single ordered stimulusSequence an administration record
     * stores (spec §42). Left-to-right, then next row (spec §7) —
     * row-major flatten already matches that reading order. */
    RAN.flattenForm = function (definition, formKey) {
        const form = definition.forms[formKey];
        if (!form) throw new Error(`RAN: form "${formKey}" not found on ${definition.id}`);
        return form.flat();
    };

    /* ----------------------------------------------------------
       ADMINISTRATION RECORD — spec §42
       ---------------------------------------------------------- */

    let administrationCounter = 0;
    /** Local-only unique ID (no backend to guarantee global uniqueness
     * against — matches this project's localStorage-only persistence
     * decision). Timestamp + monotonically-increasing counter + a
     * random suffix keeps IDs unique even for two administrations
     * created within the same millisecond. */
    function generateAdministrationId() {
        administrationCounter += 1;
        const rand = Math.random().toString(36).slice(2, 8);
        return `ran_${Date.now()}_${administrationCounter}_${rand}`;
    }
    RAN._resetAdministrationCounterForTests = function () { administrationCounter = 0; };

    const REQUIRED_ADMINISTRATION_FIELDS = [
        'studentId', 'assessmentId', 'assessmentVersion', 'form', 'status',
    ];

    /**
     * Builds a fully-shaped administration record (spec §42's raw-data
     * field list). `input` supplies whatever the caller already knows;
     * anything left unset defaults to null/false so every field named
     * in the spec is always present on the returned object, never
     * silently missing. `stimulusSequence` and `totalStimuli` are
     * derived from the definition+form if not explicitly provided,
     * since they're determined entirely by which fixed form was shown
     * — never something a caller should need to reconstruct by hand.
     *
     * Does NOT persist anything (no localStorage here — that's a
     * later phase) and does NOT compute independentCorrect from the
     * error counts by hand — see RAN.deriveIndependentCorrect below
     * for the locked formula (Scientific Protocol Correction, decision
     * §1: renamed from initialCorrect, now also subtracts
     * examinerProvidedAnswers).
     */
    RAN.createAdministration = function (input) {
        input = input || {};

        REQUIRED_ADMINISTRATION_FIELDS.forEach(field => {
            if (input[field] === undefined || input[field] === null) {
                throw new Error(`RAN.createAdministration: missing required field "${field}"`);
            }
        });

        if (!Object.values(RAN.STATUS).includes(input.status)) {
            throw new Error(`RAN.createAdministration: invalid status "${input.status}"`);
        }

        const definition = RAN.getDefinition(input.assessmentId);
        if (definition.version !== input.assessmentVersion) {
            throw new Error(
                `RAN.createAdministration: assessmentVersion ${input.assessmentVersion} does not match `
                + `${input.assessmentId}'s actual version ${definition.version}`
            );
        }
        if (!definition.forms[input.form]) {
            throw new Error(`RAN.createAdministration: form "${input.form}" does not exist on ${input.assessmentId}`);
        }

        const stimulusSequence = input.stimulusSequence || RAN.flattenForm(definition, input.form);

        const totalStimuli = input.totalStimuli != null ? input.totalStimuli : definition.totalStimuli;
        const substitutions = input.substitutions != null ? input.substitutions : 0;
        const omissions = input.omissions != null ? input.omissions : 0;
        const examinerProvidedAnswers = input.examinerProvidedAnswers != null ? input.examinerProvidedAnswers : 0;

        return {
            administrationId: input.administrationId || generateAdministrationId(),
            studentId: input.studentId,
            assessmentId: input.assessmentId,
            assessmentVersion: input.assessmentVersion,
            assessmentType: definition.type,
            form: input.form,
            stimulusSequence,
            dateISO: input.dateISO || new Date().toISOString(),
            durationMs: input.durationMs != null ? input.durationMs : null,
            totalStimuli,
            // Derived snapshot, not an examiner-entered field (locked
            // definition, Scientific Protocol Correction decision §1:
            // totalStimuli - substitutions - omissions -
            // examinerProvidedAnswers. repetitions/selfCorrections
            // don't change it — a self-correction is the child
            // independently naming the stimulus without examiner help,
            // so it stays counted as correct; an examiner-provided
            // answer means the child never named it independently, so
            // it's excluded here same as a substitution/omission).
            // Always computed here from the raw counts at creation
            // time, never taken from caller input.
            independentCorrect: RAN.deriveIndependentCorrect(totalStimuli, substitutions, omissions, examinerProvidedAnswers),
            substitutions,
            omissions,
            repetitions: input.repetitions != null ? input.repetitions : 0,
            selfCorrections: input.selfCorrections != null ? input.selfCorrections : 0,
            examinerRedirects: input.examinerRedirects != null ? input.examinerRedirects : 0,
            // 3-second-rule correction: a distinct raw count from
            // examinerRedirects/sequenceLoss — see the field's own note
            // in NON_NEGATIVE_INTEGER_FIELDS below. Never overloads an
            // existing field; conceptually a different procedural event
            // (examiner supplied the stimulus name after ~3s of no
            // response, vs. a neutral positional redirect or a lost
            // serial-progression flag). Mutually exclusive with
            // substitutions/omissions for the same stimulus (Scientific
            // Protocol Correction decision §2) — the calling UI is
            // responsible for never incrementing both for one item.
            examinerProvidedAnswers,
            sequenceLoss: !!input.sequenceLoss,
            familiarityPassed: input.familiarityPassed != null ? !!input.familiarityPassed : null,
            practicePassed: input.practicePassed != null ? !!input.practicePassed : null,
            // Grade proposal: not known yet at record-creation time (no
            // profile has been chosen — that happens later, on the
            // Results save screen). Always present as an explicit field
            // (never silently missing), defaulting to null here; the
            // UI/save-flow is responsible for overwriting it with the
            // examiner's explicit choice before RAN.storage.
            // saveAdministration is called (see ran_ui.js
            // renderSaveSection) — this function never reads
            // profile.grade itself.
            gradeAtAdministration: input.gradeAtAdministration !== undefined ? input.gradeAtAdministration : null,
            // Post-trial correction (item 15, locked): additive-only
            // audit marker — true iff the examiner changed at least one
            // of sequenceLoss/examinerRedirects/examinerProvidedAnswers
            // during the post-timing error-capture/review stage,
            // compared to what was live-recorded during timedRunning.
            // Never a free-text log — a single boolean is the entire
            // audit trail requested. durationMs/stimulusSequence are
            // never touched by this review step (set independently,
            // earlier, from the live timer/definition) — this field
            // only ever describes substitutions/omissions/repetitions/
            // selfCorrections/examinerRedirects/examinerProvidedAnswers/
            // sequenceLoss review, never time or sequence data.
            examinerReviewAdjusted: input.examinerReviewAdjusted != null ? !!input.examinerReviewAdjusted : false,
            // Item 16 (audit/context metadata, additive-only): how many
            // FAMILIARITY_NOT_ESTABLISHED re-checks preceded this
            // administration (RAN.preparation session.familiarity.
            // retriesUsed, forwarded verbatim by ran_timed.js). Always a
            // real number (>=0) for anything built through the live
            // flow — null here only covers a caller that genuinely
            // doesn't know (never happens today, but matches the same
            // "never silently missing, explicit null when unknown"
            // convention as gradeAtAdministration). Distinct from a
            // LEGACY stored record that predates this field entirely —
            // that case never goes through this function at all (it's
            // loaded directly from storage), so it keeps whatever
            // shape it already has (the field simply absent), which is
            // exactly what lets the tolerant-read side (wording.
            // resolveFamiliarityRetriesLabel) tell "explicitly 0" apart
            // from "not recorded". Purely descriptive — never read by
            // scoring, status derivation, comparison/graph eligibility,
            // or any risk classification anywhere in this codebase.
            familiarityRetriesUsed: input.familiarityRetriesUsed != null ? input.familiarityRetriesUsed : null,
            status: input.status,
            preparationFailureReason: input.preparationFailureReason || null,
            invalidReason: input.invalidReason || null,
            incompleteReason: input.incompleteReason || null,
            validityFlags: input.validityFlags || [],
            notes: input.notes || '',
        };
    };

    /** Count-like fields that must always be non-negative integers when
     * present — checked generically so every one of them gets the same
     * treatment instead of five near-duplicate checks. */
    const NON_NEGATIVE_INTEGER_FIELDS = [
        'totalStimuli', 'substitutions', 'omissions', 'repetitions', 'selfCorrections', 'examinerRedirects',
        'examinerProvidedAnswers', 'familiarityRetriesUsed',
    ];

    function isNonNegativeInteger(value) {
        return typeof value === 'number' && Number.isInteger(value) && value >= 0;
    }

    /**
     * Sanity-checks an already-built administration record. Separate
     * from createAdministration() so a record loaded back from
     * localStorage/JSON import (Phase 5) can also be re-validated
     * without going through construction again — this is the gate that
     * rejects a tampered or hand-edited import, not just a fresh
     * record. Returns an array of problem strings (empty = valid).
     */
    RAN.validateAdministration = function (admin) {
        const problems = [];

        REQUIRED_ADMINISTRATION_FIELDS.forEach(field => {
            if (admin[field] === undefined || admin[field] === null) {
                problems.push(`Missing required field "${field}"`);
            }
        });

        if (admin.status && !Object.values(RAN.STATUS).includes(admin.status)) {
            problems.push(`Invalid status "${admin.status}"`);
        }

        if (admin.status === RAN.STATUS.PREPARATION_FAILED
            && !Object.values(RAN.PREPARATION_FAILURE_REASON).includes(admin.preparationFailureReason)) {
            problems.push('PREPARATION_FAILED status requires a valid preparationFailureReason');
        }
        if (admin.status === RAN.STATUS.INVALID
            && !Object.values(RAN.INVALID_REASON).includes(admin.invalidReason)) {
            problems.push('INVALID status requires a valid invalidReason');
        }
        if (admin.status === RAN.STATUS.INCOMPLETE
            && !Object.values(RAN.INCOMPLETE_REASON).includes(admin.incompleteReason)) {
            problems.push('INCOMPLETE status requires a valid incompleteReason');
        }

        if (RATE_ELIGIBLE_STATUSES.includes(admin.status)) {
            if (typeof admin.durationMs !== 'number' || admin.durationMs <= 0 || !Number.isInteger(admin.durationMs)) {
                problems.push(`Status ${admin.status} requires an integer durationMs > 0`);
            }
            if (typeof admin.independentCorrect !== 'number') {
                problems.push(`Status ${admin.status} requires a numeric independentCorrect`);
            }
        }
        // §46: INVALID/INCOMPLETE/PREPARATION_FAILED must never produce
        // a normal naming-rate result — enforced structurally, not just
        // by convention: these statuses are exactly the complement of
        // RATE_ELIGIBLE_STATUSES, and RAN.calcResults() only computes
        // independentNamingRate when rateEligible is true (see its own tests).
        // Nothing else to check here beyond that exclusivity.

        NON_NEGATIVE_INTEGER_FIELDS.forEach(field => {
            if (admin[field] !== undefined && admin[field] !== null && !isNonNegativeInteger(admin[field])) {
                problems.push(`Field "${field}" must be a non-negative integer, got ${JSON.stringify(admin[field])}`);
            }
        });

        if (admin.examinerReviewAdjusted !== undefined && typeof admin.examinerReviewAdjusted !== 'boolean') {
            problems.push(`Field "examinerReviewAdjusted" must be a boolean, got ${JSON.stringify(admin.examinerReviewAdjusted)}`);
        }

        const hasCountFields = isNonNegativeInteger(admin.totalStimuli)
            && isNonNegativeInteger(admin.substitutions)
            && isNonNegativeInteger(admin.omissions);

        if (hasCountFields) {
            // Scientific Protocol Correction decision §6: examinerProvidedAnswers
            // joins substitutions/omissions in this sum — a stimulus with an
            // examiner-provided answer is a third mutually-exclusive primary
            // outcome (decision §2), so it must be counted here too. Missing
            // examinerProvidedAnswers (e.g. a pre-3-second-rule record not yet
            // migrated) defaults to 0 rather than failing this check.
            const examinerProvidedAnswersForCheck = isNonNegativeInteger(admin.examinerProvidedAnswers)
                ? admin.examinerProvidedAnswers : 0;

            if (admin.substitutions + admin.omissions + examinerProvidedAnswersForCheck > admin.totalStimuli) {
                problems.push('substitutions + omissions + examinerProvidedAnswers must not exceed totalStimuli');
            }

            const expectedIndependentCorrect = RAN.deriveIndependentCorrect(
                admin.totalStimuli, admin.substitutions, admin.omissions, examinerProvidedAnswersForCheck
            );
            if (admin.independentCorrect !== undefined && admin.independentCorrect !== null
                && admin.independentCorrect !== expectedIndependentCorrect) {
                problems.push(
                    `independentCorrect (${admin.independentCorrect}) does not match totalStimuli - substitutions - `
                    + `omissions - examinerProvidedAnswers (${expectedIndependentCorrect}) — record may be corrupted or hand-edited`
                );
            }
            if (admin.independentCorrect !== undefined && admin.independentCorrect !== null
                && (admin.independentCorrect < 0 || admin.independentCorrect > admin.totalStimuli)) {
                problems.push(`independentCorrect must be between 0 and totalStimuli (${admin.totalStimuli})`);
            }
        }

        // Scientific Protocol Correction (3-second rule + error
        // classification): the old "selfCorrections must not exceed
        // substitutions" invariant is REMOVED. It assumed every self-
        // corrected item had first been tallied as a substitution —
        // that assumption is no longer valid under the corrected
        // definitions: a substitution is now an incorrect naming that
        // stays incorrect / is not spontaneously self-corrected, and a
        // self-correction is the child spontaneously fixing an initial
        // error WITHOUT the examiner providing the answer. The two are
        // deliberately independent counts; a self-correction must never
        // also be counted as a substitution, so selfCorrections can
        // legitimately exceed, equal, or be unrelated to substitutions.

        try {
            const definition = RAN.getDefinition(admin.assessmentId);
            if (definition.version !== admin.assessmentVersion) {
                problems.push(`assessmentVersion ${admin.assessmentVersion} does not match definition version ${definition.version}`);
            }
            if (admin.totalStimuli !== definition.totalStimuli) {
                problems.push(`totalStimuli ${admin.totalStimuli} does not match definition's ${definition.totalStimuli}`);
            }
            if (admin.stimulusSequence) {
                const expected = RAN.flattenForm(definition, admin.form);
                const matches = admin.stimulusSequence.length === expected.length
                    && admin.stimulusSequence.every((s, i) => s === expected[i]);
                if (!matches) problems.push('stimulusSequence does not match the fixed sequence for this assessmentId/form');
            }
        } catch (e) {
            problems.push(e.message);
        }

        return problems;
    };

    /* ----------------------------------------------------------
       SCORING — spec §44-§46, renamed under the Scientific Protocol
       Correction (decision §1, locked):

       independentCorrect (locked definition — renamed from
       initialCorrect): NOT an examiner-entered field. Always derived
       at administration creation time from the raw counts — every
       stimulus is either named correctly independently (spontaneously,
       with or without a self-correction), substituted, omitted, or
       named only after the examiner supplied the answer past the
       3-second wait:
       independentCorrect = totalStimuli - substitutions - omissions - examinerProvidedAnswers
       selfCorrections are deliberately NOT subtracted — a spontaneous
       self-correction means the child still named the stimulus
       independently (the extra time it took is already inside
       durationMs); repetitions don't change this count either, since
       they're a separate descriptive tally, not a primary outcome.
       createAdministration() computes and stores this as a derived
       snapshot; validateAdministration() re-derives it and rejects any
       record where the stored value doesn't match — an imported/
       localStorage record can't carry a stale or hand-edited
       independentCorrect that disagrees with its own raw counts.
       ---------------------------------------------------------- */
    RAN.deriveIndependentCorrect = function (totalStimuli, substitutions, omissions, examinerProvidedAnswers) {
        return totalStimuli - substitutions - omissions - (examinerProvidedAnswers || 0);
    };

    /** Naming rate = independentCorrect / durationSeconds (spec §45,
     * renamed under decision §3 — still a purely descriptive rate, not
     * a standard score/percentile). Returns null when the inputs can't
     * produce a meaningful rate, rather than NaN/Infinity — callers
     * should treat null as "no rate available," matching §46's "do not
     * calculate" requirement for ineligible statuses (enforced by the
     * caller, not this pure function — see RAN.calcResults). */
    RAN.calcIndependentNamingRate = function (independentCorrect, durationMs) {
        if (typeof independentCorrect !== 'number' || typeof durationMs !== 'number' || durationMs <= 0) return null;
        return independentCorrect / (durationMs / 1000);
    };

    /**
     * Assembles the descriptive result set for one administration
     * (spec §43-§46). Does not decide wording/labels — that belongs to
     * the Results screen (Phase 4) — just the numbers, with
     * independentNamingRate forced to null for any status not eligible
     * for a rate.
     *
     * INCOMPLETE/INVALID correctness fix: `independentCorrect` is a
     * derived snapshot computed at record-creation time as
     * totalStimuli - substitutions - omissions - examinerProvidedAnswers
     * (see RAN.deriveIndependentCorrect). That arithmetic assumes every
     * one of the `totalStimuli` items was actually reached/attempted —
     * true for a COMPLETED/COMPLETED_FLAGGED run, but NOT true for an
     * aborted one, where stimuli never reached would otherwise be
     * silently counted as "independently correct". So this function
     * only surfaces `independentCorrect` (and, unchanged from before,
     * `independentNamingRate`) when `eligible` — i.e. exactly
     * COMPLETED/COMPLETED_FLAGGED, same set as RATE_ELIGIBLE_STATUSES.
     * `admin.independentCorrect` itself is NOT changed/deleted — the
     * raw stored field is untouched (schema/storage unaffected); only
     * this descriptive/presentation layer stops surfacing it as a
     * performance result for a non-eligible status.
     *
     * `completionTimeSec` similarly now only reflects a genuine
     * completion time (COMPLETED/COMPLETED_FLAGGED) — for any other
     * status it's null, since raw elapsed time is not a "time to
     * complete" for a run that was never completed. INCOMPLETE keeps
     * its own separate, distinctly-named `interruptedAtTimeSec` (still
     * derived from the same stored admin.durationMs — real observed
     * data, not discarded) for the Results/History screens to label
     * "Χρόνος μέχρι τη διακοπή", never "Χρόνος ολοκλήρωσης". INVALID
     * gets neither — no elapsed-time figure is surfaced as a
     * performance result at all (admin.durationMs itself remains
     * stored, untouched, as raw audit data).
     */
    RAN.calcResults = function (admin) {
        const eligible = RATE_ELIGIBLE_STATUSES.includes(admin.status);
        const isIncomplete = admin.status === RAN.STATUS.INCOMPLETE;
        return {
            completionTimeSec: eligible && admin.durationMs != null ? admin.durationMs / 1000 : null,
            interruptedAtTimeSec: isIncomplete && admin.durationMs != null ? admin.durationMs / 1000 : null,
            independentCorrect: eligible ? admin.independentCorrect : null,
            totalStimuli: admin.totalStimuli,
            substitutions: admin.substitutions,
            omissions: admin.omissions,
            repetitions: admin.repetitions,
            selfCorrections: admin.selfCorrections,
            examinerRedirects: admin.examinerRedirects,
            // Now factors directly into independentCorrect/
            // independentNamingRate below (Scientific Protocol
            // Correction decision §1) — no longer a pure passthrough
            // that's excluded from those formulas.
            examinerProvidedAnswers: admin.examinerProvidedAnswers,
            sequenceLoss: admin.sequenceLoss,
            // Post-trial correction (item 15): pure passthrough, same as
            // the other raw fields above — purely descriptive, never
            // itself part of the rate/eligibility math.
            examinerReviewAdjusted: !!admin.examinerReviewAdjusted,
            independentNamingRate: eligible ? RAN.calcIndependentNamingRate(admin.independentCorrect, admin.durationMs) : null,
            rateEligible: eligible,
        };
    };

    /* ----------------------------------------------------------
       LONGITUDINAL COMPARISON — spec §51 (corrected in the Phase 1
       correction pass — the original spec text had a sign contradiction
       between its stated formula and its own worked example; resolved
       per explicit instruction as follows):

       percentChange = ((currentMs - previousMs) / previousMs) * 100

       Negative = current administration took LESS time (faster).
       Positive = current administration took MORE time (slower).
       This function does not itself decide whether that's an
       "improvement" — the sign alone tells you faster/slower, and the
       Results/History UI (Phase 4/5) is responsible for translating it
       into approved wording (§52), not for labeling it "improvement".

       deltaSec = currentSec - previousSec (signed, same convention):
       negative = faster, positive = slower. Deliberately not named
       absoluteDiffSec, since it keeps its sign rather than being an
       absolute value.
       ---------------------------------------------------------- */
    RAN.calcTimeDifference = function (previousMs, currentMs) {
        if (typeof previousMs !== 'number' || typeof currentMs !== 'number' || previousMs <= 0) return null;
        return {
            deltaSec: (currentMs - previousMs) / 1000,
            percentChange: ((currentMs - previousMs) / previousMs) * 100,
        };
    };

    if (typeof module !== 'undefined' && module.exports) module.exports = RAN;
})(typeof window !== 'undefined' ? window : globalThis);
