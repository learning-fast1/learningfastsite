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
        // Wording correction pass: re-worded to plain, non-technical
        // user-facing text (previous heading/message retired). Reason
        // stays purely procedural — no diagnostic/causal language.
        familiarityFailed: {
            heading: 'Η εξοικείωση δεν ολοκληρώθηκε επιτυχώς.',
            message: 'Το παιδί παρουσίασε δυσκολία στην κατονομασία ενός ή περισσότερων ερεθισμάτων. Η χρονομετρούμενη δοκιμασία δεν πραγματοποιήθηκε.',
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
    // A/B longitudinal policy (locked): shown INSTEAD of a numerical
    // comparison whenever the two most recent rate-eligible same-
    // version administrations used different forms (A vs B) — never a
    // fallback to an older same-form pair. Deliberately does not claim
    // or imply that Form A and Form B ARE (or aren't) equivalent —
    // only states the factual reason no number is shown.
    wording.timeComparisonFormMismatch = 'Δεν εμφανίζεται συγκριτική μεταβολή, επειδή οι δύο πιο πρόσφατες χορηγήσεις πραγματοποιήθηκαν με διαφορετική μορφή (Α/Β).';

    // A/B longitudinal policy (locked): shown once below every
    // longitudinal graph that mixes Form A/B points. Purely factual —
    // never says or implies the forms are equivalent/interchangeable,
    // and never tells the examiner what to do with that fact.
    wording.graphFormEquivalenceNote = 'Κάθε σημείο του γραφήματος επισημαίνει τη Μορφή (Α/Β) που χορηγήθηκε. Οι Μορφές Α και Β δεν έχουν τεκμηριωμένη ψυχομετρική ισοδυναμία.';

    // Results/History presentation pass (locked): a single neutral,
    // descriptive sentence — no "ταχύτερη/βραδύτερη" framing (that read
    // as an implicit value judgement) and Greek comma decimals to match
    // the rest of the app's number formatting (ran_ui.js's fmtNum()).
    // comparisonNote is the mandatory disclaimer shown immediately below
    // it, every time a comparison is shown — same locked text always.
    wording.formatTimeComparison = function (deltaSec, percentChange) {
        function fmtComma(n) { return Math.abs(n).toFixed(2).replace('.', ','); }
        function signOf(n) { return n > 0 ? '+' : (n < 0 ? '-' : ''); }

        const comparisonLine = (deltaSec === 0 && percentChange === 0)
            ? 'Χωρίς μεταβολή χρόνου μεταξύ των δύο τελευταίων συγκρίσιμων χορηγήσεων.'
            : 'Μεταβολή χρόνου μεταξύ των δύο τελευταίων συγκρίσιμων χορηγήσεων: '
                + signOf(deltaSec) + fmtComma(deltaSec) + ' sec ('
                + signOf(percentChange) + fmtComma(percentChange) + '%)';
        const comparisonNote = 'Η μεταβολή είναι περιγραφική και δεν αποτελεί από μόνη της ένδειξη βελτίωσης ή επιδείνωσης.';
        return { comparisonLine, comparisonNote };
    };

    RAN.wording = RAN.deepFreeze(wording);

    if (typeof module !== 'undefined' && module.exports) module.exports = RAN;
})(typeof window !== 'undefined' ? window : globalThis);
