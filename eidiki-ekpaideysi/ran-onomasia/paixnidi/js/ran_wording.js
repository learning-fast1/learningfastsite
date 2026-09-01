/* ============================================================
   RAN — Locked examiner-facing wording (Phase 2 correction pass)

   Single source of truth for every exact-text string the spec locks
   down. Kept in its own pure-data module (no DOM) so it's directly
   Node-testable — exact wording can be asserted the same way the
   fixed stimulus sequences are, instead of only being checkable by
   reading rendered HTML in a browser.
   ============================================================ */
(function (root) {
    'use strict';

    const RAN = root.RAN = root.RAN || {};
    if (!RAN.deepFreeze) {
        throw new Error('RAN.wording requires ran_definitions.js to be loaded first');
    }
    if (!RAN.INCOMPLETE_REASON || !RAN.INVALID_REASON) {
        throw new Error('RAN.wording requires ran_engine.js to be loaded first (reason-label maps key off RAN.INCOMPLETE_REASON/RAN.INVALID_REASON)');
    }

    const wording = {
        RAN_DIGITS_V1: {
            // spec §15
            familiarityInstruction: 'Πες μου ποιος είναι κάθε αριθμός.',
            // Re-locked in the Practice instruction correction pass:
            // Practice verifies procedural understanding of the serial
            // naming task (untimed, not scored as RAN performance) — it
            // must never carry a speed or error-avoidance instruction,
            // which belongs only to the actual timed administration
            // (RAN.wording.preStartReminder). Do not paraphrase.
            practiceInstruction: 'Τώρα θα δεις τους αριθμούς σε σειρές. Ξεκίνα από εδώ και πες τους έναν-έναν, πηγαίνοντας από αριστερά προς τα δεξιά. Όταν τελειώσεις την πρώτη σειρά, συνέχισε από την αρχή της επόμενης.',
        },
        RAN_COLORS_V1: {
            // spec §16
            familiarityInstruction: 'Πες μου τι χρώμα είναι το καθένα.',
            // Re-locked alongside RAN_DIGITS_V1.practiceInstruction above
            // — same correction, same reasoning. Do not paraphrase.
            practiceInstruction: 'Τώρα θα δεις τα χρώματα σε σειρές. Ξεκίνα από εδώ και πες τα ένα-ένα, πηγαίνοντας από αριστερά προς τα δεξιά. Όταν τελειώσεις την πρώτη σειρά, συνέχισε από την αρχή της επόμενης.',
        },
        RAN_OBJECTS_V1: {
            // Objects round.
            familiarityInstruction: 'Πες μου τι βλέπεις σε κάθε εικόνα.',
            // Wording correction (post visual-approval pass): the original
            // proposed text carried a speed/error-avoidance clause ("όσο πιο
            // γρήγορα μπορείς χωρίς να κάνεις λάθη") — removed here because
            // Practice is untimed and only verifies procedural/serial-scan
            // understanding; a speed demand at this stage would contaminate
            // that purpose. Now consistent with the Digits/Colors practice
            // instructions' own no-speed-wording rule.
            practiceInstruction: 'Ονόμασε τις εικόνες με τη σειρά, από αριστερά προς τα δεξιά.',
        },
        // V2 (new semi-random Forms A/B) reuses the exact same locked
        // instructions as its V1 counterpart — the array randomization
        // pass changed ONLY the stimulus sequences (ran_definitions.js),
        // never the instruction wording, which is per assessment TYPE,
        // not per version.
        RAN_DIGITS_V2: {
            familiarityInstruction: 'Πες μου ποιος είναι κάθε αριθμός.',
            practiceInstruction: 'Τώρα θα δεις τους αριθμούς σε σειρές. Ξεκίνα από εδώ και πες τους έναν-έναν, πηγαίνοντας από αριστερά προς τα δεξιά. Όταν τελειώσεις την πρώτη σειρά, συνέχισε από την αρχή της επόμενης.',
        },
        RAN_COLORS_V2: {
            familiarityInstruction: 'Πες μου τι χρώμα είναι το καθένα.',
            practiceInstruction: 'Τώρα θα δεις τα χρώματα σε σειρές. Ξεκίνα από εδώ και πες τα ένα-ένα, πηγαίνοντας από αριστερά προς τα δεξιά. Όταν τελειώσεις την πρώτη σειρά, συνέχισε από την αρχή της επόμενης.',
        },
        RAN_OBJECTS_V2: {
            familiarityInstruction: 'Πες μου τι βλέπεις σε κάθε εικόνα.',
            practiceInstruction: 'Ονόμασε τις εικόνες με τη σειρά, από αριστερά προς τα δεξιά.',
        },
        // Familiarity gate wording correction (item 16, locked): re-
        // worded to the examiner-facing text explicitly specified for
        // this pass. Reason stays purely procedural — no diagnostic/
        // causal language, same as every prior wording pass on this
        // string. The underlying gate mechanism itself (finalizeFamiliarityCheck
        // -> PREPARATION_FAILED whenever any stimulus isn't Known) was
        // NOT changed here — it already existed exactly as requested;
        // only this presentation text and the two action button labels
        // in renderPreparationFailed were updated to match.
        familiarityFailed: {
            heading: 'Η εξοικείωση δεν ολοκληρώθηκε επιτυχώς.',
            message: 'Ένα ή περισσότερα ερεθίσματα δεν κατονομάστηκαν με επάρκεια κατά τον έλεγχο εξοικείωσης. Η RAN προϋποθέτει ήδη γνωστά ερεθίσματα.',
        },
        // Locked in the Phase 2 correction pass (previously PROVISIONAL).
        // Deliberately procedural only — no causal wording (attention,
        // visual perception, dyslexia, visual scanning, cognitive
        // difficulty are never mentioned, per the explicit instruction).
        serialProcedureFailed: {
            heading: 'Η σειριακή διαδικασία δεν επιβεβαιώθηκε',
            message: 'Η χρονομετρούμενη δοκιμασία δεν συνιστάται αυτή τη στιγμή, καθώς το παιδί δεν μπόρεσε να ακολουθήσει με σταθερό τρόπο τη σειριακή πορεία της δοκιμασίας μετά τη δοκιμαστική εξάσκηση.',
        },
        // spec §25, verbatim
        readyForTimedAssessment: {
            heading: 'Έτοιμοι για τη δοκιμασία',
            reminder: 'Από αυτό το σημείο δεν διορθώνουμε λανθασμένες κατονομασίες και δεν παρέχουμε ανατροφοδότηση. Αν το παιδί χάσει εντελώς τη σειρά, επιτρέπεται μόνο ουδέτερη επαναφορά στο επόμενο σημείο και καταγράφεται σχετική σημείωση.',
        },
        // spec §26, verbatim — shown on the pre-start matrix screen,
        // before the examiner presses Έναρξη.
        preStartReminder: 'Θυμήσου: όσο πιο γρήγορα μπορείς, χωρίς να κάνεις λάθη. Ξεκινάμε από εδώ.',
        // spec §36, verbatim — the ONLY thing the examiner may say for a
        // neutral redirect during the timed run.
        neutralRedirect: 'Από εδώ.',
        // spec §37, verbatim — used only if the child is completely
        // stuck on one stimulus and the examiner needs to move on.
        moveOnPrompt: 'Προχώρα στο επόμενο.',
    };

    // Locked in the Phase 3 correction pass: exact Greek display text
    // for the abort-reason radio group, keyed by the CANONICAL Phase 1
    // enum values (RAN.INCOMPLETE_REASON / RAN.INVALID_REASON) — those
    // enum keys are not renamed here even where the correction-pass
    // instruction used slightly different shorthand names, per the
    // explicit "don't rename canonical enums, map as display labels"
    // instruction. See the Phase 3 correction report for the one
    // flagged semantic note (BROWSER_REFRESH's label now also covers
    // "or navigated away", slightly broader than the enum name).
    wording.incompleteReasonLabels = {
        [RAN.INCOMPLETE_REASON.CHILD_STOPPED_PARTICIPATING]: 'Το παιδί σταμάτησε τη διαδικασία',
        [RAN.INCOMPLETE_REASON.SERIAL_PROCEDURE_LOST]: 'Δεν ήταν πλέον δυνατή η συνέχιση της σειριακής διαδικασίας',
        [RAN.INCOMPLETE_REASON.STIMULUS_KNOWLEDGE_UNCERTAIN]: 'Προέκυψε αβεβαιότητα ως προς τη γνώση των ερεθισμάτων',
        [RAN.INCOMPLETE_REASON.TECHNICAL_ISSUE]: 'Τεχνικό πρόβλημα',
        [RAN.INCOMPLETE_REASON.EXTERNAL_INTERRUPTION]: 'Εξωτερική διακοπή',
        [RAN.INCOMPLETE_REASON.OTHER]: 'Άλλος λόγος',
    };
    // Locked in the Phase 4 correction pass — exact text, do not alter.
    // Deliberately contains no dyslexia reference, risk classification,
    // diagnostic probability, normal/abnormal language, referral
    // recommendation, norms/percentiles, or a named professional title.
    wording.scientificDisclaimer = 'Η δοκιμασία παρέχει περιγραφικές πληροφορίες για την ταχύτητα σειριακής κατονομασίας ήδη γνωστών ερεθισμάτων. Δεν αποτελεί από μόνη της διαγνωστικό εργαλείο μαθησιακής ή αναπτυξιακής διαταραχής και τα αποτελέσματα πρέπει να συνεκτιμώνται με άλλες πληροφορίες αξιολόγησης.';

    wording.invalidReasonLabels = {
        // Re-worded (A/B + INVALID-reason review pass) to clearly read
        // as a DEVIATION from procedure — never confused with the
        // normal, locked "Δόθηκε απάντηση" ~3-second-rule event, which
        // is an expected procedural event (COMPLETED_FLAGGED), not an
        // automatic INVALID. This reason stays a manual examiner call
        // for genuinely unplanned help/answers outside the procedure.
        [RAN.INVALID_REASON.EXAMINER_SUPPLIED_ANSWERS]: 'Ο εξεταστής παρείχε μη προβλεπόμενη βοήθεια ή απαντήσεις πέρα από την προβλεπόμενη διαδικασία',
        [RAN.INVALID_REASON.TECHNICAL_MALFUNCTION]: 'Σημαντικό τεχνικό πρόβλημα',
        [RAN.INVALID_REASON.ACCIDENTAL_TIMER_STOP]: 'Το χρονόμετρο σταμάτησε κατά λάθος',
        [RAN.INVALID_REASON.BROWSER_REFRESH]: 'Έγινε ανανέωση ή αλλαγή σελίδας κατά τη χορήγηση',
        [RAN.INVALID_REASON.EXTERNAL_INTERRUPTION]: 'Σημαντική εξωτερική διακοπή',
        [RAN.INVALID_REASON.WRONG_FORM_SHOWN]: 'Χρησιμοποιήθηκε λανθασμένη μορφή της δοκιμασίας',
        [RAN.INVALID_REASON.FEEDBACK_PROVIDED_DURING_ADMINISTRATION]: 'Δόθηκε ανατροφοδότηση κατά τη χορήγηση',
        [RAN.INVALID_REASON.OTHER_PROCEDURAL_DEVIATION]: 'Άλλη σημαντική απόκλιση από τη διαδικασία',
    };

    // Results/History presentation pass: the raw RAN.STATUS enum value
    // must never be shown to the examiner as-is (e.g. literal
    // "COMPLETED_FLAGGED") — every status gets a short Greek label here.
    // Internal enum values themselves are completely untouched; this is
    // presentation only, used by the History table. Deliberately its
    // own compact map, not a reuse of Results' own STATUS_PRESENTATION
    // titles — History needs shorter text than the full Results banner
    // title for the same status.
    wording.historyStatusLabels = {
        [RAN.STATUS.COMPLETED]: 'Ολοκληρώθηκε',
        [RAN.STATUS.COMPLETED_FLAGGED]: 'Ολοκληρώθηκε · με σημείωση',
        [RAN.STATUS.INCOMPLETE]: 'Ημιτελής χορήγηση',
        [RAN.STATUS.INVALID]: 'Άκυρη χορήγηση',
        [RAN.STATUS.PREPARATION_FAILED]: 'Δεν πραγματοποιήθηκε χρονομετρούμενη δοκιμασία',
    };

    // User-facing raw-enum-leak safeguard: shown ONLY when a stored
    // administration carries a status value that isn't one of the 5
    // known RAN.STATUS values (e.g. corrupted/legacy/foreign imported
    // data) — never the raw status string itself. The underlying
    // record/status field is untouched; this is presentation-only.
    wording.unknownStatusLabel = 'Μη διαθέσιμη κατάσταση';

    /** Resolves a stored administration's `status` to its History-table
     * label. Deliberately the ONLY place that reads historyStatusLabels
     * with a fallback, so raw enum text can never leak through a
     * `|| rawValue` pattern at a render call site. */
    wording.resolveHistoryStatusLabel = function (status) {
        return wording.historyStatusLabels[status] || wording.unknownStatusLabel;
    };

    // Locked in the Phase 5 kickoff — exact text, do not alter. Must be
    // shown clearly wherever data is actually persisted/viewed (the
    // profiles/export screen, and the History screen). Never present
    // storage as cloud or account backup — this is a local-only,
    // per-browser store.
    wording.storageWarning = 'Τα δεδομένα αποθηκεύονται μόνο σε αυτόν τον browser και δεν συγχρονίζονται αυτόματα με άλλες συσκευές. Η διαγραφή των δεδομένων του browser μπορεί να οδηγήσει σε απώλεια των αποθηκευμένων αποτελεσμάτων.';

    /**
     * Renders RAN.calcTimeDifference()'s {deltaSec, percentChange} as
     * the two locked wording templates (Phase 5 kickoff, spec §51/§52).
     * Deliberately contains no "βελτίωση"/"επιδείνωση"/"σημαντική
     * αλλαγή"/"κλινικά σημαντική" — only the signed direction and
     * magnitude, per the explicit instruction never to characterize a
     * time difference as good/bad or clinically meaningful here.
     * deltaSec === 0 is treated as a neutral third case (no faster/
     * slower wording fits an exact tie) — a small, low-risk provisional
     * choice not explicitly covered by the instruction, flagged in the
     * Phase 5 report.
     */
    // A/B longitudinal policy (locked): shown once below every
    // longitudinal graph that mixes Form A/B points. Purely factual —
    // never says or implies the forms are equivalent/interchangeable,
    // and never tells the examiner what to do with that fact.
    wording.graphFormEquivalenceNote = 'Κάθε σημείο του γραφήματος επισημαίνει τη Μορφή (Α/Β) που χορηγήθηκε. Οι Μορφές Α και Β δεν έχουν τεκμηριωμένη ψυχομετρική ισοδυναμία.';

    /* ============================================================
       PASS 2 — numeric comparison wording (locked exact pair rule).
       Comparison is evaluated ONLY between the two chronologically
       LAST administrations of one assessment type + version — never a
       backward search for an older eligible/same-form pair (see
       ran_ui.js's classifyComparisonPair()). Exactly one of the
       functions/strings below is shown, depending on why (or whether)
       a number can be shown; never more than one at once.
       ============================================================ */

    // Percentage change is intentionally never rendered anywhere in the
    // UI (PASS 2 decision) — RAN.calcTimeDifference() in ran_engine.js
    // still computes percentChange internally (removing it there would
    // be an unrelated engine change, not requested), this module simply
    // never surfaces it. Only the signed absolute difference is shown,
    // and never characterized as improvement/decline/progress.
    wording.formatTimeComparison = function (deltaSec) {
        function fmtComma(n) { return Math.abs(n).toFixed(2).replace('.', ','); }
        function signOf(n) { return n > 0 ? '+' : (n < 0 ? '−' : ''); }

        const comparisonLine = deltaSec === 0
            ? 'Καμία διαφορά χρόνου από την προηγούμενη χορήγηση.'
            : `Διαφορά χρόνου από την προηγούμενη χορήγηση: ${signOf(deltaSec)}${fmtComma(deltaSec)} sec`;
        const comparisonNote = 'Περιγραφική διαφορά μεταξύ δύο χορηγήσεων. Δεν αποτελεί από μόνη της ένδειξη βελτίωσης ή επιδείνωσης.';
        return { comparisonLine, comparisonNote };
    };

    // Shown directly above a valid numeric comparison, so the examiner
    // never has to infer which version/form pair produced the number.
    wording.comparisonHeader = function (form) {
        return `Σύγκριση ίδιας έκδοσης και μορφής: Μορφή ${form} → Μορφή ${form}`;
    };

    // The three reasons a numeric comparison is withheld even though
    // there ARE two administrations to compare — each states the exact
    // reason, never a generic "no comparison available".
    wording.comparisonBlockedFlagged = 'Δεν εμφανίζεται αριθμητική σύγκριση επειδή μία ή περισσότερες από τις δύο τελευταίες χορηγήσεις φέρουν διαδικαστική επισήμανση.';
    wording.comparisonFormMismatch = function (previousForm, currentForm) {
        return `Δεν εμφανίζεται αριθμητική σύγκριση επειδή οι δύο τελευταίες χορηγήσεις χρησιμοποιούν διαφορετική μορφή (Μορφή ${previousForm} → Μορφή ${currentForm}).`;
    };
    wording.comparisonBlockedIneligibleStatus = 'Δεν εμφανίζεται αριθμητική σύγκριση επειδή οι δύο τελευταίες χορηγήσεις δεν πληρούν τα κριτήρια αριθμητικής σύγκρισης.';

    // PASS 2 §7 — shown once per type/version visualization when >=2
    // graph-eligible administrations share the same calendar day.
    // Deliberately no causal claim, no minimum-retest-interval rule.
    wording.sameDayWarning = 'Πολλαπλές χορηγήσεις πραγματοποιήθηκαν την ίδια ημέρα. Η επαναλαμβανόμενη έκθεση στη διαδικασία μπορεί να επηρεάσει την επίδοση· οι διαφορές χρειάζονται ιδιαίτερα προσεκτική ερμηνεία.';

    // PASS 2 §10 — shown exactly once, at the top of Profile History
    // (never repeated per assessment type section).
    wording.crossTypeWarning = 'Τα αποτελέσματα διαφορετικών τύπων RAN δεν συγκρίνονται αριθμητικά μεταξύ τους.';

    // PASS 2 §12 — shown per type/version when exactly 1 graph-eligible
    // administration exists (COMPLETED_FLAGGED counts toward this too).
    wording.insufficientGraphDataMessage = 'Η οπτικοποίηση εμφανίζεται όταν υπάρχουν τουλάχιστον 2 επιλέξιμες χορηγήσεις του ίδιου τύπου και της ίδιας έκδοσης εργαλείου.';

    // PASS 2 §9 — graph section intro, replacing the old "εξέλιξη"
    // framing (which read as implying a trend/trajectory rather than a
    // plain record of observations).
    wording.graphIntro = 'Οπτικοποίηση καταγεγραμμένων χορηγήσεων. Το γράφημα περιλαμβάνει επιλέξιμες ολοκληρωμένες χορηγήσεις. Οι χορηγήσεις με διαδικαστική επισήμανση εμφανίζονται με διαφορετικό σύμβολο.';

    // Grade proposal — display labels only. Purely contextual metadata
    // presentation; grade is never read by scoring/norms/cut-offs/risk
    // classification/comparison/graph eligibility anywhere in this
    // codebase (see RAN.GRADE's own note in ran_engine.js).
    wording.gradeLabels = {
        [RAN.GRADE.NIPIAGOGEIO]: 'Νηπιαγωγείο / Προδημοτική',
        [RAN.GRADE.A_DIMOTIKOU]: 'Α΄ Δημοτικού',
        [RAN.GRADE.B_DIMOTIKOU]: 'Β΄ Δημοτικού',
        [RAN.GRADE.G_DIMOTIKOU]: 'Γ΄ Δημοτικού',
        [RAN.GRADE.D_DIMOTIKOU]: 'Δ΄ Δημοτικού',
        [RAN.GRADE.E_DIMOTIKOU]: 'Ε΄ Δημοτικού',
        [RAN.GRADE.ST_DIMOTIKOU]: 'ΣΤ΄ Δημοτικού',
        [RAN.GRADE.A_GYMNASIOU]: 'Α΄ Γυμνασίου',
        [RAN.GRADE.B_GYMNASIOU]: 'Β΄ Γυμνασίου',
        [RAN.GRADE.G_GYMNASIOU]: 'Γ΄ Γυμνασίου',
        // The one EXPLICIT examiner choice — never used as a fallback
        // for an absent/unknown/corrupt value (that's unknownGradeLabel
        // below, via resolveGradeLabel). Keeping these two visually and
        // semantically distinct is a locked requirement, not a detail.
        [RAN.GRADE.OTHER_UNSPECIFIED]: 'Άλλο / Μη προσδιορισμένο',
    };

    // Tolerant-read fallback — shown for: no grade set (null/undefined),
    // and any legacy/imported/corrupt value that isn't a real RAN.GRADE
    // member. Deliberately NEVER "Άλλο/Μη προσδιορισμένο" — that label
    // is reserved for OTHER_UNSPECIFIED, an explicit examiner choice,
    // not an absence of data (grade data-flow correction).
    wording.unknownGradeLabel = 'Μη διαθέσιμη τάξη';

    /** Resolves a stored profile.grade / administration.
     * gradeAtAdministration value to its display label. The ONLY place
     * that reads gradeLabels with a fallback, so an unknown/corrupt
     * value can never leak as raw enum text, and can never silently
     * become "Άλλο/Μη προσδιορισμένο" (grade data-flow correction —
     * tolerant reading must stay distinguishable from an explicit
     * OTHER_UNSPECIFIED choice). */
    wording.resolveGradeLabel = function (grade) {
        if (grade === null || grade === undefined) return wording.unknownGradeLabel;
        return wording.gradeLabels[grade] || wording.unknownGradeLabel;
    };

    // Item 16 (audit/context metadata) — display resolver for
    // administration.familiarityRetriesUsed, same tolerant-fallback
    // shape as resolveGradeLabel/resolveHistoryStatusLabel above.
    // Deliberately distinguishes an EXPLICIT 0 (we know no re-check was
    // needed) from anything else not a real non-negative integer
    // (legacy record predating this field, or corrupt/imported data) —
    // the latter must read as "not recorded", never silently as 0,
    // since we genuinely don't know what happened for those records.
    wording.resolveFamiliarityRetriesLabel = function (value) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return 'Δεν καταγράφηκε';
        if (value === 0) return 'Όχι';
        return 'Ναι (' + value + ' ' + (value === 1 ? 'επανέλεγχος' : 'επανέλεγχοι') + ')';
    };

    // Item 26 — Colors-only examiner-facing reminder, shown in
    // Familiarity (never child-facing, never framed as a diagnostic
    // statement). Deliberately does not name/describe any specific
    // color-vision condition, does not offer screening or risk
    // classification — it only points back at the existing Familiarity
    // gate (Γνωστό/Δυσκολία) as the real procedural safeguard.
    wording.colorVisionReminder = 'Πριν συνεχίσετε, επιβεβαιώστε ότι το παιδί διακρίνει και κατονομάζει με συνέπεια όλα τα χρώματα. Γνωστή ή πιθανή δυσκολία χρωματικής αντίληψης μπορεί να επηρεάσει την επίδοση.';

    RAN.wording = RAN.deepFreeze(wording);

    if (typeof module !== 'undefined' && module.exports) module.exports = RAN;
})(typeof window !== 'undefined' ? window : globalThis);
