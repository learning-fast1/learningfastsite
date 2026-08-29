/* ============================================================
   RAN — UI: Familiarity + Practice (Phase 2), Timed Assessment
   (Phase 3), Results (Phase 4), and local profiles/persistence/
   History/export-import (Phase 5).

   No Graph, no norms/percentiles/risk classification/diagnostic
   interpretation, no backend/auth/cloud sync — those are later phases
   (6+) or explicitly out of scope entirely.

   Single-page, no-router pattern (matches the phonological-awareness
   game's Phono.app: one #ran-app container, a navigate(screen)
   dispatcher, one render*() method per screen) — see the Phase 0
   proposal for why this is the established repo convention. Phase 3's
   live timer/redirect-counter screen (renderTimedRunning) is the one
   deliberate, explicitly-commented exception to that pattern — see
   the comment inside it for why.
   ============================================================ */
window.RAN = window.RAN || {};

(function () {
    const { el } = RAN.dom;
    const P = RAN.preparation;

    const ASSESSMENT_LABELS = {
        RAN_DIGITS_V1: 'Αριθμοί',
        RAN_COLORS_V1: 'Χρώματα',
        RAN_OBJECTS_V1: 'Αντικείμενα',
    };

    // Results/History presentation pass: the raw RAN.STATUS enum value
    // must never be shown to the examiner as-is (e.g. literal
    // "COMPLETED_FLAGGED") — every status gets a short Greek label here.
    // Internal enum values themselves are completely untouched; this is
    // presentation only, used by the History table (renderProfileHistory).
    // Deliberately its own compact map, not a reuse of Results' own
    // STATUS_PRESENTATION titles — History needs shorter text than the
    // full Results banner title for the same status.
    const HISTORY_STATUS_LABELS = {
        [RAN.STATUS.COMPLETED]: 'Ολοκληρώθηκε',
        [RAN.STATUS.COMPLETED_FLAGGED]: 'Ολοκληρώθηκε · με σημείωση',
        [RAN.STATUS.INCOMPLETE]: 'Ημιτελής χορήγηση',
        [RAN.STATUS.INVALID]: 'Άκυρη χορήγηση',
        [RAN.STATUS.PREPARATION_FAILED]: 'Δεν πραγματοποιήθηκε χρονομετρούμενη δοκιμασία',
    };

    // Per-assessment-type wording lives in RAN.wording (js/ran_wording.js)
    // — the single locked source of truth, also directly Node-testable
    // for exact-string assertions. This file only reads from it.
    const WORDING = RAN.wording;

    /** MM:SS.CC (hundredths) — used only by the Phase 3 live timer and
     * the Simple Mode error-capture screen's read-only duration line.
     * Not part of the locked wording; purely a display format. */
    function formatElapsedTime(ms) {
        const totalCs = Math.max(0, Math.floor(ms / 10));
        const cs = totalCs % 100;
        const totalSec = Math.floor(totalCs / 100);
        const sec = totalSec % 60;
        const min = Math.floor(totalSec / 60);
        const pad = (n, len) => String(n).padStart(len, '0');
        return `${pad(min, 2)}:${pad(sec, 2)}.${pad(cs, 2)}`;
    }

    // Abort-reason display labels are locked wording — RAN.wording.
    // incompleteReasonLabels / invalidReasonLabels (js/ran_wording.js).

    /* ============================================================
       Phase 5.5 — UI/UX-only helpers. None of these touch scientific
       logic/state/wording; they only format already-computed numbers
       for display and build purely decorative/navigational markup.
       ============================================================ */

    // Comma-decimal formatting for UI-only numeric displays (Results
    // metrics, History table numbers). RAN.wording.formatTimeComparison
    // does its own comma-decimal formatting internally (Results/History
    // presentation pass) since it lives in a separate module — its
    // return value is rendered verbatim, not re-formatted here.
    function fmtNum(n, decimals) {
        if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
        return n.toFixed(decimals).replace('.', ',');
    }

    const RESULTS_TITLE = {
        RAN_DIGITS_V1: 'RAN Αριθμών',
        RAN_COLORS_V1: 'RAN Χρωμάτων',
        RAN_OBJECTS_V1: 'RAN Αντικειμένων',
    };

    // Non-interactive stepper — plain divs, never clickable navigation
    // shortcuts. Shown on ordinary examiner administration screens
    // only; never on timedRunning (Measurement Mode) or the
    // profiles/History workflow (a deliberately separate workflow).
    const STEPS = [
        { key: 'familiarity', label: 'Εξοικείωση' },
        { key: 'practice', label: 'Εξάσκηση' },
        { key: 'timed', label: 'Δοκιμασία' },
        { key: 'results', label: 'Αποτελέσματα' },
    ];
    function renderStepper(currentKey) {
        const currentIndex = STEPS.findIndex(s => s.key === currentKey);
        const children = [];
        STEPS.forEach((step, i) => {
            const state = i < currentIndex ? 'is-done' : i === currentIndex ? 'is-current' : '';
            children.push(el('div', { className: `ran-step ${state}`.trim() }, [
                el('span', { className: 'ran-step-dot', textContent: i < currentIndex ? '✓' : String(i + 1) }),
                el('span', { textContent: step.label }),
            ]));
            if (i < STEPS.length - 1) children.push(el('span', { className: 'ran-step-sep' }));
        });
        return el('div', { className: 'ran-stepper', 'aria-hidden': 'true' }, children);
    }

    // A handful of small, sparse decorative marks (inline SVG, no
    // external assets/framework). Used only on the landing screen and
    // Profiles' header — per the approved design, decoration must stay
    // restrained, never on every card/heading, and never in Measurement
    // Mode. Purely decorative: aria-hidden, absolutely positioned.
    const BLOB_SHAPES = {
        leaf: '<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 90C10 50 40 15 90 20C95 60 65 100 20 90Z" fill="#6FA0C4" fill-opacity="0.35"/></svg>',
        dot: '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="13" cy="13" r="11" fill="#D9B36C" fill-opacity="0.5"/></svg>',
        spark: '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 4L23 17L36 20L23 23L20 36L17 23L4 20L17 17L20 4Z" fill="#C9A47C" fill-opacity="0.4"/></svg>',
    };
    function renderBlob(variant, style) {
        const blob = el('div', { className: 'ran-blob', innerHTML: BLOB_SHAPES[variant] || BLOB_SHAPES.leaf, 'aria-hidden': 'true' });
        if (style) Object.assign(blob.style, style);
        return blob;
    }

    /* ============================================================
       Phase 6 — Longitudinal Graph. Pure presentation over the
       existing canonical RAN.storage administrations (no second
       persisted structure — filtering/grouping happens here, at
       render time, from data already validated by RAN.validate
       Administration when it was saved). Hand-built SVG: no chart
       library, no build step, matching the static-site convention.
       ============================================================ */

    const SVG_NS = 'http://www.w3.org/2000/svg';
    function svgEl(tag, attrs, children) {
        const node = document.createElementNS(SVG_NS, tag);
        Object.keys(attrs || {}).forEach(key => {
            const value = attrs[key];
            if (key === 'textContent') node.textContent = value;
            else node.setAttribute(key, value);
        });
        (children || []).forEach(child => { if (child) node.appendChild(child); });
        return node;
    }

    // Only these two statuses ever represent a valid, rate-eligible
    // completed administration (spec §46 / Phase 1 lock) — the graph
    // must never plot INVALID/INCOMPLETE/PREPARATION_FAILED points.
    function isGraphEligible(admin) {
        return admin.status === RAN.STATUS.COMPLETED || admin.status === RAN.STATUS.COMPLETED_FLAGGED;
    }

    function formatDateDDMMYYYY(iso) {
        if (!iso) return '—';
        const [y, m, d] = iso.slice(0, 10).split('-');
        return `${d}/${m}/${y}`;
    }
    function formatDateShort(iso) {
        if (!iso) return '—';
        const [, m, d] = iso.slice(0, 10).split('-');
        return `${d}/${m}`;
    }

    /**
     * Builds one longitudinal graph section for an already-filtered,
     * already-chronologically-sorted list of >=3 graph-eligible points
     * `{dateISO, durationSec, form, status}` — all belonging to the
     * SAME profile/assessmentId/assessmentVersion (callers never mix
     * versions or assessment types into one call). No regression/
     * trend/forecast/smoothing — the polyline connects the measured
     * observations only. No normative bands/zones/targets. Y-axis
     * starts at 0 and is never inverted. COMPLETED_FLAGGED points use
     * a distinct shape (diamond, not just a color swap) — spec §5.
     */
    function buildLongitudinalGraph(points, headingText) {
        const width = 640, height = 280;
        const padLeft = 56, padRight = 24, padTop = 24, padBottom = 56;
        const plotW = width - padLeft - padRight;
        const plotH = height - padTop - padBottom;
        const n = points.length;

        const maxVal = Math.max.apply(null, points.map(p => p.durationSec));
        const yMax = Math.max(1, Math.ceil(maxVal * 1.15 * 10) / 10);
        const yMin = 0;
        const xFor = (i) => padLeft + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
        const yFor = (v) => padTop + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

        const gridAndYLabels = [];
        const yTicks = 4;
        for (let t = 0; t <= yTicks; t++) {
            const val = yMin + (yMax - yMin) * (t / yTicks);
            const y = yFor(val);
            gridAndYLabels.push(svgEl('line', { x1: padLeft, y1: y, x2: width - padRight, y2: y, stroke: '#DCE4E8', 'stroke-width': 1 }));
            gridAndYLabels.push(svgEl('text', { x: padLeft - 8, y: y + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#57707A', textContent: fmtNum(val, 1) }));
        }

        // Thin X labels once there are more points than comfortably
        // fit — every point is still PLOTTED, only its text LABEL may
        // be skipped (spec §13: never silently discard data points).
        const maxLabels = 7;
        const labelEvery = Math.max(1, Math.ceil(n / maxLabels));
        const xLabels = [];
        points.forEach((p, i) => {
            if (i % labelEvery !== 0 && i !== n - 1) return;
            const x = xFor(i);
            const y = height - padBottom + 18;
            xLabels.push(svgEl('text', {
                x, y, 'text-anchor': 'end', 'font-size': 10, fill: '#57707A',
                transform: `rotate(-35 ${x} ${y})`,
                textContent: formatDateShort(p.dateISO),
            }));
        });

        const linePoints = points.map((p, i) => `${xFor(i)},${yFor(p.durationSec)}`).join(' ');
        const line = svgEl('polyline', { points: linePoints, fill: 'none', stroke: '#3E6D8F', 'stroke-width': 2 });

        const markers = [];
        // A/B longitudinal policy (locked): form (A/B) text labels are
        // kept in their own array, separate from `markers` — they must
        // NOT pick up the marker hover/focus/tooltip listeners wired up
        // below (they're pointer-events:none, purely visual annotation).
        const formLabels = [];
        points.forEach((p, i) => {
            const cx = xFor(i), cy = yFor(p.durationSec);
            const isFlagged = p.status === RAN.STATUS.COMPLETED_FLAGGED;
            const statusText = isFlagged ? 'Ολοκληρώθηκε με διαδικαστική επισήμανση' : 'Ολοκληρώθηκε';
            const label = `${formatDateDDMMYYYY(p.dateISO)} · ${fmtNum(p.durationSec, 2)} sec · Μορφή ${p.form} · ${statusText}`;
            let marker;
            if (isFlagged) {
                const s = 7;
                marker = svgEl('rect', {
                    x: cx - s, y: cy - s, width: s * 2, height: s * 2,
                    fill: '#D9B36C', stroke: '#8C6A38', 'stroke-width': 1.5,
                    transform: `rotate(45 ${cx} ${cy})`,
                    tabindex: '0', role: 'img', 'aria-label': label,
                    class: 'ran-graph-point ran-graph-point-flagged',
                });
            } else {
                marker = svgEl('circle', {
                    cx, cy, r: 6, fill: '#3E6D8F', stroke: '#2C4E66', 'stroke-width': 1,
                    tabindex: '0', role: 'img', 'aria-label': label,
                    class: 'ran-graph-point',
                });
            }
            marker.setAttribute('data-tooltip', label);
            markers.push(marker);

            // A/B longitudinal policy (locked): the form (A/B) is
            // identified per point via a SEPARATE visual channel (a
            // small text label above the marker) — deliberately never
            // via the marker's own shape/fill, which is already
            // reserved for status (circle=COMPLETED, diamond=
            // COMPLETED_FLAGGED). Purely descriptive text, not part of
            // the status encoding, so the two never get confused.
            formLabels.push(svgEl('text', {
                x: cx, y: cy - (isFlagged ? 14 : 13),
                'text-anchor': 'middle', 'font-size': 9, 'font-weight': 700,
                fill: '#57707A', 'pointer-events': 'none',
                textContent: p.form,
            }));
        });

        const svg = svgEl('svg', {
            viewBox: `0 0 ${width} ${height}`,
            width: '100%',
            role: 'img',
            'aria-label': `${headingText} — γράφημα εξέλιξης χρόνου ολοκλήρωσης, ${n} χορηγήσεις`,
        }, [
            svgEl('title', { textContent: headingText }),
            ...gridAndYLabels,
            ...xLabels,
            line,
            ...markers,
            ...formLabels,
        ]);
        svg.style.minWidth = Math.max(400, n * 50) + 'px';

        const tooltip = el('div', { className: 'ran-graph-tooltip' });
        const svgWrap = el('div', { className: 'ran-graph-svg-wrap' }, [svg, tooltip]);

        function showTooltip(marker) {
            tooltip.textContent = marker.getAttribute('data-tooltip');
            tooltip.classList.add('is-visible');
            const wrapRect = svgWrap.getBoundingClientRect();
            const mRect = marker.getBoundingClientRect();
            tooltip.style.left = (mRect.left - wrapRect.left + mRect.width / 2 + svgWrap.scrollLeft) + 'px';
            tooltip.style.top = (mRect.top - wrapRect.top) + 'px';
        }
        function hideTooltip() { tooltip.classList.remove('is-visible'); }
        markers.forEach(marker => {
            marker.addEventListener('mouseenter', () => showTooltip(marker));
            marker.addEventListener('focus', () => showTooltip(marker));
            marker.addEventListener('click', () => showTooltip(marker));
            marker.addEventListener('mouseleave', hideTooltip);
            marker.addEventListener('blur', hideTooltip);
        });

        return el('div', { className: 'ran-graph-section' }, [
            el('h3', { textContent: headingText }),
            el('p', { className: 'ran-field-hint', textContent: 'Οπτικοποίηση της εξέλιξης του χρόνου ολοκλήρωσης στις έγκυρες, ολοκληρωμένες χορηγήσεις. Ο πίνακας παρακάτω παραμένει διαθέσιμος με όλα τα δεδομένα.' }),
            el('div', { className: 'ran-graph-chart-row' }, [
                el('div', { className: 'ran-graph-y-axis-label', textContent: 'Χρόνος ολοκλήρωσης (sec)' }),
                svgWrap,
            ]),
            el('div', { className: 'ran-graph-x-axis-label', textContent: 'Ημερομηνία χορήγησης' }),
            el('p', { className: 'ran-graph-axis-helper', textContent: '↓ Μικρότερος χρόνος = ταχύτερη ολοκλήρωση' }),
            el('div', { className: 'ran-graph-legend' }, [
                el('span', { className: 'ran-graph-legend-item' }, [el('span', { className: 'ran-legend-circle' }), document.createTextNode('Ολοκληρώθηκε')]),
                el('span', { className: 'ran-graph-legend-item' }, [el('span', { className: 'ran-legend-diamond' }), document.createTextNode('Ολοκληρώθηκε με διαδικαστική επισήμανση')]),
            ]),
            // A/B longitudinal policy (locked) — shown once per graph,
            // regardless of whether this specific set of points actually
            // mixes forms, so its presence/absence never itself implies
            // anything about the data (a graph that happens to be all-
            // Form-A today could gain a Form-B point tomorrow).
            el('p', { className: 'ran-graph-form-note', textContent: RAN.wording.graphFormEquivalenceNote }),
        ]);
    }

    RAN.app = {
        container: null,
        currentScreen: null,
        session: null, // the active RAN.preparation session, or null before one exists

        // Phase 3 only. timedDraft: { form, studentId, abortSelection?,
        // lastValidationProblems? } — a temporary, NON-PERSISTED draft
        // for the current administration attempt (see the Phase 3
        // report for why studentId is temporary here, not a real
        // profile). timedRun: live-timing state for the current
        // running/just-finished attempt. timedRecord: the last built
        // { administration, validationProblems } result.
        timedDraft: null,
        timedRun: null,
        timedRecord: null,

        // Phase 5 only. lastSaveResult: the outcome of the most recent
        // RAN.storage.saveAdministration() call, shown on Results.
        // viewingProfileId: which local profile's History screen is
        // currently open.
        lastSaveResult: null,
        viewingProfileId: null,
        lastImportReport: null,

        // Familiarity screen UX correction: which of the 5 stimuli (by
        // index into definition.stimuli, the SAME fixed display order
        // used everywhere else — never reordered/randomized) the
        // sequential examiner recording panel currently refers to. Pure
        // UI navigation state, not part of the scientific data model —
        // the actual per-stimulus Known/Difficulty judgments still live
        // entirely in session.familiarity.marks, unchanged. Reset to 0
        // at every point a fresh (all-null) Familiarity attempt begins:
        // startPreparation, repeatFamiliarityCheck, and
        // returnToFamiliarityFromPractice.
        familiarityIndex: 0,

        // Phase 5.5 screen-size safety gate. Only these two fields;
        // _gateResizeListener is whatever resize handler the CURRENT
        // screen attached (a full re-render for timedMatrixPreStart, or
        // a check-and-force-abort watcher for timedRunning) — always
        // torn down in navigate() so it can never leak onto an
        // unrelated screen or, worse, fire a re-render on timedRunning
        // that would reset the live timer.
        _gateResizeListener: null,

        // Phase 7: tab/window-backgrounding safeguard, armed only while
        // renderTimedRunning() has a live timer. Same lifecycle rule as
        // _gateResizeListener above — always torn down centrally in
        // navigate() so it can never survive onto (or fire against) a
        // screen it wasn't built for, and never accumulates across
        // administrations.
        _visibilityListener: null,

        init() {
            this.container = document.getElementById('ran-app');
            this.navigate('assessmentSelect');
        },

        /**
         * Minimum width/height for the fixed-presentation matrix
         * screens (spec: the standardized matrix must never reflow,
         * shrink, or wrap to accommodate a smaller screen — instead we
         * refuse to show it at all below this size).
         *
         * Width history: 600 from Phase 5.5 through the real-browser
         * height-viewport correction. Timed-screen side-by-side
         * correction moved timedRunning to a matrix-left/toolbar-right
         * layout (uses horizontal space instead of stacking) — neither
         * column shrinks or wraps by design, so if the viewport is too
         * narrow to hold both, the row would overflow horizontally
         * rather than compress the matrix. Measured via CDP (true
         * viewport, not the JS-only Object.defineProperty trick): real
         * overflow appears below 708px (707px overflows, 708px does
         * not) at this layout's natural width (matrix column + gap +
         * the fixed-width toolbar column). Raised to 730 — a ~22px
         * margin above that measured 708px floor, deliberately larger
         * than the earlier 680 height margin that turned out too tight
         * against a real device, given real-world scrollbar/font-metric
         * variance. This is a correctness fix (the old 600 floor would
         * let the new layout genuinely overflow/clip), not a
         * convenience change — timedMatrixPreStart's own layout is
         * unchanged and was already safe well below this width, it
         * simply now also gates a little earlier, consistently with
         * timedRunning's real requirement.
         *
         * Height history: originally 900 (Phase 5.5, measured 886px).
         * Phase 7 QA compacted toolbar whitespace and re-measured at
         * 763.2px, using 800 as the threshold. Timed-screen viewport
         * correction (real-laptop-usability pass, deliberately NOT
         * treating the Phase 7 number as untouchable) restructured the
         * toolbar further — timer + procedural controls now share a row
         * on wide viewports instead of always stacking, plus trimmed
         * margins/padding around the matrix wrapper, prestart wrapper,
         * and Measurement Mode's own #ran-app padding — all whitespace,
         * no change to the matrix's own stimulus/row/gap dimensions.
         * Re-measured via CDP at the true 600px width floor (the
         * tallest state: both procedural indicators populated, so the
         * reminder line wraps to 2 lines) at 643px, down from 787px at
         * that same width before this pass.
         *
         * 680 (first chosen with a ~37px margin) turned out to still be
         * too conservative in practice: a real reported laptop browser
         * viewport of 1280x665 was blocked by it despite having ample
         * width, since 665 < 680 by only 15px. Re-examined against the
         * actual measured content heights (630px at normal laptop
         * widths, 643px worst-case near the 600px width floor) and
         * lowered to 660 — a tighter but still safe ~17px margin above
         * the real 643px floor, chosen specifically so genuinely usable
         * real-world laptop viewports (like the 1280x665 one that
         * surfaced this) are no longer incorrectly blocked.
         *
         * NOT changed by the side-by-side correction: moving the
         * toolbar beside the matrix instead of below it dropped the
         * measured content height further, to 535px (down from 630px
         * stacked) at 1440px width, consistently down to the new
         * MATRIX_MIN_WIDTH floor too. 660 still comfortably clears that
         * with margin to spare — left as-is per instruction not to
         * lower a safety threshold just to make something pass when
         * nothing currently requires it. Flagging the new number here
         * as a proposal only: 660 could likely be lowered further if
         * ever needed, but that is a decision for a future explicit
         * request, not made unilaterally here.
         */
        MATRIX_MIN_WIDTH: 730,
        MATRIX_MIN_HEIGHT: 660,
        isViewportSafeForMatrix() {
            return window.innerWidth >= this.MATRIX_MIN_WIDTH && window.innerHeight >= this.MATRIX_MIN_HEIGHT;
        },

        /** The dedicated blocking screen (spec: never a compressed
         * matrix). onBack decides where "← Πίσω" returns to — the
         * caller's previous step, not a fixed destination. Does NOT by
         * itself imply anything about the child's performance. */
        renderScreenTooSmall(onBack) {
            const screen = el('div', { className: 'ran-screen' }, [
                el('h1', { textContent: 'Χρειάζεται μεγαλύτερη οθόνη' }),
                el('div', { className: 'ran-disclaimer' }, [
                    el('p', { textContent: 'Η οθόνη είναι πολύ μικρή για την αξιόπιστη προβολή της δοκιμασίας. Χρησιμοποιήστε tablet, laptop ή μεγαλύτερη οθόνη.' }),
                ]),
                el('div', { className: 'ran-actions' }, [
                    el('button', { className: 'ran-btn ran-btn-secondary', textContent: '← Πίσω', onClick: onBack }),
                ]),
            ]);
            this.container.appendChild(screen);
        },

        navigate(screen) {
            // Measurement Mode is armed only inside renderTimedRunning()
            // itself — clearing it unconditionally here, before every
            // navigation, guarantees it can never leak onto any other
            // screen regardless of how timedRunning was left (Finish,
            // Abort, or a defensive guard redirect).
            document.body.classList.remove('ran-measurement-mode');
            // Same reasoning for Practice's wider content column (final
            // compact-layout correction): armed only inside
            // renderPractice(), always cleared here first so no other
            // screen ever inherits Practice's extra width.
            this.container.classList.remove('ran-practice-wide');
            // Same reasoning for the screen-size gate's resize watcher:
            // whatever the previous screen attached is torn down before
            // the new screen (which may or may not re-attach its own)
            // renders — a stale listener must never fire against a
            // screen it wasn't built for.
            if (this._gateResizeListener) {
                window.removeEventListener('resize', this._gateResizeListener);
                this._gateResizeListener = null;
            }
            // Same reasoning for the tab/window-visibility safeguard: torn
            // down before every navigation (Finish, Abort, or any other
            // path) so it can never fire against a screen it wasn't armed
            // for, and a fresh administration never inherits a previous
            // one's listener.
            if (this._visibilityListener) {
                document.removeEventListener('visibilitychange', this._visibilityListener);
                this._visibilityListener = null;
            }
            // Phase 7 hardening: stopTimer() already clears this on every
            // real Finish/Abort path, but centralizing it here too (like
            // the two guards above) means it can never survive onto a
            // screen it wasn't armed for, even via some future/defensive
            // navigation path that doesn't go through stopTimer().
            window.onbeforeunload = null;
            this.container.innerHTML = '';
            this.currentScreen = screen;
            switch (screen) {
                case 'assessmentSelect': return this.renderAssessmentSelect();
                case 'familiarity': return this.renderFamiliarity();
                case 'practice': return this.renderPractice();
                case 'preparationFailed': return this.renderPreparationFailed();
                case 'preparationEnded': return this.renderPreparationEnded();
                case 'readyForTimedAssessment': return this.renderReady();
                case 'administrationSetup': return this.renderAdministrationSetup();
                case 'timedMatrixPreStart': return this.renderTimedMatrixPreStart();
                case 'timedRunning': return this.renderTimedRunning();
                case 'timedAbortReason': return this.renderTimedAbortReason();
                case 'timedErrorCapture': return this.renderTimedErrorCapture();
                case 'results': return this.renderResults();
                case 'profiles': return this.renderProfiles();
                case 'profileHistory': return this.renderProfileHistory();
                default: throw new Error(`RAN.app.navigate: unknown screen "${screen}"`);
            }
        },

        /** Sole gate every Phase 3 screen calls before rendering (spec
         * §13: Familiarity/Practice must not be skippable). Redirects
         * to assessmentSelect and returns false if the session never
         * actually reached READY_FOR_TIMED_ASSESSMENT through the full
         * flow, or was terminated. */
        guardCanBegin() {
            if (!RAN.timed.canBegin(this.session)) {
                this.session = null;
                this.navigate('assessmentSelect');
                return false;
            }
            return true;
        },

        /** Renders a stimulus in its assessment-appropriate visual form —
         * plain digit/text, an identically-shaped/sized circle whose
         * fill color is the only variable (spec §5.2), or (Objects
         * round) an image inside the same fixed .ran-stimulus box.
         * Shared by Familiarity, Practice and the Timed matrix, so no
         * stage ever looks different from another for the same
         * assessment. Dispatches on the definition's own `type` field
         * (controlled refactor away from the old hardcoded
         * assessmentId === 'RAN_COLORS_V1' check) so a new assessment
         * type only needs a new branch here, not a parallel render
         * path. The Objects branch uses alt="" (decorative) — the
         * canonical Greek label must never be exposed in the DOM
         * during Familiarity/Practice/Timed, since that would leak the
         * expected answer (spec §6). */
        renderStimulus(assessmentId, stimulus) {
            const type = RAN.getDefinition(assessmentId).type;
            if (type === 'colors') {
                return el('div', {
                    className: 'ran-stimulus ran-stimulus-circle',
                    'data-stimulus': stimulus,
                });
            }
            if (type === 'objects') {
                return el('div', {
                    className: 'ran-stimulus ran-stimulus-object',
                    'data-stimulus': stimulus,
                }, [
                    el('img', {
                        className: 'ran-stimulus-object-img',
                        src: `assets/objects/${stimulus}.png`,
                        alt: '',
                    }),
                ]);
            }
            return el('div', {
                className: 'ran-stimulus',
                'data-stimulus': stimulus,
                textContent: stimulus,
            });
        },

        /* ===========================================
           ASSESSMENT SELECT (minimal — full assessment
           list/menu is not in scope for Phase 2)
           =========================================== */
        renderAssessmentSelect() {
            const screen = el('div', { className: 'ran-screen' }, [
                el('div', { className: 'ran-hero' }, [
                    el('img', { className: 'ran-brand-logo', src: 'assets/brand/logo.png', alt: 'Learning Fast' }),
                    el('h1', { textContent: 'Ταχεία Κατονομασία (RAN)' }),
                    el('p', { className: 'ran-subtitle', textContent: 'Αξιολογήστε και παρακολουθήστε την ταχύτητα με την οποία το παιδί κατονομάζει σειριακά γνωστά οπτικά ερεθίσματα.' }),
                ]),
                el('div', { className: 'ran-assessment-picker' }, [
                    el('button', {
                        className: 'ran-assessment-card',
                        onClick: () => this.startPreparation('RAN_DIGITS_V1'),
                    }, [
                        el('div', { className: 'ran-assessment-motif' }, ['1', '2', '3'].map(d => el('span', { className: 'ran-assessment-motif-digit', textContent: d }))),
                        el('div', { className: 'ran-assessment-card-title', textContent: 'Αριθμοί' }),
                        el('div', { className: 'ran-assessment-card-desc', textContent: 'Ταχεία σειριακή κατονομασία γνωστών αριθμών.' }),
                        el('div', { className: 'ran-assessment-card-cta', textContent: 'Έναρξη δοκιμασίας →' }),
                    ]),
                    el('button', {
                        className: 'ran-assessment-card',
                        onClick: () => this.startPreparation('RAN_COLORS_V1'),
                    }, [
                        el('div', { className: 'ran-assessment-motif' }, ['#dc2626', '#2563eb', '#16a34a', '#eab308', '#111827'].map(c => el('span', { className: 'ran-assessment-motif-dot', style: { background: c } }))),
                        el('div', { className: 'ran-assessment-card-title', textContent: 'Χρώματα' }),
                        el('div', { className: 'ran-assessment-card-desc', textContent: 'Ταχεία σειριακή κατονομασία γνωστών χρωμάτων.' }),
                        el('div', { className: 'ran-assessment-card-cta', textContent: 'Έναρξη δοκιμασίας →' }),
                    ]),
                    el('button', {
                        className: 'ran-assessment-card',
                        onClick: () => this.startPreparation('RAN_OBJECTS_V1'),
                    }, [
                        el('div', { className: 'ran-assessment-motif' }, RAN.getDefinition('RAN_OBJECTS_V1').stimuli.slice(0, 3).map(id => el('img', {
                            className: 'ran-assessment-motif-object',
                            src: `assets/objects/${id}.png`,
                            alt: '',
                        }))),
                        el('div', { className: 'ran-assessment-card-title', textContent: 'Αντικείμενα' }),
                        el('div', { className: 'ran-assessment-card-desc', textContent: 'Ταχεία σειριακή κατονομασία γνωστών αντικειμένων.' }),
                        el('div', { className: 'ran-assessment-card-cta', textContent: 'Έναρξη δοκιμασίας →' }),
                    ]),
                ]),
                el('div', { className: 'ran-section-secondary' }, [
                    el('div', { className: 'ran-eyebrow', textContent: 'Παρακολούθηση' }),
                    el('button', { className: 'ran-profile-entry-card', onClick: () => this.navigate('profiles') }, [
                        el('div', {}, [
                            el('div', { className: 'ran-assessment-card-title', textContent: 'Προφίλ & Ιστορικό' }),
                            el('div', { className: 'ran-assessment-card-desc', textContent: 'Δείτε προηγούμενες χορηγήσεις και την εξέλιξη κάθε μαθητή.' }),
                        ]),
                        el('div', { className: 'ran-assessment-card-cta', textContent: 'Προβολή προφίλ →' }),
                    ]),
                ]),
            ]);
            this.container.appendChild(screen);
        },

        startPreparation(assessmentId) {
            // Reset any leftover Results/save state from a previous
            // administration — this is the true start of a new attempt,
            // not just the "← Νέα Χορήγηση" button on Results, so a
            // stale lastSaveResult/timedRecord must not leak forward
            // (found by the Phase 5 browser test: reaching Results a
            // second time without going through that button still
            // showed the FIRST administration's "already saved"
            // confirmation instead of a fresh save form).
            this.timedRecord = null;
            this.lastSaveResult = null;
            this.familiarityIndex = 0;
            this.session = P.beginFamiliarity(P.createSession(assessmentId));
            this.navigate('familiarity');
        },

        /* ===========================================
           FAMILIARITY — spec §14-19, UX correction: sequential
           examiner recording (single change scope — see the
           Familiarity screen UX correction report; no other screen or
           any part of the underlying state machine/data model
           changed).

           Two conceptual areas, kept visually and structurally
           separate: the plain .ran-stimulus-row above is entirely
           child-facing — all 5 stimuli shown together, identical
           presentation, no per-stimulus controls or correctness
           feedback (only a neutral border marks which one is
           currently being recorded). Everything in
           .ran-familiarity-panel below is examiner-only: current
           stimulus number, a recorded/current/pending progress
           indicator (never which judgment was given), one shared pair
           of Γνωστό/Δυσκολία controls that always applies to the
           current stimulus, a Previous control to revisit and correct
           an earlier judgment without losing later ones, and the
           existing completion action — now additionally gated on all
           5 stimuli having a recorded judgment (a new UI-only
           precondition; RAN.preparation's own state machine and its
           all-Known pass rule are untouched).

           this.familiarityIndex is pure UI navigation state (which of
           definition.stimuli, the same fixed order used everywhere,
           the panel currently refers to) — the actual Known/Difficulty
           judgments still live entirely in session.familiarity.marks,
           written via the unchanged P.markFamiliarity() one stimulus
           at a time, exactly as before.
           =========================================== */
        renderFamiliarity() {
            const session = this.session;
            const definition = RAN.getDefinition(session.assessmentId);
            const wording = WORDING[session.assessmentId];
            const stimuli = definition.stimuli;

            if (typeof this.familiarityIndex !== 'number' || this.familiarityIndex < 0) this.familiarityIndex = 0;
            if (this.familiarityIndex > stimuli.length - 1) this.familiarityIndex = stimuli.length - 1;
            const currentIndex = this.familiarityIndex;
            const currentStim = stimuli[currentIndex];
            const currentMark = session.familiarity.marks[currentStim];

            // ---- Stimulus area: purely child-facing presentation. No
            // per-stimulus buttons, no ✓/✕, no recorded-state styling —
            // the only distinguishing mark is a neutral (brand-blue,
            // never green/red) border on whichever one the examiner is
            // currently recording, so the examiner always knows which
            // stimulus the panel below refers to without relying on
            // position alone. ----
            const stimulusItems = stimuli.map((stim, i) => {
                const stimEl = this.renderStimulus(session.assessmentId, stim);
                if (i === currentIndex) stimEl.classList.add('ran-stimulus-current');
                return stimEl;
            });

            // ---- Examiner progress indicator: recorded / current /
            // pending ONLY — never which judgment (Known vs Difficulty)
            // was given, so it cannot be read as a correctness signal. ----
            const progressDots = stimuli.map((stim, i) => {
                const recorded = !!session.familiarity.marks[stim];
                const isCurrent = i === currentIndex;
                const stateClass = isCurrent ? 'ran-familiarity-dot-current' : recorded ? 'ran-familiarity-dot-recorded' : '';
                const stateLabel = isCurrent ? 'τρέχον' : recorded ? 'καταγεγραμμένο' : 'εκκρεμεί';
                return el('span', {
                    className: `ran-familiarity-dot ${stateClass}`.trim(),
                    'aria-label': `Ερέθισμα ${i + 1}: ${stateLabel}`,
                    textContent: String(i + 1),
                });
            });

            const recordAndAdvance = (mark) => {
                this.session = P.markFamiliarity(this.session, currentStim, mark);
                if (currentIndex < stimuli.length - 1) this.familiarityIndex = currentIndex + 1;
                this.navigate('familiarity');
            };

            const knownBtn = el('button', {
                className: `ran-mark-btn ran-mark-known${currentMark === RAN.FAMILIARITY_MARK.KNOWN ? ' active' : ''}`,
                textContent: 'Γνωστό',
                onClick: () => recordAndAdvance(RAN.FAMILIARITY_MARK.KNOWN),
            });
            const difficultyBtn = el('button', {
                className: `ran-mark-btn ran-mark-difficulty${currentMark === RAN.FAMILIARITY_MARK.DIFFICULTY ? ' active' : ''}`,
                textContent: 'Δυσκολία',
                onClick: () => recordAndAdvance(RAN.FAMILIARITY_MARK.DIFFICULTY),
            });

            const prevBtn = currentIndex > 0 ? el('button', {
                className: 'ran-btn ran-btn-secondary',
                textContent: '← Προηγούμενο',
                onClick: () => {
                    this.familiarityIndex = currentIndex - 1;
                    this.navigate('familiarity');
                },
            }) : null;

            const allRecorded = stimuli.every(s => !!session.familiarity.marks[s]);
            const allKnown = P.isFamiliarityEstablished(session);
            const statusText = !allRecorded
                ? 'Κατέγραψε Γνωστό/Δυσκολία για κάθε ερέθισμα πριν ολοκληρώσεις τον έλεγχο.'
                : allKnown
                    ? 'Όλα τα ερεθίσματα έχουν σημειωθεί ως Γνωστά.'
                    : 'Καταγράφηκαν όλα τα ερεθίσματα — τουλάχιστον ένα σημειώθηκε ως Δυσκολία.';

            const completeBtn = el('button', {
                className: 'ran-btn ran-btn-primary',
                textContent: 'Ολοκλήρωση Ελέγχου',
                disabled: !allRecorded,
                onClick: () => {
                    this.session = P.finalizeFamiliarityCheck(this.session);
                    this.navigate(this.session.state === RAN.PREP_STATE.PRACTICE ? 'practice' : 'preparationFailed');
                },
            });

            const screen = el('div', { className: 'ran-screen' }, [
                renderStepper('familiarity'),
                el('div', { className: 'ran-eyebrow', textContent: ASSESSMENT_LABELS[session.assessmentId] }),
                el('h1', { textContent: 'Έλεγχος εξοικείωσης' }),
                el('p', { className: 'ran-subtitle', textContent: 'Βεβαιωθείτε ότι το παιδί κατονομάζει όλα τα ερεθίσματα πριν από τη χρονομέτρηση.' }),
                el('div', { className: 'ran-examiner-instruction' }, [
                    el('div', { className: 'ran-eyebrow', textContent: 'Πείτε στο παιδί:' }),
                    el('p', { textContent: wording.familiarityInstruction }),
                ]),
                el('div', { className: 'ran-stimulus-row' }, stimulusItems),
                el('div', { className: 'ran-card ran-familiarity-panel' }, [
                    el('h2', { textContent: 'Καταγραφή ερεθισμάτων' }),
                    el('div', { className: 'ran-familiarity-progress' }, progressDots),
                    el('p', { className: 'ran-familiarity-current-label', textContent: `Ερέθισμα ${currentIndex + 1} από ${stimuli.length}` }),
                    el('div', { className: 'ran-actions' }, [knownBtn, difficultyBtn]),
                    el('div', { className: 'ran-actions' }, [prevBtn, completeBtn].filter(Boolean)),
                ]),
                el('p', { className: 'ran-status-line', textContent: statusText }),
            ]);
            this.container.appendChild(screen);
        },

        /* ===========================================
           PREPARATION FAILED — spec §17 (Familiarity) and the locked
           serial-procedure failure wording (Phase 2 correction pass).
           Both headings/messages come from RAN.wording — no inline
           strings here, so there is exactly one place either could
           ever drift from the locked text.
           =========================================== */
        renderPreparationFailed() {
            const session = this.session;
            const isFamiliarityFailure = session.failureReason === RAN.PREPARATION_FAILURE_REASON.FAMILIARITY_NOT_ESTABLISHED;
            const copy = isFamiliarityFailure ? RAN.wording.familiarityFailed : RAN.wording.serialProcedureFailed;
            const heading = copy.heading;
            const message = copy.message;

            const actions = [];
            if (isFamiliarityFailure) {
                actions.push(el('button', {
                    className: 'ran-btn ran-btn-primary',
                    textContent: 'Επανάληψη ελέγχου',
                    onClick: () => {
                        this.session = P.repeatFamiliarityCheck(this.session);
                        this.familiarityIndex = 0;
                        this.navigate('familiarity');
                    },
                }));
            }
            actions.push(el('button', {
                className: 'ran-btn ran-btn-danger',
                textContent: 'Τερματισμός προετοιμασίας',
                onClick: () => {
                    this.session = P.endPreparation(this.session);
                    this.navigate('preparationEnded');
                },
            }));

            const screen = el('div', { className: 'ran-screen' }, [
                el('div', { className: 'ran-failure-banner' }, [
                    el('h2', { textContent: heading }),
                    el('p', { textContent: message }),
                ]),
                el('p', { className: 'ran-status-line', textContent: `Κατάσταση εγγραφής: PREPARATION_FAILED / ${session.failureReason}` }),
                el('div', { className: 'ran-actions' }, actions),
            ]);
            this.container.appendChild(screen);
        },

        renderPreparationEnded() {
            const session = this.session;
            const screen = el('div', { className: 'ran-screen' }, [
                el('h1', { textContent: 'Η προετοιμασία τερματίστηκε' }),
                el('p', { textContent: `Δοκιμασία: ${ASSESSMENT_LABELS[session.assessmentId]}. Δεν πραγματοποιήθηκε χρονομετρούμενη δοκιμασία.` }),
                el('p', { className: 'ran-status-line', textContent: `Κατάσταση εγγραφής: PREPARATION_FAILED / ${session.failureReason} (τερματισμένη)` }),
                el('div', { className: 'ran-actions' }, [
                    el('button', {
                        className: 'ran-btn ran-btn-secondary',
                        textContent: '← Επιλογή δοκιμασίας',
                        onClick: () => { this.session = null; this.navigate('assessmentSelect'); },
                    }),
                ]),
            ]);
            this.container.appendChild(screen);
        },

        /* ===========================================
           PRACTICE — spec §20-24
           =========================================== */
        renderPractice() {
            // Final compact-layout correction: Practice is the only
            // screen given extra horizontal room (#ran-app.ran-practice-
            // wide), so its instruction/checklist/action row can use the
            // available width instead of wrapping to extra lines. Torn
            // down centrally in navigate() above the instant any other
            // screen is reached — wording/matrix/checklist/state-machine/
            // button behavior are all completely unchanged.
            this.container.classList.add('ran-practice-wide');

            const session = this.session;
            const definition = RAN.getDefinition(session.assessmentId);
            const wording = WORDING[session.assessmentId];
            const materials = RAN.practiceMaterials[session.assessmentId];

            const matrixRows = materials.rows.map(row => el('div', { className: 'ran-stimulus-row' },
                row.map(stim => this.renderStimulus(session.assessmentId, stim))));

            const checklistDefs = [
                ['startPosition', 'Ξεκίνησε από το σωστό σημείο'],
                ['leftToRight', 'Ακολούθησε από αριστερά προς τα δεξιά'],
                ['rowTransition', 'Συνέχισε σωστά στην επόμενη σειρά'],
            ];
            const checklistEls = checklistDefs.map(([key, label]) => {
                const input = el('input', {
                    type: 'checkbox',
                    checked: session.practice.checklist[key],
                    onChange: (e) => {
                        this.session = P.setPracticeChecklistItem(this.session, key, e.target.checked);
                        this.navigate('practice');
                    },
                });
                return el('label', { className: 'ran-check-row' }, [input, document.createTextNode(label)]);
            });

            const complete = P.isPracticeChecklistComplete(session);
            const canRetry = session.practice.attemptNumber < 2;
            const usedRetry = session.practice.attemptNumber >= 2;

            const actions = [
                el('button', {
                    className: 'ran-btn ran-btn-primary',
                    textContent: 'Η διαδικασία έγινε κατανοητή →',
                    disabled: !complete,
                    onClick: () => {
                        this.session = P.completePractice(this.session);
                        this.navigate('readyForTimedAssessment');
                    },
                }),
            ];
            if (canRetry) {
                actions.push(el('button', {
                    className: 'ran-btn ran-btn-secondary',
                    textContent: 'Χρειάζεται επανάληψη',
                    onClick: () => {
                        this.session = P.retryPractice(this.session);
                        this.navigate('practice');
                    },
                }));
            }
            actions.push(el('button', {
                className: 'ran-btn ran-btn-secondary',
                textContent: '⟲ Επιστροφή σε Εξοικείωση (λάθη κατονομασίας)',
                onClick: () => {
                    this.session = P.returnToFamiliarityFromPractice(this.session);
                    this.familiarityIndex = 0;
                    this.navigate('familiarity');
                },
            }));
            if (usedRetry) {
                actions.push(el('button', {
                    className: 'ran-btn ran-btn-danger',
                    textContent: 'Η διαδικασία δεν έγινε κατανοητή — Τερματισμός',
                    onClick: () => {
                        this.session = P.failSerialProcedure(this.session);
                        this.navigate('preparationFailed');
                    },
                }));
            }

            const screen = el('div', { className: 'ran-screen' }, [
                renderStepper('practice'),
                el('div', { className: 'ran-eyebrow', textContent: ASSESSMENT_LABELS[session.assessmentId] }),
                el('h1', { textContent: 'Δοκιμαστική εξάσκηση' }),
                el('span', { className: 'ran-badge', textContent: `Προσπάθεια ${session.practice.attemptNumber} από 2` }),
                el('p', { className: 'ran-status-line', textContent: 'Εξάσκηση στη διαδικασία — δεν χρονομετρείται.' }),
                el('div', { className: 'ran-examiner-instruction ran-practice-instruction' }, [
                    el('p', { textContent: wording.practiceInstruction }),
                ]),
                el('div', { className: 'ran-practice-matrix' }, matrixRows),
                el('h2', { className: 'ran-checklist-heading', textContent: 'Επιβεβαιώστε ότι:' }),
                el('div', { className: 'ran-checklist' }, checklistEls),
                el('div', { className: 'ran-actions' }, actions),
            ]);
            this.container.appendChild(screen);
        },

        /* ===========================================
           READY FOR TIMED ASSESSMENT — spec §25
           =========================================== */
        renderReady() {
            const session = this.session;
            const copy = RAN.wording.readyForTimedAssessment;
            const screen = el('div', { className: 'ran-screen' }, [
                renderStepper('timed'),
                el('div', { className: 'ran-eyebrow', textContent: ASSESSMENT_LABELS[session.assessmentId] }),
                el('h1', { textContent: copy.heading }),
                el('div', { className: 'ran-examiner-instruction' }, [
                    el('p', { textContent: copy.reminder }),
                ]),
                el('div', { className: 'ran-actions' }, [
                    el('button', {
                        className: 'ran-btn ran-btn-primary',
                        textContent: 'Εμφάνιση δοκιμασίας',
                        onClick: () => {
                            this.timedDraft = { form: null, studentId: RAN.timed.generateEphemeralStudentId() };
                            this.navigate('administrationSetup');
                        },
                    }),
                    el('button', {
                        className: 'ran-btn ran-btn-secondary',
                        textContent: '← Επιλογή δοκιμασίας',
                        onClick: () => { this.session = null; this.navigate('assessmentSelect'); },
                    }),
                ]),
            ]);
            this.container.appendChild(screen);
        },

        /* ===========================================
           ADMINISTRATION SETUP — Phase 3, spec §8
           Form A/B choice only. The administration's studentId is an
           ephemeral, auto-generated technical id (RAN.timed.
           generateEphemeralStudentId(), set when this draft was
           created in renderReady()) — never typed by the examiner,
           never shown here, not a student profile (Phase 5 correction
           pass: this screen must not ask for any student identity).
           =========================================== */
        isSetupValid() {
            const d = this.timedDraft;
            return !!d && !!d.form;
        },

        renderAdministrationSetup() {
            if (!this.guardCanBegin()) return;
            const session = this.session;
            const draft = this.timedDraft;

            const continueBtn = el('button', {
                className: 'ran-btn ran-btn-primary',
                textContent: 'Συνέχεια',
                disabled: !this.isSetupValid(),
                onClick: () => this.navigate('timedMatrixPreStart'),
            });

            const formBtn = (key, label) => el('button', {
                className: `ran-btn ${draft.form === key ? 'ran-btn-primary' : 'ran-btn-secondary'}`,
                textContent: label,
                onClick: () => {
                    draft.form = key;
                    this.navigate('administrationSetup');
                },
            });

            const screen = el('div', { className: 'ran-screen' }, [
                renderStepper('timed'),
                el('h1', { textContent: `Ρύθμιση χορήγησης — ${ASSESSMENT_LABELS[session.assessmentId]}` }),
                el('div', { className: 'ran-form-field' }, [
                    el('label', { textContent: 'Μορφή' }),
                    el('div', { className: 'ran-actions' }, [formBtn('A', 'Μορφή Α'), formBtn('B', 'Μορφή Β')]),
                ]),
                el('div', { className: 'ran-actions' }, [continueBtn]),
            ]);
            this.container.appendChild(screen);
        },

        /* ===========================================
           TIMED MATRIX PRE-START — spec §26
           Full fixed matrix rendered and visible before Start; no
           timer running yet.
           =========================================== */
        renderTimedMatrixPreStart() {
            if (!this.guardCanBegin()) return;

            // Before Start: continuously re-evaluate. Attaching this
            // listener BEFORE the safety check (not just in the unsafe
            // branch) means it's active in both states, so the screen
            // flips automatically the moment the viewport becomes
            // safe/unsafe — no manual reload needed either direction.
            this._gateResizeListener = () => this.navigate('timedMatrixPreStart');
            window.addEventListener('resize', this._gateResizeListener);

            if (!this.isViewportSafeForMatrix()) {
                this.renderScreenTooSmall(() => this.navigate('administrationSetup'));
                return;
            }

            const session = this.session;
            const draft = this.timedDraft;
            const definition = RAN.getDefinition(session.assessmentId);
            const formRows = definition.forms[draft.form];

            const matrixRows = formRows.map(row => el('div', { className: 'ran-stimulus-row' },
                row.map(stim => this.renderStimulus(session.assessmentId, stim))));

            const screen = el('div', { className: 'ran-screen' }, [
                renderStepper('timed'),
                el('img', { className: 'ran-brand-logo ran-brand-logo-small', src: 'assets/brand/logo.png', alt: 'Learning Fast' }),
                el('h1', { textContent: `${ASSESSMENT_LABELS[session.assessmentId]} — Μορφή ${draft.form}` }),
                el('div', { className: 'ran-examiner-instruction' }, [
                    el('p', { textContent: RAN.wording.preStartReminder }),
                ]),
                el('div', { className: 'ran-prestart-matrix-wrap' }, [
                    el('div', { className: 'ran-timed-matrix' }, matrixRows),
                ]),
                el('div', { className: 'ran-actions' }, [
                    el('button', {
                        className: 'ran-btn ran-btn-primary',
                        textContent: 'Έναρξη',
                        onClick: () => this.navigate('timedRunning'),
                    }),
                ]),
            ]);
            this.container.appendChild(screen);
        },

        /* ===========================================
           TIMED RUNNING — spec §27-37
           performance.now() timing + live redirect counter. This is
           the one deliberate exception to the app's full-rebuild-via-
           navigate() convention: the timer and redirect count mutate
           two held DOM references directly (via a requestAnimationFrame
           loop and plain click handlers) so the fixed matrix never
           flickers or resets mid-measurement.
           =========================================== */
        renderTimedRunning() {
            if (!this.guardCanBegin()) return;

            // Entry-time gate (defensive — timedMatrixPreStart already
            // verified this before Start was clickable, but this closes
            // the race where the viewport shrank in the instant between
            // that check and the click). The timer has NOT started yet
            // at this point, so there is no in-progress administration
            // to abort — just block entry, same as pre-start.
            if (!this.isViewportSafeForMatrix()) {
                this.renderScreenTooSmall(() => this.navigate('timedMatrixPreStart'));
                this._gateResizeListener = () => this.navigate('timedRunning');
                window.addEventListener('resize', this._gateResizeListener);
                return;
            }

            const session = this.session;
            const draft = this.timedDraft;
            const definition = RAN.getDefinition(session.assessmentId);
            const formRows = definition.forms[draft.form];

            // Full Measurement Mode (Phase 5.5 §3): the child-facing
            // surface strips branding/stepper/decorative color/cards
            // around the stimuli entirely — not just visually hidden,
            // simply never added to this screen's DOM below. Cleared
            // centrally in navigate() the instant any other screen is
            // reached, however this screen is left.
            document.body.classList.add('ran-measurement-mode');

            // Phase 7 hardening: if this were ever somehow re-entered
            // while a previous rAF loop was still ticking (there is no
            // known real user path to this — Start's own button is
            // destroyed by navigate()'s DOM clear before a second click
            // could ever reach it — but this is cheap insurance against
            // an orphaned rAF loop from any future/defensive re-entry),
            // cancel the stale loop before starting a fresh one so two
            // timers can never run concurrently.
            if (this.timedRun && this.timedRun.rafId !== null) {
                cancelAnimationFrame(this.timedRun.rafId);
            }

            this.timedRun = { startTime: performance.now(), examinerRedirects: 0, sequenceLoss: false, examinerProvidedAnswers: 0, rafId: null };
            const run = this.timedRun;

            const matrixRows = formRows.map(row => el('div', { className: 'ran-stimulus-row' },
                row.map(stim => this.renderStimulus(session.assessmentId, stim))));

            const timerDisplay = el('span', { className: 'ran-timer-display', textContent: '00:00.00' });
            const redirectCount = el('span', { className: 'ran-redirect-count', textContent: '0' });
            const sequenceLossIndicator = el('span', { className: 'ran-sequence-loss-indicator', textContent: 'Όχι' });
            const answerGivenCount = el('span', { className: 'ran-redirect-count', textContent: '0' });

            const tick = () => {
                timerDisplay.textContent = formatElapsedTime(performance.now() - run.startTime);
                run.rafId = requestAnimationFrame(tick);
            };
            run.rafId = requestAnimationFrame(tick);

            // Navigation guard (Phase 0 approval item 7): armed only
            // while a timed run is actually in progress, disarmed the
            // instant Finish or Abort stops the timer.
            window.onbeforeunload = (e) => { e.preventDefault(); e.returnValue = ''; return ''; };

            const stopTimer = () => {
                if (run.rafId !== null) cancelAnimationFrame(run.rafId);
                run.rafId = null;
                window.onbeforeunload = null;
                return performance.now() - run.startTime;
            };

            // Resize/rotation DURING active timing (Phase 5.5 gate,
            // distinct from the pre-start re-evaluation above): the
            // matrix itself is never reflowed or resized here — this
            // only WATCHES for the viewport crossing into unsafe
            // territory while the timer is still running, and if so,
            // force-stops the timer and routes through the existing
            // INVALID/buildAbortedAdministration mechanism (not a new
            // status) with the reason pre-selected, preserving the
            // partial raw duration. The examiner still must explicitly
            // confirm on timedAbortReason — this never silently writes
            // a record. Reason choice (OTHER_PROCEDURAL_DEVIATION) is a
            // flagged judgment call — see the Phase 5.5 gate report.
            this._gateResizeListener = () => {
                if (run.rafId === null) return; // already finished/aborted
                if (this.isViewportSafeForMatrix()) return;
                run.partialDurationMs = stopTimer();
                run.autoAbortedForScreenSize = true;
                draft.abortSelection = { category: 'invalid', reason: RAN.INVALID_REASON.OTHER_PROCEDURAL_DEVIATION };
                this.navigate('timedAbortReason');
            };
            window.addEventListener('resize', this._gateResizeListener);

            // Tab/window-backgrounding safeguard (Phase 7, approved
            // recommendation): requestAnimationFrame throttles/pauses
            // while a tab is hidden, but performance.now() keeps
            // advancing in real time regardless — so a backgrounded
            // period would otherwise silently inflate durationMs with no
            // examiner awareness and no record it happened. Triggers
            // only on the document actually becoming hidden (tab
            // switch/app switch/minimize) — NOT on generic window blur,
            // so clicking into browser chrome or another window gaining
            // focus while this page remains visible never invalidates a
            // run. Routes through the same existing INVALID/
            // buildAbortedAdministration mechanism as the screen-size
            // gate above (not a new status), preserving the partial raw
            // duration; the examiner still must explicitly confirm on
            // timedAbortReason — this never silently writes a record.
            this._visibilityListener = () => {
                if (run.rafId === null) return; // already finished/aborted
                if (document.visibilityState !== 'hidden') return;
                run.partialDurationMs = stopTimer();
                run.autoAbortedForVisibility = true;
                draft.abortSelection = { category: 'invalid', reason: RAN.INVALID_REASON.OTHER_PROCEDURAL_DEVIATION };
                this.navigate('timedAbortReason');
            };
            document.addEventListener('visibilitychange', this._visibilityListener);

            // Deliberately two independent actions/variables (Phase 3
            // correction pass): sequenceLoss (boolean — was the serial
            // procedure lost at some point) and examinerRedirects
            // (integer — how many neutral redirects were given). They
            // often co-occur but one must never auto-set the other.
            const redirectBtn = el('button', {
                className: 'ran-btn ran-btn-secondary',
                textContent: `Επαναφορά «${RAN.wording.neutralRedirect}»`,
                onClick: () => {
                    run.examinerRedirects += 1;
                    redirectCount.textContent = String(run.examinerRedirects);
                },
            });

            const sequenceLossBtn = el('button', {
                className: 'ran-btn ran-btn-secondary',
                textContent: 'Απώλεια σειράς',
                onClick: () => {
                    run.sequenceLoss = true;
                    sequenceLossIndicator.textContent = 'Καταγράφηκε';
                    sequenceLossBtn.disabled = true;
                },
            });

            // Scientific Protocol Correction (3-second rule): a THIRD,
            // fully independent procedural control/counter. Deliberately
            // does not touch sequenceLoss or examinerRedirects in either
            // direction — one event must never imply another (see the
            // correction report §11). No automatic per-stimulus timer:
            // the examiner alone judges the ~3s threshold and clicks
            // this button; the live timer above keeps running
            // uninterrupted regardless.
            const answerGivenBtn = el('button', {
                className: 'ran-btn ran-btn-secondary',
                textContent: 'Δόθηκε απάντηση',
                onClick: () => {
                    run.examinerProvidedAnswers += 1;
                    answerGivenCount.textContent = String(run.examinerProvidedAnswers);
                },
            });

            const finishBtn = el('button', {
                className: 'ran-btn ran-btn-primary',
                textContent: 'Τέλος',
                onClick: () => {
                    run.durationMs = stopTimer();
                    this.navigate('timedErrorCapture');
                },
            });

            // Timed-screen side-by-side correction: Abort is deliberately
            // styled as a muted/outlined secondary action here (never the
            // solid ran-btn-danger fill) so Finish reads as the clear
            // primary action — a styling choice only, the abort/safety
            // logic above (stopTimer, timedAbortReason routing) is
            // completely unchanged.
            const abortBtn = el('button', {
                className: 'ran-btn ran-btn-secondary ran-timed-abort-btn',
                textContent: 'Εγκατάλειψη',
                onClick: () => {
                    run.partialDurationMs = stopTimer();
                    this.navigate('timedAbortReason');
                },
            });

            // Timed-screen side-by-side correction: matrix (child-facing,
            // left) and a fixed-width vertical examiner toolbar (right)
            // sit side by side in .ran-timed-layout on any viewport wide
            // enough to hold both without compressing the matrix — the
            // matrix wrap/row/tile markup below is byte-for-byte the same
            // as before. There is deliberately NO responsive fallback
            // that stacks or shrinks this layout at narrower widths: if
            // the viewport can't hold it, isViewportSafeForMatrix()'s
            // MATRIX_MIN_WIDTH (re-measured and raised for this layout —
            // see its doc comment) already blocks entry via the existing
            // renderScreenTooSmall() gate above, so this arrangement is
            // never reached in a squeezed state.
            const screen = el('div', { className: 'ran-screen' }, [
                el('div', { className: 'ran-timed-layout' }, [
                    el('div', { className: 'ran-measurement-matrix-wrap' }, [
                        el('div', { className: 'ran-timed-matrix' }, matrixRows),
                    ]),
                    el('div', { className: 'ran-toolbar' }, [
                        el('div', { className: 'ran-timer-panel' }, [timerDisplay, el('span', { className: 'ran-timer-label', textContent: 'χρόνος' })]),
                        el('div', { className: 'ran-sequence-loss-panel' }, [
                            el('span', { className: 'ran-toolbar-row-label', textContent: 'Απώλεια σειράς:' }),
                            sequenceLossIndicator,
                            sequenceLossBtn,
                        ]),
                        el('div', { className: 'ran-redirect-panel' }, [
                            el('span', { className: 'ran-toolbar-row-label', textContent: 'Επαναφορές:' }),
                            redirectCount,
                            redirectBtn,
                        ]),
                        el('div', { className: 'ran-answer-given-panel' }, [
                            el('span', { className: 'ran-toolbar-row-label', textContent: 'Δόθηκε απάντηση:' }),
                            answerGivenCount,
                            answerGivenBtn,
                        ]),
                        // UX refinement pass (locked 3-second protocol
                        // wording): rewritten to read as one consistent
                        // set of instructions covering both procedural
                        // cases — sequence loss vs. ~3s no-response — in
                        // place of the older two-part "neutral redirect /
                        // stuck-on-stimulus" framing. The locked
                        // neutralRedirect phrase (spec §36) is still
                        // embedded verbatim inside the sentence.
                        // moveOnPrompt itself is untouched and still used
                        // as its own locked wording constant elsewhere —
                        // only this status line's own prose changed.
                        el('p', { className: 'ran-status-line', textContent: `Αν χαθεί η σειρά: δείξτε το σωστό σημείο και πείτε «${RAN.wording.neutralRedirect}» Αν δεν απαντήσει σε περίπου 3″: δώστε την ονομασία του ερεθίσματος και ζητήστε να συνεχίσει.` }),
                        el('div', { className: 'ran-actions' }, [finishBtn, abortBtn]),
                    ]),
                ]),
            ]);
            this.container.appendChild(screen);
        },

        /* ===========================================
           TIMED ABORT REASON — spec §40-41
           =========================================== */
        renderTimedAbortReason() {
            if (!this.guardCanBegin()) return;
            const session = this.session;
            const draft = this.timedDraft;
            const run = this.timedRun;
            if (draft.abortSelection === undefined) draft.abortSelection = null;

            const confirmBtn = el('button', {
                className: 'ran-btn ran-btn-danger',
                textContent: 'Επιβεβαίωση Εγκατάλειψης',
                disabled: !draft.abortSelection,
                onClick: () => {
                    const sel = draft.abortSelection;
                    this.timedRecord = RAN.timed.buildAbortedAdministration({
                        studentId: draft.studentId,
                        assessmentId: session.assessmentId,
                        form: draft.form,
                        reasonCategory: sel.category,
                        reason: sel.reason,
                        partialDurationMs: run.partialDurationMs,
                        examinerRedirects: run.examinerRedirects,
                        examinerProvidedAnswers: run.examinerProvidedAnswers,
                        sequenceLoss: run.sequenceLoss,
                    });
                    this.navigate('results');
                },
            });

            const radioRow = (category, reasonKey, label) => {
                const checked = !!(draft.abortSelection && draft.abortSelection.category === category && draft.abortSelection.reason === reasonKey);
                const input = el('input', {
                    type: 'radio', name: 'ran-abort-reason', checked,
                    onChange: () => {
                        draft.abortSelection = { category, reason: reasonKey };
                        confirmBtn.disabled = false;
                    },
                });
                return el('label', {}, [input, document.createTextNode(label)]);
            };

            const incompleteRows = Object.values(RAN.INCOMPLETE_REASON).map(reason => radioRow('incomplete', reason, RAN.wording.incompleteReasonLabels[reason]));
            const invalidRows = Object.values(RAN.INVALID_REASON).map(reason => radioRow('invalid', reason, RAN.wording.invalidReasonLabels[reason]));

            const autoAbortNotice = run.autoAbortedForScreenSize
                ? el('div', { className: 'ran-failure-banner' }, [
                    el('h2', { textContent: 'Η δοκιμασία διακόπηκε αυτόματα' }),
                    el('p', { textContent: 'Το μέγεθος της οθόνης άλλαξε κατά τη διάρκεια της χρονομέτρησης, οπότε η διαδικασία σταμάτησε αυτόματα. Αυτό δεν σημαίνει ότι η επίδοση του παιδιού ήταν ανεπαρκής — απλώς η τυποποιημένη παρουσίαση δεν μπορούσε πλέον να διασφαλιστεί. Επιβεβαίωσε την αιτία παρακάτω για να καταγραφεί η μερική διάρκεια.' }),
                ])
                : run.autoAbortedForVisibility
                ? el('div', { className: 'ran-failure-banner' }, [
                    el('h2', { textContent: 'Η δοκιμασία διακόπηκε' }),
                    el('p', { textContent: 'Η σελίδα ή η εφαρμογή έπαψε να είναι ορατή κατά τη διάρκεια της χρονομέτρησης. Η χορήγηση διακόπηκε ώστε ο χρόνος να μην περιλαμβάνει διάστημα κατά το οποίο η δοκιμασία δεν παρουσιαζόταν κανονικά.' }),
                ])
                : null;

            const screen = el('div', { className: 'ran-screen' }, [
                el('h1', { textContent: 'Εγκατάλειψη δοκιμασίας — αιτία' }),
                autoAbortNotice,
                el('p', { textContent: 'Επίλεξε την αιτία που ταιριάζει καλύτερα. Η κατηγορία (Ημιτελής / Άκυρη) καθορίζεται αυτόματα από την επιλογή.' }),
                el('div', { className: 'ran-radio-group' }, [
                    el('div', { className: 'ran-radio-group-heading', textContent: 'Ημιτελής δοκιμασία (INCOMPLETE)' }),
                    ...incompleteRows,
                    el('div', { className: 'ran-radio-group-heading', textContent: 'Άκυρη δοκιμασία (INVALID)' }),
                    ...invalidRows,
                ]),
                el('div', { className: 'ran-actions' }, [confirmBtn]),
            ]);
            this.container.appendChild(screen);
        },

        /* ===========================================
           TIMED ERROR CAPTURE (Simple Mode) — spec §38-39
           =========================================== */
        renderTimedErrorCapture() {
            if (!this.guardCanBegin()) return;
            const session = this.session;
            const draft = this.timedDraft;
            const run = this.timedRun;

            // UX refinement pass: compact −/value/+ stepper in place of a
            // bare numeric input, so 4 fields fit in far less vertical
            // space. The number stays directly editable (typing/pasting
            // still works); min 0 is enforced on every path (buttons,
            // typing, blur) exactly like the old input[min="0"] did —
            // same validation contract as before, just presented
            // differently. Returns the same { field, input } shape as
            // the old numField() so the submit handler below (and the
            // toInt() reader it uses) is unchanged.
            let numFieldCount = 0;
            const stepperField = (labelText, defaultValue) => {
                const id = 'ran-error-field-' + (numFieldCount++);
                const input = el('input', {
                    id, type: 'number', min: '0', step: '1', value: String(defaultValue),
                    className: 'ran-count-stepper-input',
                });
                const clamp = () => {
                    input.value = String(Math.max(0, parseInt(input.value, 10) || 0));
                };
                const step = (delta) => {
                    input.value = String(Math.max(0, (parseInt(input.value, 10) || 0) + delta));
                };
                input.addEventListener('change', clamp);
                const minusBtn = el('button', {
                    type: 'button', className: 'ran-count-stepper-btn', textContent: '−',
                    'aria-label': `${labelText}: μείωση`, onClick: () => step(-1),
                });
                const plusBtn = el('button', {
                    type: 'button', className: 'ran-count-stepper-btn', textContent: '+',
                    'aria-label': `${labelText}: αύξηση`, onClick: () => step(1),
                });
                // Named ran-count-stepper (not ran-stepper) — that name is
                // already taken by the unrelated top-of-screen progress
                // breadcrumb (renderStepper()); reusing it here silently
                // collided with that component's own CSS/selectors.
                const stepper = el('div', { className: 'ran-count-stepper' }, [minusBtn, input, plusBtn]);
                const field = el('div', { className: 'ran-form-field ran-form-field-compact' }, [
                    el('label', { for: id, textContent: labelText }),
                    stepper,
                ]);
                return { field, input };
            };

            // Order locked by examiner review: Αντικαταστάσεις, Παραλείψεις,
            // Αυτοδιορθώσεις, Επαναλήψεις.
            const subs = stepperField('Αντικαταστάσεις', 0);
            const omis = stepperField('Παραλείψεις', 0);
            const selfCorr = stepperField('Αυτοδιορθώσεις', 0);
            const reps = stepperField('Επαναλήψεις', 0);

            const notesInput = el('textarea', {
                placeholder: 'Προαιρετικές σημειώσεις...',
                className: 'ran-notes-textarea',
            });

            const problems = draft.lastValidationProblems;
            const problemsBox = (problems && problems.length)
                ? el('div', { className: 'ran-validation-problems' }, [
                    el('p', { textContent: 'Βρέθηκαν προβλήματα — διόρθωσε τα παρακάτω πεδία:' }),
                    el('ul', {}, problems.map(p => el('li', { textContent: p }))),
                ])
                : null;

            // UX refinement pass: examinerProvidedAnswers/examinerRedirects/
            // sequenceLoss were already captured live during timedRunning —
            // they're shown here as a compact READ-ONLY summary, not
            // editable inputs, and the submit handler below reads them
            // straight from `run` (unchanged values/logic, just no longer
            // exposed as a form control the examiner could accidentally
            // edit after the fact).
            const proceduralSummary = el('div', { className: 'ran-card ran-procedural-summary' }, [
                el('h2', { textContent: 'Καταγράφηκαν κατά τη δοκιμασία' }),
                el('dl', { className: 'ran-summary-list' }, [
                    el('dt', { textContent: 'Δόθηκε απάντηση' }),
                    el('dd', { textContent: String(run.examinerProvidedAnswers) }),
                    el('dt', { textContent: 'Επαναφορές' }),
                    el('dd', { textContent: String(run.examinerRedirects) }),
                    el('dt', { textContent: 'Απώλεια σειράς' }),
                    el('dd', { textContent: run.sequenceLoss ? 'Ναι' : 'Όχι' }),
                ]),
            ]);

            const screen = el('div', { className: 'ran-screen ran-error-capture-screen' }, [
                renderStepper('timed'),
                el('h1', { textContent: 'Καταγραφή (Simple Mode)' }),
                el('p', { className: 'ran-status-line', textContent: `Μετρημένος χρόνος: ${formatElapsedTime(run.durationMs)} (${fmtNum(run.durationMs / 1000, 2)} sec)` }),
                problemsBox,
                el('div', { className: 'ran-error-capture-grid' }, [
                    el('div', { className: 'ran-card' }, [
                        el('h2', { textContent: 'Καταγραφή λαθών' }),
                        subs.field, omis.field, selfCorr.field, reps.field,
                    ]),
                    proceduralSummary,
                ]),
                el('div', { className: 'ran-card' }, [
                    el('h2', { textContent: 'Σημειώσεις' }),
                    notesInput,
                ]),
                el('div', { className: 'ran-actions' }, [
                    el('button', {
                        className: 'ran-btn ran-btn-primary',
                        textContent: 'Ολοκλήρωση Καταγραφής',
                        onClick: () => {
                            const toInt = (input) => Math.max(0, parseInt(input.value, 10) || 0);
                            const result = RAN.timed.buildCompletedAdministration({
                                studentId: draft.studentId,
                                assessmentId: session.assessmentId,
                                form: draft.form,
                                durationMs: run.durationMs,
                                substitutions: toInt(subs.input),
                                omissions: toInt(omis.input),
                                repetitions: toInt(reps.input),
                                selfCorrections: toInt(selfCorr.input),
                                examinerRedirects: run.examinerRedirects,
                                examinerProvidedAnswers: run.examinerProvidedAnswers,
                                sequenceLoss: run.sequenceLoss,
                                notes: notesInput.value || '',
                            });
                            if (result.validationProblems.length) {
                                draft.lastValidationProblems = result.validationProblems;
                                this.navigate('timedErrorCapture');
                                return;
                            }
                            draft.lastValidationProblems = null;
                            this.timedRecord = result;
                            this.navigate('results');
                        },
                    }),
                ]),
            ]);
            this.container.appendChild(screen);
        },

        /**
         * Phase 5: lets the examiner attach the just-built (still
         * ephemeral-studentId) administration to a chosen local
         * profile, or create one on the spot. Saving is optional —
         * "← Νέα Χορήγηση" works with or without it. Handles three
         * states: already saved (confirmation), storage unavailable
         * (graceful message, no crash), or the plain save form —
         * re-shown with RAN.storage.saveAdministration()'s problems
         * inline if the previous attempt failed instead of losing the
         * record.
         */
        renderSaveSection(admin) {
            if (this.lastSaveResult && this.lastSaveResult.saved) {
                const savedProfile = RAN.storage.getProfile(this.lastSaveResult.administration.studentId);
                return el('div', { className: 'ran-save-section' }, [
                    el('h2', { textContent: 'Αποθήκευση στο ιστορικό' }),
                    el('p', { className: 'ran-status-line', textContent: `Αποθηκεύτηκε στο προφίλ: ${savedProfile ? savedProfile.displayLabel : '—'}` }),
                    el('div', { className: 'ran-actions' }, [
                        el('button', {
                            className: 'ran-btn ran-btn-secondary',
                            textContent: 'Προβολή ιστορικού →',
                            onClick: () => {
                                this.viewingProfileId = this.lastSaveResult.administration.studentId;
                                this.navigate('profileHistory');
                            },
                        }),
                    ]),
                ]);
            }

            if (!RAN.storage.isAvailable()) {
                return el('div', { className: 'ran-save-section' }, [
                    el('h2', { textContent: 'Αποθήκευση στο ιστορικό' }),
                    el('p', { className: 'ran-status-line', textContent: 'Η τοπική αποθήκευση δεν είναι διαθέσιμη σε αυτόν τον browser — η εγγραφή δεν μπορεί να αποθηκευτεί σε προφίλ.' }),
                ]);
            }

            const failedProblems = (this.lastSaveResult && !this.lastSaveResult.saved) ? this.lastSaveResult.problems : null;

            const profiles = RAN.storage.listProfiles();
            const NEW_PROFILE_VALUE = '__new__';
            const select = el('select', { id: 'ran-save-profile-select' }, [
                ...profiles.map(p => el('option', { value: p.profileId, textContent: p.displayLabel })),
                el('option', { value: NEW_PROFILE_VALUE, textContent: '+ Νέο προφίλ' }),
            ]);
            if (profiles.length === 0) select.value = NEW_PROFILE_VALUE;

            const newProfileInput = el('input', { id: 'ran-save-new-profile-name', type: 'text', value: RAN.storage.suggestNextDisplayLabel() });
            const newProfileField = el('div', { className: 'ran-form-field' }, [
                el('label', { for: 'ran-save-new-profile-name', textContent: 'Όνομα νέου προφίλ' }),
                newProfileInput,
            ]);
            newProfileField.style.display = select.value === NEW_PROFILE_VALUE ? 'block' : 'none';
            select.addEventListener('change', () => {
                newProfileField.style.display = select.value === NEW_PROFILE_VALUE ? 'block' : 'none';
            });

            return el('div', { className: 'ran-save-section' }, [
                el('h2', { textContent: 'Αποθήκευση στο ιστορικό' }),
                el('p', { className: 'ran-status-line', textContent: RAN.wording.storageWarning }),
                failedProblems ? el('div', { className: 'ran-validation-problems' }, [
                    el('p', { textContent: 'Η αποθήκευση απέτυχε:' }),
                    el('ul', {}, failedProblems.map(p => el('li', { textContent: p }))),
                ]) : null,
                el('div', { className: 'ran-form-field' }, [
                    el('label', { for: 'ran-save-profile-select', textContent: 'Προφίλ' }),
                    select,
                ]),
                newProfileField,
                el('div', { className: 'ran-actions' }, [
                    el('button', {
                        className: 'ran-btn ran-btn-primary',
                        textContent: 'Αποθήκευση Αποτελέσματος',
                        onClick: () => {
                            let profileId = select.value;
                            if (profileId === NEW_PROFILE_VALUE) {
                                profileId = RAN.storage.createProfile(newProfileInput.value).profileId;
                            }
                            this.lastSaveResult = RAN.storage.saveAdministration(profileId, admin);
                            this.navigate('results');
                        },
                    }),
                ]),
            ]);
        },

        /* ===========================================
           RESULTS — Phase 4 (persistence added in Phase 5). Descriptive
           results only: completion time, independentCorrect, substitutions,
           omissions, repetitions, selfCorrections, examinerRedirects,
           sequenceLoss/procedural status, a descriptive naming-rate
           indicator, clear status/validity presentation, the scientific
           disclaimer, and an optional save-to-profile section. No
           longitudinal comparison beyond Phase 5's simple previous-vs-
           current block (that lives on the History screen, not here),
           no Graph, no norms/percentiles/risk classification/diagnostic
           interpretation. For INVALID/INCOMPLETE/PREPARATION_FAILED, no
           naming rate is shown, only the reason.
           =========================================== */
        renderResults() {
            const record = this.timedRecord;
            if (!record) { this.navigate('assessmentSelect'); return; }
            const admin = record.administration;
            const results = RAN.calcResults(admin);

            const STATUS_PRESENTATION = {
                [RAN.STATUS.COMPLETED]: { cls: 'ran-status-banner-ok', icon: '✓', title: 'Ολοκληρώθηκε', note: 'Η δοκιμασία ολοκληρώθηκε χωρίς διαδικαστική επισήμανση.' },
                [RAN.STATUS.COMPLETED_FLAGGED]: { cls: 'ran-status-banner-flagged', icon: '⚠', title: 'Ολοκληρώθηκε — με σημείωση χορήγησης', note: 'Κατά τη χορήγηση καταγράφηκε τουλάχιστον μία παρέμβαση του εξεταστή ή απώλεια σειράς. Δείτε τα αναλυτικά δεδομένα για την ερμηνεία του αποτελέσματος.' },
                [RAN.STATUS.INCOMPLETE]: { cls: 'ran-status-banner-invalid', icon: '✕', title: 'Ημιτελής χορήγηση', note: 'Η χορήγηση δεν ολοκληρώθηκε.' },
                [RAN.STATUS.INVALID]: { cls: 'ran-status-banner-invalid', icon: '✕', title: 'Άκυρη χορήγηση', note: 'Η χορήγηση δεν θεωρείται έγκυρη.' },
                [RAN.STATUS.PREPARATION_FAILED]: { cls: 'ran-status-banner-invalid', icon: '✕', title: 'Δεν πραγματοποιήθηκε χρονομετρούμενη δοκιμασία', note: 'Η προετοιμασία δεν ολοκληρώθηκε επιτυχώς.' },
            }[admin.status];

            const reasonLine = admin.incompleteReason
                ? el('p', { className: 'ran-status-line', textContent: 'Αιτία: ' + RAN.wording.incompleteReasonLabels[admin.incompleteReason] })
                : admin.invalidReason
                    ? el('p', { className: 'ran-status-line', textContent: 'Αιτία: ' + RAN.wording.invalidReasonLabels[admin.invalidReason] })
                    : null;

            const primaryMetric = results.completionTimeSec != null
                ? el('div', { className: 'ran-metric-primary' }, [
                    el('div', { className: 'ran-metric-primary-value', textContent: `${fmtNum(results.completionTimeSec, 2)} sec` }),
                    el('div', { className: 'ran-metric-primary-label', textContent: 'Χρόνος ολοκλήρωσης' }),
                ])
                : null;

            const secondaryMetrics = results.rateEligible
                ? el('div', { className: 'ran-metrics-secondary' }, [
                    el('div', { className: 'ran-metric-card' }, [
                        el('div', { className: 'ran-metric-card-value', textContent: `${results.independentCorrect} / ${results.totalStimuli}` }),
                        el('div', { className: 'ran-metric-card-label', textContent: 'Ανεξάρτητα σωστές κατονομασίες' }),
                    ]),
                    el('div', { className: 'ran-metric-card', title: 'σωστές ανεξάρτητες κατονομασίες/sec' }, [
                        el('div', { className: 'ran-metric-card-value', textContent: `${fmtNum(results.independentNamingRate, 2)}/sec` }),
                        el('div', { className: 'ran-metric-card-label', textContent: 'Περιγραφικός ρυθμός ανεξάρτητης κατονομασίας' }),
                    ]),
                ])
                : el('p', { className: 'ran-status-line', textContent: 'Δεν υπολογίζεται δείκτης ταχύτητας κατονομασίας για αυτή τη χορήγηση.' });

            // Scientific Protocol Correction decision §7: short helper
            // descriptions for the item-error/procedural terms, shown as
            // native tooltips on the term (<dt title="...">) — descriptive
            // only, not a new visible UI element.
            const dlEntries = [
                ['Χρόνος ολοκλήρωσης (δευτ.)', results.completionTimeSec != null ? fmtNum(results.completionTimeSec, 2) : '—'],
                ['Ανεξάρτητα σωστές κατονομασίες', results.independentCorrect != null ? results.independentCorrect : '—'],
                ['Σύνολο ερεθισμάτων', results.totalStimuli],
                ['Αντικαταστάσεις', results.substitutions, 'Λανθασμένες κατονομασίες που δεν αυτοδιορθώθηκαν.'],
                ['Παραλείψεις', results.omissions, 'Ερεθίσματα που προσπεράστηκαν χωρίς κατονομασία.'],
                ['Επαναλήψεις', results.repetitions, 'Επαναλαμβανόμενες αποκρίσεις/κατονομασίες.'],
                ['Αυτοδιορθώσεις', results.selfCorrections, 'Αρχικά λανθασμένες αποκρίσεις που το παιδί διόρθωσε αυθόρμητα χωρίς βοήθεια.'],
                ['Δόθηκε απάντηση', results.examinerProvidedAnswers, 'Περιπτώσεις στις οποίες, μετά από περίπου 3\'\' χωρίς απόκριση, ο εξεταστής έδωσε το όνομα του ερεθίσματος για να συνεχιστεί η διαδικασία.'],
                ['Επαναφορές εξεταστή', results.examinerRedirects],
                ['Απώλεια σειράς', results.sequenceLoss ? 'Ναι' : 'Όχι'],
            ];
            const dl = el('dl', {}, dlEntries.flatMap(([term, value, helpText]) => [
                el('dt', helpText ? { textContent: term, title: helpText } : { textContent: term }),
                el('dd', { textContent: String(value) }),
            ]));

            const screen = el('div', { className: 'ran-screen' }, [
                renderStepper('results'),
                el('h1', { textContent: RESULTS_TITLE[admin.assessmentId] || 'Αποτελέσματα' }),
                el('p', { className: 'ran-status-line', textContent: `Μορφή ${admin.form}` }),
                el('div', { className: `ran-status-banner ${STATUS_PRESENTATION.cls}` }, [
                    el('span', { className: 'ran-status-banner-icon', textContent: STATUS_PRESENTATION.icon }),
                    el('div', {}, [
                        el('h2', { textContent: STATUS_PRESENTATION.title }),
                        el('p', { textContent: STATUS_PRESENTATION.note }),
                    ]),
                ]),
                reasonLine,
                primaryMetric,
                secondaryMetrics,
                el('div', { className: 'ran-record-summary' }, [
                    el('h2', { textContent: 'Αναλυτικά δεδομένα' }),
                    dl,
                ]),
                el('div', { className: 'ran-disclaimer', textContent: RAN.wording.scientificDisclaimer }),
                this.renderSaveSection(admin),
                el('div', { className: 'ran-actions' }, [
                    el('button', {
                        className: 'ran-btn ran-btn-secondary',
                        textContent: '← Νέα Χορήγηση',
                        onClick: () => {
                            this.session = null;
                            this.timedDraft = null;
                            this.timedRun = null;
                            this.timedRecord = null;
                            this.lastSaveResult = null;
                            this.navigate('assessmentSelect');
                        },
                    }),
                ]),
            ]);
            this.container.appendChild(screen);
        },

        /* ===========================================
           PROFILES — Phase 5. Local profile list/creation and the
           export/import controls. Minimal profile: generated
           profileId + displayLabel (a code/nickname, never a real
           name) — no other demographic data.
           =========================================== */
        renderProfiles() {
            const available = RAN.storage.isAvailable();

            const body = [];
            body.push(el('div', { className: 'ran-actions ran-actions-top' }, [
                el('button', { className: 'ran-btn ran-btn-secondary', textContent: '← Αρχική', onClick: () => this.navigate('assessmentSelect') }),
            ]));
            body.push(el('div', { className: 'ran-hero' }, [
                renderBlob('dot', { top: '-6px', right: '8px' }),
                el('img', { className: 'ran-brand-logo ran-brand-logo-small', src: 'assets/brand/logo.png', alt: 'Learning Fast' }),
                el('h1', { textContent: 'Προφίλ & Ιστορικό' }),
            ]));
            body.push(el('div', { className: 'ran-info-card', textContent: RAN.wording.storageWarning }));

            if (!available) {
                body.push(el('div', { className: 'ran-disclaimer', textContent: 'Η τοπική αποθήκευση δεν είναι διαθέσιμη σε αυτόν τον browser σε αυτή τη στιγμή.' }));
                this.container.appendChild(el('div', { className: 'ran-screen' }, body));
                return;
            }

            const profiles = RAN.storage.listProfiles();
            body.push(el('h2', { textContent: 'Προφίλ' }));
            if (profiles.length === 0) {
                body.push(el('p', { className: 'ran-status-line', textContent: 'Δεν υπάρχουν ακόμη τοπικά προφίλ.' }));
            } else {
                body.push(el('div', { className: 'ran-profile-list' }, profiles.map(p => el('div', { className: 'ran-profile-row' }, [
                    el('div', {}, [
                        el('div', { className: 'ran-profile-label', textContent: p.displayLabel }),
                        el('div', { className: 'ran-profile-meta', textContent: p.createdAt ? `Δημιουργήθηκε: ${p.createdAt.slice(0, 10)}` : '' }),
                    ]),
                    el('button', {
                        className: 'ran-btn ran-btn-secondary',
                        textContent: 'Προβολή ιστορικού →',
                        onClick: () => { this.viewingProfileId = p.profileId; this.navigate('profileHistory'); },
                    }),
                ]))));
            }

            const newLabelInput = el('input', { id: 'ran-new-profile-name', type: 'text', value: RAN.storage.suggestNextDisplayLabel() });
            body.push(el('div', { className: 'ran-form-field' }, [
                el('label', { for: 'ran-new-profile-name', textContent: '+ Νέο προφίλ' }),
                newLabelInput,
                el('div', { className: 'ran-actions' }, [
                    el('button', {
                        className: 'ran-btn ran-btn-secondary',
                        textContent: 'Δημιουργία',
                        onClick: () => { RAN.storage.createProfile(newLabelInput.value); this.navigate('profiles'); },
                    }),
                ]),
            ]));

            const exportBtn = el('button', {
                className: 'ran-btn ran-btn-secondary',
                textContent: 'Εξαγωγή',
                onClick: () => {
                    const dump = RAN.storage.exportAll();
                    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = el('a', { href: url, download: `ran-export-${new Date().toISOString().slice(0, 10)}.json` });
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                },
            });

            // Accessibility fix: `display:none` removed this native
            // file input from the tab order entirely, making Import
            // mouse-only. Visually-hidden (not display:none) keeps it a
            // real, natively focusable/keyboard-operable control — a
            // focused native file input already opens its picker on
            // Enter/Space, so no custom keyboard handling is needed;
            // the wrapping <label> keeps giving it a styled button look.
            const importInput = el('input', {
                type: 'file',
                accept: 'application/json',
                className: 'ran-visually-hidden',
                onChange: (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                        let reportText;
                        try {
                            const data = JSON.parse(reader.result);
                            const report = RAN.storage.importAll(data);
                            const skipped = [...report.skippedProfiles, ...report.skippedAdministrations];
                            reportText =
                                `Εισήχθησαν ${report.importedProfiles.length} προφίλ και ${report.importedAdministrations.length} εγγραφές. `
                                + `Απορρίφθηκαν ${report.skippedProfiles.length} προφίλ και ${report.skippedAdministrations.length} εγγραφές.`
                                + (skipped.length ? ' Αιτίες: ' + skipped.map(s => s.reason).join('· ') : '');
                        } catch (err) {
                            reportText = 'Η εισαγωγή απέτυχε: ' + err.message;
                        }
                        this.lastImportReport = reportText;
                        this.navigate('profiles');
                    };
                    reader.readAsText(file);
                },
            });
            const importLabel = el('label', { className: 'ran-btn ran-btn-secondary' }, [
                document.createTextNode('Εισαγωγή'),
                importInput,
            ]);
            body.push(el('div', { className: 'ran-backup-section' }, [
                el('h2', { textContent: 'Αντίγραφο ασφαλείας' }),
                el('p', { className: 'ran-field-hint', textContent: 'Προαιρετική εξαγωγή/εισαγωγή δεδομένων ως αρχείο. Δεν πραγματοποιείται καμία αυτόματη μεταφόρτωση (cloud upload).' }),
                el('div', { className: 'ran-actions' }, [exportBtn, importLabel]),
                el('p', { className: 'ran-status-line', textContent: this.lastImportReport || '' }),
            ]));

            this.container.appendChild(el('div', { className: 'ran-screen' }, body));
        },

        /* ===========================================
           PROFILE HISTORY — Phase 5. Per-assessment-type history
           (never a combined/overall RAN total), plus a simple
           descriptive previous-vs-current comparison when at least two
           rate-eligible same-version completed administrations exist.
           =========================================== */
        renderProfileHistory() {
            const profile = RAN.storage.getProfile(this.viewingProfileId);
            if (!profile) { this.navigate('profiles'); return; }

            const renameInput = el('input', { id: 'ran-rename-profile', type: 'text', value: profile.displayLabel });

            const body = [
                el('h1', { textContent: profile.displayLabel }),
                el('div', { className: 'ran-info-card', textContent: RAN.wording.storageWarning }),
                el('div', { className: 'ran-form-field' }, [
                    el('label', { for: 'ran-rename-profile', textContent: 'Μετονομασία προφίλ' }),
                    renameInput,
                    el('div', { className: 'ran-actions' }, [
                        el('button', {
                            className: 'ran-btn ran-btn-secondary',
                            textContent: 'Αποθήκευση Ονόματος',
                            onClick: () => { RAN.storage.renameProfile(profile.profileId, renameInput.value); this.navigate('profileHistory'); },
                        }),
                    ]),
                ]),
            ];

            const administrations = RAN.storage.listAdministrations(profile.profileId);

            Object.keys(ASSESSMENT_LABELS).forEach(assessmentId => {
                const rows = administrations.filter(a => a.assessmentId === assessmentId);
                body.push(el('h2', { textContent: `RAN ${ASSESSMENT_LABELS[assessmentId]}` }));
                if (rows.length === 0) {
                    body.push(el('p', { className: 'ran-status-line', textContent: 'Καμία καταγεγραμμένη χορήγηση.' }));
                    return;
                }

                const sortedByDate = rows.slice().sort((a, b) => (a.dateISO || '').localeCompare(b.dateISO || ''));
                const latest = sortedByDate[sortedByDate.length - 1];
                if (latest.durationMs != null) {
                    body.push(el('div', { className: 'ran-metric-latest' }, [
                        el('div', { className: 'ran-metric-latest-value', textContent: `${fmtNum(latest.durationMs / 1000, 2)} sec` }),
                        el('div', { className: 'ran-metric-latest-label', textContent: 'Τελευταία χορήγηση' }),
                    ]));
                }

                // Phase 6 — Longitudinal Graph. Grouped by assessment
                // VERSION so a future RAN_DIGITS_V2 is never connected
                // into the same line as V1 (spec §8) — one graph
                // section per version that has >=3 comparable (same
                // profile+assessmentId+version), graph-eligible
                // (COMPLETED/COMPLETED_FLAGGED only) administrations.
                // Form A/B may share one graph (spec §9) — only the
                // version is a hard split. Below the 3-point minimum,
                // no graph is shown for that version at all (the table
                // further below is unaffected and always complete).
                const byVersion = new Map();
                rows.forEach(a => {
                    if (!byVersion.has(a.assessmentVersion)) byVersion.set(a.assessmentVersion, []);
                    byVersion.get(a.assessmentVersion).push(a);
                });
                Array.from(byVersion.keys()).sort((a, b) => a - b).forEach(version => {
                    const eligiblePoints = byVersion.get(version)
                        .filter(isGraphEligible)
                        .slice()
                        .sort((a, b) => (a.dateISO || '').localeCompare(b.dateISO || ''))
                        .map(a => ({ dateISO: a.dateISO, durationSec: a.durationMs / 1000, form: a.form, status: a.status }));
                    if (eligiblePoints.length >= 3) {
                        const versionCount = byVersion.size;
                        const heading = `RAN ${ASSESSMENT_LABELS[assessmentId]}${versionCount > 1 ? ` — Έκδοση ${version}` : ''}`;
                        body.push(buildLongitudinalGraph(eligiblePoints, heading));
                    }
                });

                const table = el('table', { className: 'ran-history-table' }, [
                    el('thead', {}, [el('tr', {}, [
                        el('th', { textContent: 'Ημερομηνία' }),
                        el('th', { textContent: 'Έκδοση' }),
                        el('th', { textContent: 'Μορφή' }),
                        el('th', { textContent: 'Χρόνος (δευτ.)' }),
                        el('th', { textContent: 'Ανεξάρτητα σωστά' }),
                        el('th', { textContent: 'Κατάσταση' }),
                    ])]),
                    el('tbody', {}, rows.map(a => el('tr', {}, [
                        el('td', { 'data-label': 'Ημερομηνία', textContent: formatDateDDMMYYYY(a.dateISO) }),
                        el('td', { 'data-label': 'Έκδοση', textContent: String(a.assessmentVersion) }),
                        el('td', { 'data-label': 'Μορφή', textContent: a.form }),
                        el('td', { 'data-label': 'Χρόνος (δευτ.)', textContent: a.durationMs != null ? fmtNum(a.durationMs / 1000, 2) : '—' }),
                        el('td', { 'data-label': 'Ανεξάρτητα σωστά', textContent: a.independentCorrect != null ? String(a.independentCorrect) : '—' }),
                        el('td', { 'data-label': 'Κατάσταση', textContent: HISTORY_STATUS_LABELS[a.status] || a.status }),
                    ]))),
                ]);
                body.push(table);

                const eligible = rows.filter(a => RAN.calcResults(a).rateEligible && a.assessmentVersion === rows[rows.length - 1].assessmentVersion);
                if (eligible.length >= 2) {
                    const sorted = eligible.slice().sort((a, b) => (a.dateISO || '').localeCompare(b.dateISO || ''));
                    const previous = sorted[sorted.length - 2];
                    const current = sorted[sorted.length - 1];
                    // A/B longitudinal policy (locked): a numerical time
                    // comparison is only ever shown between the two most
                    // recent rate-eligible same-version administrations
                    // WHEN THEY ALSO SHARE THE SAME FORM — Form A and
                    // Form B have no documented psychometric equivalence,
                    // so a cross-form delta would misleadingly read as a
                    // direct measurement of change. Deliberately no
                    // fallback to an older same-form pair if the two most
                    // recent differ — that would silently substitute a
                    // non-adjacent comparison without saying so.
                    if (previous.form === current.form) {
                        const diff = RAN.calcTimeDifference(previous.durationMs, current.durationMs);
                        if (diff) {
                            // Deliberately no color-coding for faster/slower —
                            // a descriptive difference, not a normative
                            // judgement (Phase 5.5 §24, reaffirmed in the
                            // Results/History presentation pass). The wording
                            // itself (comparisonLine/comparisonNote) is
                            // RAN.wording.formatTimeComparison's own locked/
                            // tested output, rendered verbatim — the note is
                            // always shown alongside the line, never omitted.
                            const labels = RAN.wording.formatTimeComparison(diff.deltaSec, diff.percentChange);
                            body.push(el('p', { className: 'ran-comparison-line', textContent: labels.comparisonLine }));
                            body.push(el('p', { className: 'ran-comparison-note', textContent: labels.comparisonNote }));
                        }
                    } else {
                        body.push(el('p', { className: 'ran-comparison-line ran-comparison-unavailable', textContent: RAN.wording.timeComparisonFormMismatch }));
                    }
                }
            });

            body.push(el('div', { className: 'ran-actions' }, [
                el('button', { className: 'ran-btn ran-btn-secondary', textContent: '← Πίσω στα Προφίλ', onClick: () => this.navigate('profiles') }),
            ]));

            this.container.appendChild(el('div', { className: 'ran-screen' }, body));
        },
    };
})();
