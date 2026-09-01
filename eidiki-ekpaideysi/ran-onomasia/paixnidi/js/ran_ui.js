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
        RAN_DIGITS_V2: 'Αριθμοί',
        RAN_COLORS_V2: 'Χρώματα',
        RAN_OBJECTS_V2: 'Αντικείμενα',
    };

    // Grade proposal — fixed display order for the grade <select>
    // controls (Results save section, Profiles, Profile History).
    // Deliberately its own ordered array, not Object.keys(RAN.GRADE)
    // (property order isn't a locked contract) — Δημοτικού Α΄→ΣΤ΄,
    // then Γυμνασίου Α΄→Β΄, with the explicit "Άλλο" choice last.
    const GRADE_OPTION_ORDER = [
        RAN.GRADE.NIPIAGOGEIO,
        RAN.GRADE.A_DIMOTIKOU, RAN.GRADE.B_DIMOTIKOU, RAN.GRADE.G_DIMOTIKOU,
        RAN.GRADE.D_DIMOTIKOU, RAN.GRADE.E_DIMOTIKOU, RAN.GRADE.ST_DIMOTIKOU,
        RAN.GRADE.A_GYMNASIOU, RAN.GRADE.B_GYMNASIOU, RAN.GRADE.G_GYMNASIOU,
        RAN.GRADE.OTHER_UNSPECIFIED,
    ];
    const GRADE_UNSET_VALUE = '__unset__';

    /** Builds a grade <select> — blank/"not set" option plus every
     * RAN.GRADE value in GRADE_OPTION_ORDER, real Greek labels via
     * RAN.wording.gradeLabels. The <select> can therefore never
     * produce anything other than a real RAN.GRADE value or "not set"
     * — the strict-write side of the grade data-flow is enforced
     * structurally here, at the UI layer, not just by
     * RAN.isValidGrade's storage-layer guard. `selected` is a
     * RAN.GRADE value or null/undefined (prefill). */
    function buildGradeSelect(idAttr, selected) {
        const options = [
            el('option', { value: GRADE_UNSET_VALUE, textContent: '— Χωρίς επιλογή —' }),
            ...GRADE_OPTION_ORDER.map(g => el('option', { value: g, textContent: RAN.wording.gradeLabels[g] })),
        ];
        const select = el('select', { id: idAttr }, options);
        select.value = (selected && GRADE_OPTION_ORDER.includes(selected)) ? selected : GRADE_UNSET_VALUE;
        return select;
    }
    /** Inverse of buildGradeSelect's value attribute: '__unset__' -> null. */
    function readGradeSelect(select) {
        return select.value === GRADE_UNSET_VALUE ? null : select.value;
    }

    // Item 24: shown next to every profile naming/renaming field (new
    // profile in Profiles, new profile in the Results save section,
    // rename in Profile History). Deliberately only a hint, never a
    // technical restriction — displayLabel stays a plain free-text
    // field, nothing here validates/blocks/rewrites what's typed, and
    // no new personal-data field is introduced anywhere by this.
    const DATA_MINIMIZATION_HINT = 'Για την προστασία προσωπικών δεδομένων, προτιμήστε κωδικό ή ψευδώνυμο αντί για ονοματεπώνυμο.';
    function buildDataMinimizationHint() {
        return el('p', { className: 'ran-field-hint', textContent: DATA_MINIMIZATION_HINT });
    }

    // History status labels moved to RAN.wording.historyStatusLabels /
    // RAN.wording.resolveHistoryStatusLabel() — single source of truth,
    // Node-testable, and guarantees an unknown status can never leak
    // as raw enum text (see js/ran_wording.js).

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
        RAN_DIGITS_V2: 'RAN Αριθμών',
        RAN_COLORS_V2: 'RAN Χρωμάτων',
        RAN_OBJECTS_V2: 'RAN Αντικειμένων',
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

    // PASS 2 §2 — EXACT PAIR RULE. Classifies exactly the two
    // administrations handed in (already chosen as the two
    // chronologically LAST ones for one assessmentId by the caller) —
    // never searches for a different/older/better pair itself. Returns
    // one of:
    //   { kind: 'valid', diff, form }              — numeric comparison shown
    //   { kind: 'flagged' }                         — one or both COMPLETED_FLAGGED
    //   { kind: 'form-mismatch', previousForm, currentForm }
    //   { kind: 'ineligible' }                      — one or both not COMPLETED/COMPLETED_FLAGGED
    function classifyComparisonPair(previous, current) {
        if (!isGraphEligible(previous) || !isGraphEligible(current)) {
            return { kind: 'ineligible' };
        }
        if (previous.status === RAN.STATUS.COMPLETED_FLAGGED || current.status === RAN.STATUS.COMPLETED_FLAGGED) {
            return { kind: 'flagged' };
        }
        if (previous.form !== current.form) {
            return { kind: 'form-mismatch', previousForm: previous.form, currentForm: current.form };
        }
        const diff = RAN.calcTimeDifference(previous.durationMs, current.durationMs);
        if (!diff) return { kind: 'ineligible' };
        return { kind: 'valid', diff, form: current.form };
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
    // PASS 2 §7/§17: same calendar-day administrations get date+time
    // instead of date-only, so adjacent points never render identical
    // labels. Sliced directly out of the stored ISO string — same
    // convention as formatDateShort/formatDateDDMMYYYY above (both
    // already read the stored UTC-offset ISO string verbatim, never
    // converted to the viewer's local timezone) — so this stays
    // consistent with every other date label already on this screen,
    // not a new/divergent time-handling approach. No stored precision
    // is invented: dateISO already carries full time-of-day (confirmed
    // in the PASS 1 export audit), this only chooses when to display it.
    function formatDateTimeShort(iso) {
        if (!iso) return '—';
        const [, m, d] = iso.slice(0, 10).split('-');
        const hhmm = iso.slice(11, 16);
        return `${d}/${m} ${hhmm}`;
    }

    /**
     * Builds one longitudinal graph section for an already-filtered,
     * already-chronologically-sorted list of >=2 graph-eligible points
     * `{dateISO, durationSec, independentCorrect, totalStimuli, form,
     * status}` — all belonging to the SAME profile/assessmentId/
     * assessmentVersion (callers never mix versions or assessment
     * types into one call). No regression/trend/forecast/smoothing.
     * No normative bands/zones/targets. Y-axis starts at 0 and is
     * never inverted (PASS 1 lock: this scaling is unchanged from
     * before — only the layout/content around it changed in PASS 2).
     * COMPLETED_FLAGGED points use a distinct shape (diamond, not just
     * a color swap). PASS 2: COMPLETED_FLAGGED points are plotted like
     * any other point, but never bridged by a connecting line segment
     * and never one of the two points used for numeric comparison
     * (that restriction is enforced by the CALLER for comparison, and
     * by connectableSegment() below for line segments — this function
     * itself has no concept of "eligible for comparison").
     */
    function connectableSegment(a, b) {
        return a.status === RAN.STATUS.COMPLETED && b.status === RAN.STATUS.COMPLETED && a.form === b.form;
    }

    function buildLongitudinalGraph(points, headingText) {
        // PASS 2 §14: layout-only fix for the clipped Y-axis title —
        // more overall height/padding so the rotated axis title, the
        // per-point time+accuracy labels, and the x-axis labels all
        // have room, without touching yMin/yMax/tick math below (PASS 1
        // lock: domain/scaling formula is byte-for-byte the same).
        const width = 640, height = 320;
        const padLeft = 60, padRight = 24, padTop = 28, padBottom = 96;
        const plotW = width - padLeft - padRight;
        const plotH = height - padTop - padBottom;
        const n = points.length;

        const maxVal = Math.max.apply(null, points.map(p => p.durationSec));
        const yMax = Math.max(1, Math.ceil(maxVal * 1.15 * 10) / 10);
        const yMin = 0;
        // PASS 2 §14/§17 layout fix (visual QA finding): the leftmost
        // point used to sit exactly flush against the y-axis (xFor(0)
        // === padLeft) — harmless before PASS 2, but now that each
        // point carries its own text label (time + accuracy), a
        // leftmost point whose value happens to land near a gridline
        // visually collided with that gridline's tick label. Insetting
        // the DATA points only (grid/axis lines still span the full
        // plotW, unaffected) gives every point's own label breathing
        // room from both edges — purely a pixel-layout change, the
        // yFor()/domain math above is untouched.
        const pointInsetX = 28;
        const xFor = (i) => padLeft + pointInsetX + (n === 1 ? (plotW - pointInsetX * 2) / 2 : (i / (n - 1)) * (plotW - pointInsetX * 2));
        const yFor = (v) => padTop + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

        const gridAndYLabels = [];
        // Item 5 (nice-number Y-axis ticks): presentation-only — chosen
        // independently from the yMin/yMax/point-position math above
        // (all untouched, PASS 1 lock still holds). Previously ticks
        // were 4 equal fractions of yMax (0%, 25%, 50%, 75%, 100%),
        // which produced mathematically-correct but visually ugly
        // values like 7,5/22,6 whenever yMax itself wasn't round.
        // Standard 1/2/5 x 10^n "nice step" algorithm instead: pick the
        // step from that family closest to yMax/targetTickCount, then
        // emit every multiple of it from yMin (always 0) up to the
        // largest one that still fits inside the existing domain — so
        // the top tick can never land above yMax and clip against the
        // padded plot area. fmtNum(val, 1) still does the actual label
        // rounding/formatting, unchanged from before.
        const targetTickCount = 4;
        const rawStep = (yMax - yMin) / targetTickCount;
        const stepMagnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const stepNormalized = rawStep / stepMagnitude;
        const niceStepNormalized = stepNormalized <= 1 ? 1 : stepNormalized <= 2 ? 2 : stepNormalized <= 5 ? 5 : 10;
        const niceStep = niceStepNormalized * stepMagnitude;
        for (let val = yMin; val <= yMax + niceStep * 1e-6; val += niceStep) {
            const y = yFor(val);
            gridAndYLabels.push(svgEl('line', { x1: padLeft, y1: y, x2: width - padRight, y2: y, stroke: '#DCE4E8', 'stroke-width': 1 }));
            gridAndYLabels.push(svgEl('text', { x: padLeft - 8, y: y + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#57707A', textContent: fmtNum(val, 1) }));
        }

        // PASS 2 §7: same-calendar-day collision detection — if >=2
        // points share a calendar day, ALL points sharing that day get
        // a date+time x-axis label (not just those two), so no pair of
        // labels on this graph is ever ambiguous/identical.
        const dayCounts = {};
        points.forEach(p => {
            const day = (p.dateISO || '').slice(0, 10);
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        });
        const hasSameDayCollision = Object.keys(dayCounts).some(day => dayCounts[day] >= 2);

        // Thin X labels once there are more points than comfortably
        // fit — every point is still PLOTTED, only its text LABEL may
        // be skipped (never silently discard a data point itself).
        const maxLabels = 7;
        const labelEvery = Math.max(1, Math.ceil(n / maxLabels));
        const xLabels = [];
        points.forEach((p, i) => {
            if (i % labelEvery !== 0 && i !== n - 1) return;
            const day = (p.dateISO || '').slice(0, 10);
            const x = xFor(i);
            const y = height - padBottom + 44;
            xLabels.push(svgEl('text', {
                x, y, 'text-anchor': 'end', 'font-size': 10, fill: '#57707A',
                transform: `rotate(-35 ${x} ${y})`,
                textContent: dayCounts[day] >= 2 ? formatDateTimeShort(p.dateISO) : formatDateShort(p.dateISO),
            }));
        });

        // PASS 2 §5: line segments are no longer one continuous
        // polyline across every point — a segment is drawn ONLY
        // between two immediately-consecutive points that are both
        // COMPLETED (unflagged) and share the same Form. A → B → A
        // (or any flagged point in between) breaks the line on BOTH
        // sides; there is no "bridge over" the excluded point.
        const segments = [];
        for (let i = 1; i < n; i++) {
            if (connectableSegment(points[i - 1], points[i])) {
                segments.push(svgEl('line', {
                    x1: xFor(i - 1), y1: yFor(points[i - 1].durationSec),
                    x2: xFor(i), y2: yFor(points[i].durationSec),
                    stroke: '#3E6D8F', 'stroke-width': 2,
                }));
            }
        }

        // PASS 2 §6: on-chart per-point labels (time + accuracy) are
        // only rendered up to the same point-count where x-axis labels
        // stay unthinned (maxLabels) — beyond that, adjacent points are
        // too close together for two extra stacked lines of text to
        // stay legible, so they're omitted from the chart itself and
        // remain fully available via the marker's tooltip/aria-label
        // (accessible detail instead of overlapping text).
        const showInlineLabels = n <= maxLabels;

        const markers = [];
        // A/B longitudinal policy (locked): form (A/B) text labels are
        // kept in their own array, separate from `markers` — they must
        // NOT pick up the marker hover/focus/tooltip listeners wired up
        // below (they're pointer-events:none, purely visual annotation).
        const formLabels = [];
        const pointLabels = [];
        points.forEach((p, i) => {
            const cx = xFor(i), cy = yFor(p.durationSec);
            const isFlagged = p.status === RAN.STATUS.COMPLETED_FLAGGED;
            const statusText = isFlagged ? 'Ολοκληρώθηκε με διαδικαστική επισήμανση' : 'Ολοκληρώθηκε';
            const day = (p.dateISO || '').slice(0, 10);
            const dateLabel = dayCounts[day] >= 2 ? formatDateTimeShort(p.dateISO) : formatDateDDMMYYYY(p.dateISO);
            const accuracyText = (p.independentCorrect != null && p.totalStimuli != null)
                ? `${p.independentCorrect}/${p.totalStimuli}` : '—';
            // PASS 2 §6: full information (incl. accuracy, now added)
            // always lives in this accessible label — the tooltip and
            // aria-label/role="img" text, read by hover, focus, AND
            // screen readers regardless of whether the on-chart inline
            // labels are shown for this point count.
            const label = `${dateLabel} · ${fmtNum(p.durationSec, 2)} sec · ${accuracyText} · Μορφή ${p.form} · ${statusText}`;
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

            // PASS 2 §6: time + accuracy, NOT four metadata lines —
            // exactly these two, stacked below the marker. Never marker
            // size, never a second y-axis.
            if (showInlineLabels) {
                pointLabels.push(svgEl('text', {
                    x: cx, y: cy + (isFlagged ? 20 : 18),
                    'text-anchor': 'middle', 'font-size': 9, fill: '#2E3D46', 'pointer-events': 'none',
                    textContent: `${fmtNum(p.durationSec, 2)} sec`,
                }));
                pointLabels.push(svgEl('text', {
                    x: cx, y: cy + (isFlagged ? 31 : 29),
                    'text-anchor': 'middle', 'font-size': 9, fill: '#57707A', 'pointer-events': 'none',
                    textContent: accuracyText,
                }));
            }
        });

        const svg = svgEl('svg', {
            viewBox: `0 0 ${width} ${height}`,
            width: '100%',
            role: 'img',
            'aria-label': `${headingText} — γράφημα καταγεγραμμένων χορηγήσεων, ${n} χορηγήσεις`,
        }, [
            svgEl('title', { textContent: headingText }),
            svgEl('desc', { textContent: 'Κύκλος: χωρίς διαδικαστική επισήμανση. Ρόμβος: με διαδικαστική επισήμανση. Πλήρη στοιχεία κάθε σημείου μέσω εστίασης/hover.' }),
            ...gridAndYLabels,
            ...xLabels,
            ...segments,
            ...markers,
            ...formLabels,
            ...pointLabels,
        ]);
        svg.style.minWidth = Math.max(400, n * 70) + 'px';

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
            el('p', { className: 'ran-field-hint', textContent: RAN.wording.graphIntro }),
            // PASS 2 §7: shown once per graph, never attributing
            // causality, never proposing a minimum retest interval.
            hasSameDayCollision ? el('p', { className: 'ran-graph-same-day-warning', role: 'note', textContent: RAN.wording.sameDayWarning }) : null,
            el('div', { className: 'ran-graph-chart-row' }, [
                el('div', { className: 'ran-graph-y-axis-label', textContent: 'Χρόνος ολοκλήρωσης (sec)' }),
                svgWrap,
            ]),
            // PASS 2 §8: x-axis relabeled — points are equally spaced by
            // administration order, not by a continuous time scale; the
            // real dates/times remain available as point labels/context.
            el('div', { className: 'ran-graph-x-axis-label', textContent: 'Σειρά χορηγήσεων' }),
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
            // Layout-shift reduction: armed only inside
            // renderTimedMatrixPreStart() — same unconditional-clear
            // rule as ran-measurement-mode directly above, so it can
            // never leak onto any other screen either.
            document.body.classList.remove('ran-prestart-mode');
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
            // Item 17: same reasoning as the two guards above — the
            // Enter-to-finish shortcut is armed only inside
            // renderTimedRunning() and must never survive onto any
            // other screen (pre-start, error capture, results, etc.),
            // regardless of which path left timedRunning (Finish,
            // Abort, the resize/visibility auto-abort gates, or any
            // future/defensive navigation).
            if (this._finishKeyListener) {
                window.removeEventListener('keydown', this._finishKeyListener);
                this._finishKeyListener = null;
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
            // Item 25 (approved): digits get an additional class that
            // switches ONLY the font-family (Atkinson Hyperlegible) —
            // same tile size, font-size, font-weight, layout. Since
            // renderStimulus() is the one shared render path for
            // Familiarity, Practice, and the Timed matrix, this single
            // branch covers all three stages automatically, so the same
            // digit always looks the same everywhere it appears.
            return el('div', {
                className: 'ran-stimulus ran-stimulus-digit',
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
                        onClick: () => this.startPreparation(RAN.CURRENT_VERSIONS.digits),
                    }, [
                        el('div', { className: 'ran-assessment-motif' }, ['1', '2', '3'].map(d => el('span', { className: 'ran-assessment-motif-digit', textContent: d }))),
                        el('div', { className: 'ran-assessment-card-title', textContent: 'Αριθμοί' }),
                        el('div', { className: 'ran-assessment-card-desc', textContent: 'Ταχεία σειριακή κατονομασία γνωστών αριθμών.' }),
                        el('div', { className: 'ran-assessment-card-cta', textContent: 'Έναρξη δοκιμασίας →' }),
                    ]),
                    el('button', {
                        className: 'ran-assessment-card',
                        onClick: () => this.startPreparation(RAN.CURRENT_VERSIONS.colors),
                    }, [
                        el('div', { className: 'ran-assessment-motif' }, ['#dc2626', '#2563eb', '#16a34a', '#eab308', '#111827'].map(c => el('span', { className: 'ran-assessment-motif-dot', style: { background: c } }))),
                        el('div', { className: 'ran-assessment-card-title', textContent: 'Χρώματα' }),
                        el('div', { className: 'ran-assessment-card-desc', textContent: 'Ταχεία σειριακή κατονομασία γνωστών χρωμάτων.' }),
                        el('div', { className: 'ran-assessment-card-cta', textContent: 'Έναρξη δοκιμασίας →' }),
                    ]),
                    el('button', {
                        className: 'ran-assessment-card',
                        onClick: () => this.startPreparation(RAN.CURRENT_VERSIONS.objects),
                    }, [
                        el('div', { className: 'ran-assessment-motif' }, RAN.getDefinition(RAN.CURRENT_VERSIONS.objects).stimuli.slice(0, 3).map(id => el('img', {
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
                            // Item 18 wording correction: neutral, does
                            // not presuppose or imply any interpretation
                            // of change/progress — purely describes what
                            // the screen shows (a history list).
                            el('div', { className: 'ran-assessment-card-desc', textContent: 'Δείτε το ιστορικό χορηγήσεων κάθε μαθητή.' }),
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
                // Item 26: examiner-facing only (an "eyebrow" reminder,
                // never a line the examiner says to the child, unlike
                // the "Πείτε στο παιδί" block right below it), shown
                // only for the Colors type — dispatches on the
                // definition's own `type` field so it applies to
                // RAN_COLORS_V1 and RAN_COLORS_V2 alike, matching the
                // rest of this file's type-based (not hardcoded-ID)
                // dispatch convention. Purely a reminder to confirm via
                // the existing Familiarity gate — no new screening/
                // diagnosis/risk-classification mechanism is added; the
                // gate itself (Γνωστό/Δυσκολία -> pass/fail) is
                // completely unchanged.
                definition.type === 'colors'
                    ? el('div', { className: 'ran-examiner-instruction ran-colorvision-reminder' }, [
                        el('div', { className: 'ran-eyebrow', textContent: 'Σημείωση εξεταστή:' }),
                        el('p', { textContent: RAN.wording.colorVisionReminder }),
                    ])
                    : null,
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
                // Item 16 wording correction: "Επανεξοικείωση και
                // επανέλεγχος" — same underlying transition as before
                // (repeatFamiliarityCheck: resets every mark, returns to
                // a fresh untimed FAMILIARITY state; if the examiner
                // re-presents the stimuli and the child now names them
                // all correctly, this naturally re-passes and continues
                // to Practice as normal).
                actions.push(el('button', {
                    className: 'ran-btn ran-btn-primary',
                    textContent: 'Επανεξοικείωση και επανέλεγχος',
                    onClick: () => {
                        this.session = P.repeatFamiliarityCheck(this.session);
                        this.familiarityIndex = 0;
                        this.navigate('familiarity');
                    },
                }));
            }
            actions.push(el('button', {
                className: 'ran-btn ran-btn-danger',
                // Item 16 wording correction: "Διακοπή χορήγησης" — same
                // endPreparation() transition as before (terminal, no
                // timed RAN result). Shared by both failure reasons
                // (Familiarity and serial-procedure), and accurate for
                // both: neither case reaches a timed administration.
                textContent: 'Διακοπή χορήγησης',
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
                el('div', { className: 'ran-actions' }, actions),
            ]);
            this.container.appendChild(screen);
        },

        renderPreparationEnded() {
            const session = this.session;
            const endedReasonHeading = (session.failureReason === RAN.PREPARATION_FAILURE_REASON.FAMILIARITY_NOT_ESTABLISHED
                ? RAN.wording.familiarityFailed
                : RAN.wording.serialProcedureFailed).heading;
            const screen = el('div', { className: 'ran-screen' }, [
                el('h1', { textContent: 'Η προετοιμασία τερματίστηκε' }),
                el('p', { textContent: `Δοκιμασία: ${ASSESSMENT_LABELS[session.assessmentId]}. Δεν πραγματοποιήθηκε χρονομετρούμενη δοκιμασία.` }),
                el('p', { className: 'ran-status-line', textContent: endedReasonHeading }),
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

            // Layout-shift reduction: this screen now shares the SAME
            // #ran-app sizing (max-width/padding) that timedRunning's
            // own Measurement Mode uses — see body.ran-prestart-mode in
            // ran.css, a dedicated class deliberately kept separate
            // from ran-measurement-mode (that one still means "a timed
            // run is actually in progress"; nothing here changes what
            // that flag means or when it's set). Cleared centrally in
            // navigate() exactly like ran-measurement-mode already is.
            document.body.classList.add('ran-prestart-mode');

            // Pre-exposure fix, hardened: this screen must NEVER read
            // definition.forms[draft.form] (the actual Form A/B stimulus
            // sequence) — confirmed unchanged, still never touched here.
            // A previous version of this screen rendered 20 neutral
            // "masked" tiles in the real 4x5 row/column layout — that
            // still revealed the grid shape, row/column count, and each
            // individual stimulus position (and therefore the scan
            // path) even though the stimulus IDENTITY was hidden. This
            // version renders NO sub-structure at all: one single,
            // undifferentiated placeholder box, sized to exactly the
            // pixel footprint the real matrix will occupy (5 stimulus
            // tiles + 4 column gaps wide, 4 stimulus tiles + 3 row gaps
            // tall — the same constants .ran-stimulus/.ran-stimulus-row/
            // .ran-timed-matrix already use, see .ran-prestart-placeholder
            // in ran.css for the exact derivation), so the real array
            // appears in exactly this reserved space at Start with zero
            // resize/reflow — but reveals nothing about rows, columns,
            // or individual positions before that.
            const placeholder = el('div', { className: 'ran-prestart-placeholder', 'aria-hidden': 'true' });

            // Layout-shift reduction (measured finding: the placeholder
            // was landing 87px right / 185px above where the real
            // matrix appears post-Start, because this screen used a
            // single centered column while timedRunning uses a
            // matrix+toolbar two-column row under Measurement Mode's
            // narrower #ran-app). Reusing the EXACT same
            // .ran-timed-layout/.ran-measurement-matrix-wrap/.ran-toolbar
            // structure timedRunning itself uses means the placeholder
            // column is centered by the identical flex math the real
            // matrix will be, collapsing nearly all of that offset —
            // confirmed by re-measuring after this change (see the
            // round report). The examiner-facing stepper is dropped
            // from ONLY this one screen to fit the narrower toolbar
            // column (still shown on every other screen); nothing about
            // WHAT is shown changes — no real stimulus, no preview
            // sequence, still the same single neutral placeholder, same
            // locked preStartReminder text, same "Έναρξη" button/
            // onClick/onset-synchronization timing below.
            const screen = el('div', { className: 'ran-screen' }, [
                el('div', { className: 'ran-timed-layout' }, [
                    el('div', { className: 'ran-measurement-matrix-wrap' }, [
                        placeholder,
                    ]),
                    el('div', { className: 'ran-toolbar ran-prestart-toolbar' }, [
                        el('h1', { textContent: `${ASSESSMENT_LABELS[session.assessmentId]} — Μορφή ${draft.form}` }),
                        el('p', { className: 'ran-status-line', textContent: RAN.wording.preStartReminder }),
                        el('div', { className: 'ran-actions' }, [
                            el('button', {
                                className: 'ran-btn ran-btn-primary',
                                textContent: 'Έναρξη',
                                // Onset synchronization (locked): navigate() is a
                                // single synchronous call — renderTimedRunning()
                                // captures performance.now() as the start
                                // timestamp AND builds/appends the real stimulus
                                // matrix within that same synchronous call, before
                                // the browser gets a chance to paint anything in
                                // between. There is no separate "reveal" step and
                                // no intentional delay between the two — see the
                                // Timer/Render Safety Audit in the round report.
                                onClick: () => this.navigate('timedRunning'),
                            }),
                        ]),
                    ]),
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

            // Examiner-facing click confirmation fix: the earlier
            // "Student-facing live-counter fix" removed EVERY visible
            // acknowledgement for these three controls, leaving only a
            // screen-reader-only aria-live region — which reads as "the
            // button doesn't respond" to a sighted examiner, even though
            // run.sequenceLoss/examinerRedirects/examinerProvidedAnswers
            // were always updating correctly underneath. Each button now
            // gets its own small `<span aria-live="polite">` right next
            // to it — small/functional text only (never the old large
            // live counters), living entirely inside .ran-toolbar (the
            // already-established examiner-only column, side-by-side
            // with the child-facing matrix — see the layout correction
            // above) so it can never be mistaken for feedback shown to
            // the child. The span itself carries aria-live, so it is
            // simultaneously the sighted AND the screen-reader
            // acknowledgement — no separate hidden region needed.
            //
            // Deliberately two independent actions/variables (Phase 3
            // correction pass): sequenceLoss (boolean — was the serial
            // procedure lost at some point) and examinerRedirects
            // (integer — how many neutral redirects were given). They
            // often co-occur but one must never auto-set the other.
            const redirectAck = el('span', { className: 'ran-examiner-ack', 'aria-live': 'polite' });
            const redirectBtn = el('button', {
                className: 'ran-btn ran-btn-secondary',
                textContent: `Επαναφορά «${RAN.wording.neutralRedirect}»`,
                onClick: () => {
                    run.examinerRedirects += 1;
                    redirectAck.textContent = `Σύνολο: ${run.examinerRedirects}`;
                },
            });

            // sequenceLoss stays a one-way boolean exactly as before —
            // clicking more than once is harmless/idempotent (still just
            // `true`), so unlike an even-older version this button is
            // never disabled after use: a disabled/grayed-out button
            // sitting in the child-facing view would itself be a visible
            // success-state cue — but the small "Καταγράφηκε" ack text
            // below it (examiner-only column) is exactly the confirmation
            // an examiner needs without touching the button's own state.
            const sequenceLossAck = el('span', { className: 'ran-examiner-ack', 'aria-live': 'polite' });
            const sequenceLossBtn = el('button', {
                className: 'ran-btn ran-btn-secondary',
                textContent: 'Απώλεια σειράς',
                onClick: () => {
                    run.sequenceLoss = true;
                    sequenceLossAck.textContent = 'Καταγράφηκε';
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
            const answerAck = el('span', { className: 'ran-examiner-ack', 'aria-live': 'polite' });
            const answerGivenBtn = el('button', {
                className: 'ran-btn ran-btn-secondary',
                textContent: 'Δόθηκε απάντηση',
                onClick: () => {
                    run.examinerProvidedAnswers += 1;
                    answerAck.textContent = `Σύνολο: ${run.examinerProvidedAnswers}`;
                },
            });

            // Item 17: the button's onClick and the Enter-key shortcut
            // below are two INPUT PATHS into this exact same function —
            // never two separate finish implementations. finishTriggered
            // is the single-activation guard shared by both: whichever
            // path fires first (a real mouse click, or Enter) wins, and
            // the other becomes a no-op. This is purely an alternative
            // way to trigger the identical stopTimer()+navigate() call
            // the button always made — it does not reduce or eliminate
            // examiner reaction time, just offers a second input method.
            let finishTriggered = false;
            const finishTrial = () => {
                if (finishTriggered) return;
                finishTriggered = true;
                run.durationMs = stopTimer();
                this.navigate('timedErrorCapture');
            };
            const finishBtn = el('button', {
                className: 'ran-btn ran-btn-primary',
                textContent: 'Τέλος',
                onClick: finishTrial,
            });
            // Enter only (not Space, to reduce accidental activation —
            // Space is more likely to be hit incidentally, e.g. resting
            // a hand near the keyboard). e.repeat is the OS/browser's
            // own "this key is being held down" flag for auto-repeated
            // keydown events — always preventDefault (so a held Enter
            // never does anything ELSE by default either), but only
            // call finishTrial() on the first, non-repeat press; the
            // finishTriggered flag above is the second, independent
            // guard against a genuine double-activation (e.g. a race
            // with a mouse click). Attached only here, inside
            // renderTimedRunning(), and torn down centrally by
            // navigate() on every screen transition (see its own
            // comment) — so it is only ever live while this screen is
            // actually showing, never on pre-start/error-capture/
            // results/or any other screen.
            this._finishKeyListener = (e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                if (e.repeat) return;
                finishTrial();
            };
            window.addEventListener('keydown', this._finishKeyListener);

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

            // Item 3 (shared-screen hardening): on a single shared
            // monitor the child can see the live timer, the three
            // procedural buttons' ack text, and (per the original
            // request) the controls themselves. A toggle that visually
            // hid the BUTTONS too would force the examiner to aim at a
            // now-invisible click target mid-trial — a new interaction
            // risk the round's own audit rejected; a keyboard-shortcut
            // alternative for all three controls would be a much larger
            // surface (new global listeners, discoverability, conflict
            // checking) and was treated as a significant architectural
            // change, so it is reported only, not built here. This
            // toggle instead hides only the LIVE-VALUE elements a child
            // could read/react to — the timer's numeric readout and the
            // small ack counters — via `visibility:hidden` (keeps their
            // layout space, so nothing reflows/shifts). The buttons stay
            // fully visible and clickable at all times, and the toggle
            // button itself is never hidden, so the examiner can restore
            // visibility with one click. Purely a display-layer flag —
            // never read by stopTimer/finishTrial/scoring, never touches
            // run.startTime/rafId/examinerRedirects/sequenceLoss/
            // examinerProvidedAnswers, and the rAF tick() loop keeps
            // writing timerDisplay.textContent underneath regardless.
            let examinerElementsHidden = false;
            const visibilityToggleBtn = el('button', {
                className: 'ran-btn ran-btn-secondary ran-visibility-toggle-btn',
                textContent: 'Απόκρυψη στοιχείων εξεταστή',
                'aria-pressed': 'false',
                onClick: () => {
                    examinerElementsHidden = !examinerElementsHidden;
                    toolbarEl.classList.toggle('ran-examiner-elements-hidden', examinerElementsHidden);
                    visibilityToggleBtn.textContent = examinerElementsHidden ? 'Εμφάνιση στοιχείων εξεταστή' : 'Απόκρυψη στοιχείων εξεταστή';
                    visibilityToggleBtn.setAttribute('aria-pressed', String(examinerElementsHidden));
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
            const toolbarEl = el('div', { className: 'ran-toolbar' }, [
                visibilityToggleBtn,
                el('div', { className: 'ran-timer-panel' }, [timerDisplay, el('span', { className: 'ran-timer-label', textContent: 'χρόνος' })]),
                // Examiner-facing click confirmation fix: each
                // panel now carries its own small ack span right
                // next to the button (see the buttons' own
                // definitions above for why) — still no large
                // live counter, just enough for the examiner to
                // see the click actually registered.
                el('div', { className: 'ran-sequence-loss-panel' }, [sequenceLossBtn, sequenceLossAck]),
                el('div', { className: 'ran-redirect-panel' }, [redirectBtn, redirectAck]),
                el('div', { className: 'ran-answer-given-panel' }, [answerGivenBtn, answerAck]),
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
                // Item 17: discreet examiner-facing indication of
                // the alternative input path — never claims or
                // implies this removes/reduces reaction time.
                el('p', { className: 'ran-field-hint ran-finish-shortcut-hint', textContent: 'Enter: Τέλος' }),
            ]);
            const screen = el('div', { className: 'ran-screen' }, [
                el('div', { className: 'ran-timed-layout' }, [
                    el('div', { className: 'ran-measurement-matrix-wrap' }, [
                        el('div', { className: 'ran-timed-matrix' }, matrixRows),
                    ]),
                    toolbarEl,
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
                        familiarityRetriesUsed: session.familiarity.retriesUsed,
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
                    el('div', { className: 'ran-radio-group-heading ran-radio-group-heading-incomplete', textContent: 'Ημιτελής δοκιμασία' }),
                    ...incompleteRows,
                    // Item 9: a distinct modifier class only, so CSS can
                    // give the two categories a clear visual divider +
                    // separate accent color (never a new reason ID, never
                    // a wording/mapping/validation change — the category
                    // itself is still decided purely by radioRow's own
                    // `category` argument above).
                    el('div', { className: 'ran-radio-group-heading ran-radio-group-heading-invalid', textContent: 'Άκυρη δοκιμασία' }),
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
            const definition = RAN.getDefinition(session.assessmentId);

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
                // plusBtn/minusBtn additionally exposed (item 20) so the
                // primary-error-budget wiring below can attach its own
                // extra listeners without touching this shared helper's
                // own behavior — existing callers (selfCorr/reps) simply
                // never read these two extra properties.
                return { field, input, plusBtn, minusBtn };
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

            // Post-trial review/correction (item 15, locked): these
            // three were previously a READ-ONLY summary of whatever was
            // clicked live during timedRunning, with no way to fix a
            // mis-click after the fact. They are now editable HERE, at
            // this existing post-timing review stage — deliberately NOT
            // adding any +/- control to the live timedRunning screen
            // itself, which stays exactly as before (no extra cognitive
            // load during actual measurement). Pre-filled with the
            // live-recorded values from `run`; the submit handler below
            // compares the final (possibly edited) values against these
            // same `run.*` values to set examinerReviewAdjusted — never
            // free text, a single boolean audit marker. durationMs and
            // stimulusSequence are untouched by this review step: this
            // screen already reads run.durationMs read-only above (never
            // fed into any of these fields), and stimulusSequence comes
            // from the fixed definition/form, never from `run` at all.
            const redirects = stepperField('Επαναφορές εξεταστή', run.examinerRedirects);
            const answers = stepperField('Δόθηκε απάντηση', run.examinerProvidedAnswers);
            const seqLossYes = el('input', { type: 'radio', name: 'ran-review-sequence-loss', checked: run.sequenceLoss === true });
            const seqLossNo = el('input', { type: 'radio', name: 'ran-review-sequence-loss', checked: run.sequenceLoss !== true });
            const seqLossField = el('div', { className: 'ran-form-field ran-form-field-compact' }, [
                el('label', { textContent: 'Απώλεια σειράς' }),
                el('div', { className: 'ran-radio-group ran-radio-group-inline' }, [
                    el('label', {}, [seqLossYes, document.createTextNode(' Ναι')]),
                    el('label', {}, [seqLossNo, document.createTextNode(' Όχι')]),
                ]),
            ]);
            const proceduralSummary = el('div', { className: 'ran-card ran-procedural-summary' }, [
                el('h2', { textContent: 'Έλεγχος καταγεγραμμένων γεγονότων' }),
                el('p', { className: 'ran-field-hint', textContent: 'Οι τιμές είναι αυτές που καταγράφηκαν κατά τη χρονομέτρηση. Διόρθωσέ τις μόνο αν έγινε λάθος πάτημα — δεν επηρεάζουν τον χρόνο ή τη σειρά ερεθισμάτων.' }),
                answers.field, redirects.field, seqLossField,
            ]);

            const submitBtn = el('button', {
                className: 'ran-btn ran-btn-primary',
                textContent: 'Ολοκλήρωση Καταγραφής',
                onClick: () => {
                    const toInt = (input) => Math.max(0, parseInt(input.value, 10) || 0);
                    // Post-trial correction (item 15): the FINAL
                    // reviewed values (possibly edited here) are
                    // what the administration actually stores —
                    // never the raw `run.*` values directly.
                    // examinerReviewAdjusted is set iff at least
                    // one of these three differs from what was
                    // live-recorded — durationMs above still
                    // comes straight from `run.durationMs`,
                    // completely untouched by this comparison.
                    const finalRedirects = toInt(redirects.input);
                    const finalAnswers = toInt(answers.input);
                    const finalSequenceLoss = seqLossYes.checked;
                    const examinerReviewAdjusted = finalRedirects !== run.examinerRedirects
                        || finalAnswers !== run.examinerProvidedAnswers
                        || finalSequenceLoss !== run.sequenceLoss;
                    const result = RAN.timed.buildCompletedAdministration({
                        studentId: draft.studentId,
                        assessmentId: session.assessmentId,
                        form: draft.form,
                        durationMs: run.durationMs,
                        substitutions: toInt(subs.input),
                        omissions: toInt(omis.input),
                        repetitions: toInt(reps.input),
                        selfCorrections: toInt(selfCorr.input),
                        examinerRedirects: finalRedirects,
                        examinerProvidedAnswers: finalAnswers,
                        sequenceLoss: finalSequenceLoss,
                        examinerReviewAdjusted,
                        familiarityRetriesUsed: session.familiarity.retriesUsed,
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
            });

            // Item 20: UI-level prevention mirroring the engine's own
            // locked rule (RAN.validateAdministration: substitutions +
            // omissions + examinerProvidedAnswers must not exceed
            // totalStimuli) — NOT a second/different rule, just the same
            // one enforced earlier, at the controls themselves, so an
            // invalid combination is caught before submit rather than
            // only after. Deliberately scoped to exactly these three
            // mutually-exclusive primary-error fields — repetitions and
            // selfCorrections are separate descriptive counts (per spec,
            // never part of this sum) and are untouched by any of this.
            const toIntLive = (input) => Math.max(0, parseInt(input.value, 10) || 0);
            const errorBudgetMessage = el('p', { className: 'ran-error-budget-message', role: 'alert' });
            errorBudgetMessage.hidden = true;
            function recomputeErrorBudget() {
                const sum = toIntLive(subs.input) + toIntLive(omis.input) + toIntLive(answers.input);
                const overBudget = sum > definition.totalStimuli;
                errorBudgetMessage.textContent = overBudget
                    ? `Το άθροισμα Αντικαταστάσεων, Παραλείψεων και «Δόθηκε απάντηση» (${sum}) υπερβαίνει το σύνολο ερεθισμάτων (${definition.totalStimuli}). Διόρθωσε τις τιμές πριν συνεχίσεις.`
                    : '';
                errorBudgetMessage.hidden = !overBudget;
                submitBtn.disabled = overBudget;
                // Dynamic bound: once the three together already reach
                // the total, incrementing ANY of them further would
                // exceed it — so all three "+" buttons (not just the one
                // just clicked) are disabled together, and re-enabled the
                // moment any field is lowered enough to free up room.
                // Never blocks decrementing, and never touches selfCorr/
                // reps' own +/- buttons.
                const atBudget = sum >= definition.totalStimuli;
                [subs, omis, answers].forEach(f => { f.plusBtn.disabled = atBudget; });
            }
            [subs, omis, answers].forEach(f => {
                // 'input' catches live typing; the plus/minus buttons
                // mutate input.value programmatically (no native 'input'
                // event fires for that), so they need their own listener
                // — registered here, AFTER stepperField's own onClick
                // already ran and updated the value, so this always reads
                // the post-click value.
                f.input.addEventListener('input', recomputeErrorBudget);
                f.plusBtn.addEventListener('click', recomputeErrorBudget);
                f.minusBtn.addEventListener('click', recomputeErrorBudget);
            });

            const screen = el('div', { className: 'ran-screen ran-error-capture-screen' }, [
                renderStepper('timed'),
                // Item 19 wording correction: user-facing text only —
                // the screen key ('timedErrorCapture'), CSS class
                // (.ran-error-capture-screen), and every internal
                // identifier/comment referring to "Simple Mode" are
                // deliberately left untouched.
                el('h1', { textContent: 'Απλή καταγραφή' }),
                el('p', { className: 'ran-status-line', textContent: `Μετρημένος χρόνος: ${formatElapsedTime(run.durationMs)} (${fmtNum(run.durationMs / 1000, 2)} sec)` }),
                problemsBox,
                el('div', { className: 'ran-error-capture-grid' }, [
                    el('div', { className: 'ran-card' }, [
                        el('h2', { textContent: 'Καταγραφή λαθών' }),
                        subs.field, omis.field, selfCorr.field, reps.field,
                    ]),
                    proceduralSummary,
                ]),
                errorBudgetMessage,
                el('div', { className: 'ran-card' }, [
                    el('h2', { textContent: 'Σημειώσεις' }),
                    notesInput,
                ]),
                el('div', { className: 'ran-actions' }, [
                    submitBtn,
                ]),
            ]);
            this.container.appendChild(screen);
            recomputeErrorBudget();
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
                buildDataMinimizationHint(),
            ]);
            newProfileField.style.display = select.value === NEW_PROFILE_VALUE ? 'block' : 'none';

            // Grade data-flow (A: prefill in UI). The grade select
            // starts prefilled from the currently-selected EXISTING
            // profile's profile.grade — purely a read, nothing is
            // written anywhere yet. Re-prefilled every time the
            // examiner switches which profile they're saving under; for
            // "+ Νέο προφίλ" there is no profile.grade yet to read, so
            // it resets to "not set" (the examiner can still pick one —
            // it will only affect this one gradeAtAdministration
            // snapshot, since a brand-new profile has no grade of its
            // own to have prefilled from).
            const initialProfile = (select.value && select.value !== NEW_PROFILE_VALUE) ? RAN.storage.getProfile(select.value) : null;
            const gradeSelect = buildGradeSelect('ran-save-grade-select', initialProfile && initialProfile.grade);
            const gradeField = el('div', { className: 'ran-form-field' }, [
                el('label', { for: 'ran-save-grade-select', textContent: 'Τάξη κατά τη χορήγηση' }),
                gradeSelect,
            ]);

            select.addEventListener('change', () => {
                newProfileField.style.display = select.value === NEW_PROFILE_VALUE ? 'block' : 'none';
                const chosenProfile = select.value !== NEW_PROFILE_VALUE ? RAN.storage.getProfile(select.value) : null;
                gradeSelect.value = (chosenProfile && chosenProfile.grade && GRADE_OPTION_ORDER.includes(chosenProfile.grade))
                    ? chosenProfile.grade : GRADE_UNSET_VALUE;
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
                gradeField,
                el('div', { className: 'ran-actions' }, [
                    el('button', {
                        className: 'ran-btn ran-btn-primary',
                        textContent: 'Αποθήκευση Αποτελέσματος',
                        onClick: () => {
                            let profileId = select.value;
                            if (profileId === NEW_PROFILE_VALUE) {
                                profileId = RAN.storage.createProfile(newProfileInput.value).profileId;
                            }
                            // Grade data-flow (B: explicit write). The
                            // examiner's FINAL selected value is
                            // assigned onto a new administration object
                            // here, explicitly, by this UI/save-flow
                            // code — BEFORE RAN.storage.saveAdministration
                            // is called. Storage itself never reads
                            // profile.grade or decides this value (see
                            // that function's own note in ran_storage.js).
                            const administrationToSave = Object.assign({}, admin, { gradeAtAdministration: readGradeSelect(gradeSelect) });
                            this.lastSaveResult = RAN.storage.saveAdministration(profileId, administrationToSave);
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
                ? el('p', { className: 'ran-status-line', textContent: 'Αιτία διακοπής: ' + RAN.wording.incompleteReasonLabels[admin.incompleteReason] })
                : admin.invalidReason
                    ? el('p', { className: 'ran-status-line', textContent: 'Αιτία διακοπής: ' + RAN.wording.invalidReasonLabels[admin.invalidReason] })
                    : null;

            // INCOMPLETE/INVALID correctness fix: which time figure (if
            // any) counts as a "primary performance result" depends on
            // status — never the same tile/label for all three.
            //   COMPLETED/COMPLETED_FLAGGED: unchanged — completionTimeSec,
            //     labeled "Χρόνος ολοκλήρωσης" (a genuine completion time).
            //   INCOMPLETE: the run was never completed, so its elapsed
            //     time is NOT a completion time — shown as
            //     interruptedAtTimeSec under "Χρόνος μέχρι τη διακοπή"
            //     instead, never claiming the run finished.
            //   INVALID: no elapsed-time figure is a valid performance
            //     result at all — shows an explicit "—", never the raw
            //     stored duration (which remains in admin.durationMs,
            //     untouched, as raw audit data only).
            const primaryMetric = admin.status === RAN.STATUS.INVALID
                ? el('div', { className: 'ran-metric-primary' }, [
                    el('div', { className: 'ran-metric-primary-value', textContent: '—' }),
                    el('div', { className: 'ran-metric-primary-label', textContent: 'Χρόνος ολοκλήρωσης' }),
                ])
                : admin.status === RAN.STATUS.INCOMPLETE
                    ? (results.interruptedAtTimeSec != null
                        ? el('div', { className: 'ran-metric-primary' }, [
                            el('div', { className: 'ran-metric-primary-value', textContent: `${fmtNum(results.interruptedAtTimeSec, 2)} sec` }),
                            el('div', { className: 'ran-metric-primary-label', textContent: 'Χρόνος μέχρι τη διακοπή' }),
                        ])
                        : null)
                    : (results.completionTimeSec != null
                        ? el('div', { className: 'ran-metric-primary' }, [
                            el('div', { className: 'ran-metric-primary-value', textContent: `${fmtNum(results.completionTimeSec, 2)} sec` }),
                            el('div', { className: 'ran-metric-primary-label', textContent: 'Χρόνος ολοκλήρωσης' }),
                        ])
                        : null);

            // INVALID gets an explicit "—" independent-correct tile
            // (never a number — independentCorrect is null for INVALID
            // per RAN.calcResults) instead of the generic non-eligible
            // sentence, per the explicit "Ανεξάρτητα σωστές: —"
            // requirement. INCOMPLETE keeps the existing generic
            // sentence (no specific replacement wording was requested
            // there, and it already fully suppresses any number).
            const secondaryMetrics = admin.status === RAN.STATUS.INVALID
                ? el('div', { className: 'ran-metrics-secondary' }, [
                    el('div', { className: 'ran-metric-card' }, [
                        el('div', { className: 'ran-metric-card-value', textContent: '—' }),
                        el('div', { className: 'ran-metric-card-label', textContent: 'Ανεξάρτητα σωστές κατονομασίες' }),
                    ]),
                ])
                : results.rateEligible
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
            // Same status-driven time label/value as primaryMetric above
            // — kept as one shared computation so the detailed-data list
            // can never disagree with the primary tile about what the
            // elapsed-time figure means for this status.
            const timeRowLabel = admin.status === RAN.STATUS.INCOMPLETE ? 'Χρόνος μέχρι τη διακοπή (δευτ.)' : 'Χρόνος ολοκλήρωσης (δευτ.)';
            const timeRowValue = admin.status === RAN.STATUS.INCOMPLETE
                ? (results.interruptedAtTimeSec != null ? fmtNum(results.interruptedAtTimeSec, 2) : '—')
                : (results.completionTimeSec != null ? fmtNum(results.completionTimeSec, 2) : '—');
            const dlEntries = [
                [timeRowLabel, timeRowValue],
                ['Ανεξάρτητα σωστές κατονομασίες', results.independentCorrect != null ? results.independentCorrect : '—'],
                ['Σύνολο ερεθισμάτων', results.totalStimuli],
                ['Αντικαταστάσεις', results.substitutions, 'Λανθασμένες κατονομασίες που δεν αυτοδιορθώθηκαν.'],
                ['Παραλείψεις', results.omissions, 'Ερεθίσματα που προσπεράστηκαν χωρίς κατονομασία.'],
                ['Επαναλήψεις', results.repetitions, 'Επαναλαμβανόμενες αποκρίσεις/κατονομασίες.'],
                ['Αυτοδιορθώσεις', results.selfCorrections, 'Αρχικά λανθασμένες αποκρίσεις που το παιδί διόρθωσε αυθόρμητα χωρίς βοήθεια.'],
                ['Δόθηκε απάντηση', results.examinerProvidedAnswers, 'Περιπτώσεις στις οποίες, μετά από περίπου 3\'\' χωρίς απόκριση, ο εξεταστής έδωσε το όνομα του ερεθίσματος για να συνεχιστεί η διαδικασία.'],
                ['Επαναφορές εξεταστή', results.examinerRedirects],
                ['Απώλεια σειράς', results.sequenceLoss ? 'Ναι' : 'Όχι'],
                ['Διόρθωση μετά τη χρονομέτρηση', results.examinerReviewAdjusted ? 'Ναι' : 'Όχι', 'Ο εξεταστής άλλαξε τουλάχιστον μία από τις παραπάνω τιμές (Δόθηκε απάντηση / Επαναφορές εξεταστή / Απώλεια σειράς) στο στάδιο ελέγχου μετά τη χρονομέτρηση, σε σχέση με ό,τι είχε καταγραφεί ζωντανά.'],
                ['Επανεξοικείωση πριν τη χορήγηση', RAN.wording.resolveFamiliarityRetriesLabel(admin.familiarityRetriesUsed), 'Πόσες φορές χρειάστηκε νέος έλεγχος εξοικείωσης επειδή τουλάχιστον ένα ερέθισμα δεν κατονομάστηκε ως Γνωστό. Καθαρά περιγραφικό — δεν επηρεάζει τη βαθμολόγηση ή την κατάσταση της χορήγησης.'],
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
                        el('div', { className: 'ran-profile-meta', textContent: p.createdAt ? `Δημιουργήθηκε: ${p.createdAt.slice(0, 10)} · ${RAN.wording.resolveGradeLabel(p.grade)}` : RAN.wording.resolveGradeLabel(p.grade) }),
                    ]),
                    el('button', {
                        className: 'ran-btn ran-btn-secondary',
                        textContent: 'Προβολή ιστορικού →',
                        onClick: () => { this.viewingProfileId = p.profileId; this.navigate('profileHistory'); },
                    }),
                ]))));
            }

            const newLabelInput = el('input', { id: 'ran-new-profile-name', type: 'text', value: RAN.storage.suggestNextDisplayLabel() });
            const newProfileGradeSelect = buildGradeSelect('ran-new-profile-grade', null);
            body.push(el('div', { className: 'ran-form-field' }, [
                el('label', { for: 'ran-new-profile-name', textContent: '+ Νέο προφίλ' }),
                newLabelInput,
                buildDataMinimizationHint(),
                el('label', { for: 'ran-new-profile-grade', textContent: 'Τάξη (προαιρετικό)' }),
                newProfileGradeSelect,
                el('div', { className: 'ran-actions' }, [
                    el('button', {
                        className: 'ran-btn ran-btn-secondary',
                        textContent: 'Δημιουργία',
                        onClick: () => { RAN.storage.createProfile(newLabelInput.value, readGradeSelect(newProfileGradeSelect)); this.navigate('profiles'); },
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
            // Grade proposal: editing profile.grade here only changes
            // future prefill (renderSaveSection reads profile.grade at
            // save time) — it can never alter any already-saved
            // administration's own gradeAtAdministration snapshot, since
            // that field lives independently on each administration
            // record and nothing here touches it.
            const profileGradeSelect = buildGradeSelect('ran-profile-grade', profile.grade);
            // Moved above `body` (was previously declared further down)
            // so the item 23 delete-profile confirmation below can state
            // the REAL, current administration count — computed fresh on
            // every render, never a stale/cached number.
            const administrations = RAN.storage.listAdministrations(profile.profileId);

            // Item 23: cascade delete, gated behind the same explicit
            // two-step confirmation pattern as individual-administration
            // delete (renderProfileHistory's own History table below) —
            // never a single accidental click. The message is built
            // dynamically from `administrations.length` so it always
            // states the real, current number about to be deleted, not
            // a guess or a stale count.
            const deleteProfileMessage = administrations.length > 0
                ? `Θα διαγραφεί το προφίλ και ${administrations.length} συνδεδεμένες χορηγήσεις. Η ενέργεια δεν αναιρείται.`
                : 'Θα διαγραφεί το προφίλ. Η ενέργεια δεν αναιρείται.';
            const deleteProfileSection = this.pendingDeleteProfile
                ? el('div', { className: 'ran-form-field' }, [
                    el('p', { className: 'ran-error-budget-message', role: 'alert', textContent: deleteProfileMessage }),
                    el('div', { className: 'ran-actions' }, [
                        el('button', {
                            className: 'ran-btn ran-btn-danger',
                            textContent: 'Ναι, οριστική διαγραφή προφίλ',
                            onClick: () => {
                                RAN.storage.deleteProfile(profile.profileId);
                                this.pendingDeleteProfile = false;
                                this.navigate('profiles');
                            },
                        }),
                        el('button', {
                            className: 'ran-btn ran-btn-secondary',
                            textContent: 'Άκυρο',
                            onClick: () => { this.pendingDeleteProfile = false; this.navigate('profileHistory'); },
                        }),
                    ]),
                ])
                : el('div', { className: 'ran-form-field' }, [
                    el('div', { className: 'ran-actions' }, [
                        el('button', {
                            className: 'ran-btn ran-btn-danger',
                            textContent: 'Διαγραφή προφίλ',
                            onClick: () => { this.pendingDeleteProfile = true; this.navigate('profileHistory'); },
                        }),
                    ]),
                ]);

            const body = [
                el('h1', { textContent: profile.displayLabel }),
                // PASS 2 §10: shown exactly once here, at the top —
                // never repeated per assessment-type section below.
                el('p', { className: 'ran-cross-type-warning', textContent: RAN.wording.crossTypeWarning }),
                el('div', { className: 'ran-info-card', textContent: RAN.wording.storageWarning }),
                el('div', { className: 'ran-form-field' }, [
                    el('label', { for: 'ran-rename-profile', textContent: 'Μετονομασία προφίλ' }),
                    renameInput,
                    buildDataMinimizationHint(),
                    el('div', { className: 'ran-actions' }, [
                        el('button', {
                            className: 'ran-btn ran-btn-secondary',
                            textContent: 'Αποθήκευση Ονόματος',
                            onClick: () => { RAN.storage.renameProfile(profile.profileId, renameInput.value); this.navigate('profileHistory'); },
                        }),
                    ]),
                ]),
                el('div', { className: 'ran-form-field' }, [
                    el('label', { for: 'ran-profile-grade', textContent: 'Τάξη μαθητή (τρέχουσα)' }),
                    profileGradeSelect,
                    el('div', { className: 'ran-actions' }, [
                        el('button', {
                            className: 'ran-btn ran-btn-secondary',
                            textContent: 'Αποθήκευση Τάξης',
                            onClick: () => { RAN.storage.updateProfileGrade(profile.profileId, readGradeSelect(profileGradeSelect)); this.navigate('profileHistory'); },
                        }),
                    ]),
                ]),
                deleteProfileSection,
            ];

            // Versioning (V2): grouped by TYPE, not by a single fixed
            // assessmentId — RAN_DIGITS_V1 and RAN_DIGITS_V2 are
            // distinct assessmentIds, so a naive per-assessmentId loop
            // would render two separate, identically-labeled "RAN
            // Αριθμοί" sections. Per type, only the assessmentIds that
            // either (a) already have at least one saved administration
            // for this profile, or (b) are the type's CURRENT_VERSIONS
            // entry, are shown — so a brand-new profile with no history
            // yet sees exactly one section per type (the current
            // version), matching the pre-V2 single-version UI exactly,
            // while a profile with old V1 data keeps seeing it
            // alongside V2. The " — Έκδοση N" heading suffix is only
            // added when more than one version is actually being shown
            // for that type in THIS profile's history.
            const assessmentIdsByType = {};
            Object.keys(RAN.definitions).forEach(id => {
                const type = RAN.definitions[id].type;
                (assessmentIdsByType[type] = assessmentIdsByType[type] || []).push(id);
            });
            Object.keys(RAN.CURRENT_VERSIONS).forEach(type => {
                const idsForType = (assessmentIdsByType[type] || []).slice()
                    .sort((a, b) => RAN.definitions[a].version - RAN.definitions[b].version);
                const currentId = RAN.CURRENT_VERSIONS[type];
                const idsToShow = idsForType.filter(id => id === currentId || administrations.some(a => a.assessmentId === id));
                const showVersionSuffix = idsToShow.length > 1;
                const typeLabel = RAN.getDefinition(currentId).label;

            idsToShow.forEach(assessmentId => {
                const rows = administrations.filter(a => a.assessmentId === assessmentId);
                const version = RAN.definitions[assessmentId].version;
                // PASS 2 §13: "Έκδοση" -> "Έκδοση εργαλείου" wherever the
                // assessmentVersion is presented as a standalone label —
                // internal field/enum names are completely untouched.
                const versionSuffix = showVersionSuffix ? ` — Έκδοση εργαλείου ${version}` : '';
                body.push(el('h2', { textContent: `RAN ${typeLabel}${versionSuffix}` }));
                if (rows.length === 0) {
                    body.push(el('p', { className: 'ran-status-line', textContent: 'Καμία καταγεγραμμένη χορήγηση.' }));
                    return;
                }

                // PASS 2 §11: the standalone "Τελευταία χορήγηση" card is
                // removed entirely, for every assessment type, with 1 or
                // many administrations. The time remains visible in the
                // History table below, and in graph points when a graph
                // is shown — never in a separate large metric widget.

                // PASS 2 §3/§4/§12: `rows` already belongs to exactly ONE
                // assessmentId, and assessmentId<->assessmentVersion is
                // 1:1 in RAN.definitions (confirmed in the PASS 1 audit)
                // — so no separate per-version grouping is needed here
                // any more; a byVersion Map would always have had exactly
                // one entry. Threshold changed from >=3 to >=2 (PASS 2
                // §3): COMPLETED and COMPLETED_FLAGGED both count toward
                // it — isGraphEligible() already covers both. The
                // COMPLETED_FLAGGED restriction is scoped to connecting
                // line segments (buildLongitudinalGraph's own
                // connectableSegment()) and numeric comparison
                // (classifyComparisonPair() below), never to a flagged
                // point's presence on the graph.
                const eligiblePoints = rows
                    .filter(isGraphEligible)
                    .slice()
                    .sort((a, b) => (a.dateISO || '').localeCompare(b.dateISO || ''))
                    .map(a => ({
                        dateISO: a.dateISO,
                        durationSec: a.durationMs / 1000,
                        independentCorrect: a.independentCorrect,
                        totalStimuli: a.totalStimuli,
                        form: a.form,
                        status: a.status,
                    }));
                if (eligiblePoints.length >= 2) {
                    const heading = `RAN ${typeLabel}${versionSuffix}`;
                    body.push(buildLongitudinalGraph(eligiblePoints, heading));
                } else if (eligiblePoints.length === 1) {
                    // PASS 2 §12: no graph, no giant latest-time metric —
                    // just the neutral threshold explanation. The History
                    // table (pushed further below) still shows this and
                    // every other row normally, regardless.
                    body.push(el('p', { className: 'ran-field-hint ran-graph-insufficient-message', textContent: RAN.wording.insufficientGraphDataMessage }));
                }

                const table = el('table', { className: 'ran-history-table' }, [
                    el('thead', {}, [el('tr', {}, [
                        el('th', { textContent: 'Ημερομηνία' }),
                        el('th', { textContent: 'Έκδοση εργαλείου' }),
                        el('th', { textContent: 'Μορφή' }),
                        el('th', { textContent: 'Χρόνος (δευτ.)' }),
                        el('th', { textContent: 'Ανεξάρτητα σωστά' }),
                        el('th', { textContent: 'Κατάσταση' }),
                        el('th', { textContent: 'Τάξη' }),
                        el('th', { textContent: 'Επανεξοικείωση' }),
                        el('th', { textContent: 'Ενέργειες' }),
                    ])]),
                    el('tbody', {}, rows.map(a => {
                        // INCOMPLETE/INVALID correctness fix: reuse
                        // RAN.calcResults() as the single source of truth
                        // instead of reading a.durationMs/a.independentCorrect
                        // directly — a raw INCOMPLETE independentCorrect would
                        // otherwise silently treat never-reached stimuli as
                        // correct, and INVALID's raw elapsed time would
                        // otherwise look like a comparable completion time in
                        // the same column as COMPLETED rows.
                        const rowResults = RAN.calcResults(a);
                        const timeCell = a.status === RAN.STATUS.INVALID
                            ? '—'
                            : a.status === RAN.STATUS.INCOMPLETE
                                ? (rowResults.interruptedAtTimeSec != null ? `${fmtNum(rowResults.interruptedAtTimeSec, 2)} (διακοπή)` : '—')
                                : (rowResults.completionTimeSec != null ? fmtNum(rowResults.completionTimeSec, 2) : '—');
                        return el('tr', {}, [
                            el('td', { 'data-label': 'Ημερομηνία', textContent: formatDateDDMMYYYY(a.dateISO) }),
                            el('td', { 'data-label': 'Έκδοση εργαλείου', textContent: String(a.assessmentVersion) }),
                            el('td', { 'data-label': 'Μορφή', textContent: a.form }),
                            el('td', { 'data-label': 'Χρόνος (δευτ.)', textContent: timeCell }),
                            el('td', { 'data-label': 'Ανεξάρτητα σωστά', textContent: rowResults.independentCorrect != null ? String(rowResults.independentCorrect) : '—' }),
                            el('td', { 'data-label': 'Κατάσταση', textContent: RAN.wording.resolveHistoryStatusLabel(a.status) }),
                            // Grade proposal: this specific
                            // administration's immutable snapshot, never
                            // the profile's current grade — reads
                            // a.gradeAtAdministration only, through the
                            // tolerant resolver (legacy rows without the
                            // field, or any unrecognized value, show the
                            // neutral fallback, never "Άλλο").
                            el('td', { 'data-label': 'Τάξη', textContent: RAN.wording.resolveGradeLabel(a.gradeAtAdministration) }),
                            // Item 16: same immutable-snapshot pattern as
                            // Τάξη above — reads a.familiarityRetriesUsed
                            // only, through the tolerant resolver (a
                            // legacy row predating this field, or any
                            // non-integer/negative value, shows "Δεν
                            // καταγράφηκε", never a silent 0).
                            el('td', { 'data-label': 'Επανεξοικείωση', textContent: RAN.wording.resolveFamiliarityRetriesLabel(a.familiarityRetriesUsed) }),
                            // Item 23: explicit per-administration
                            // delete, gated behind an inline two-step
                            // confirmation (click "Διαγραφή" once to
                            // arm it, a second explicit click actually
                            // deletes) — never a single accidental
                            // click away from permanent data loss.
                            // History/graph/comparison need no separate
                            // refresh call: they're all derived fresh
                            // from RAN.storage.listAdministrations() on
                            // every render, and the delete handler
                            // re-navigates to this same screen, so the
                            // deleted row (and any graph/comparison
                            // point it fed) is simply gone from the very
                            // next render.
                            el('td', { 'data-label': 'Ενέργειες' },
                                this.pendingDeleteAdministrationId === a.administrationId
                                    ? [
                                        el('span', { className: 'ran-status-line', textContent: 'Οριστική διαγραφή;' }),
                                        el('button', {
                                            className: 'ran-btn ran-btn-danger',
                                            textContent: 'Ναι, διαγραφή',
                                            onClick: () => {
                                                RAN.storage.deleteAdministration(a.administrationId);
                                                this.pendingDeleteAdministrationId = null;
                                                this.navigate('profileHistory');
                                            },
                                        }),
                                        el('button', {
                                            className: 'ran-btn ran-btn-secondary',
                                            textContent: 'Άκυρο',
                                            onClick: () => { this.pendingDeleteAdministrationId = null; this.navigate('profileHistory'); },
                                        }),
                                    ]
                                    : [
                                        el('button', {
                                            className: 'ran-btn ran-btn-secondary',
                                            textContent: 'Διαγραφή',
                                            onClick: () => { this.pendingDeleteAdministrationId = a.administrationId; this.navigate('profileHistory'); },
                                        }),
                                    ]),
                        ]);
                    })),
                ]);
                // PASS 2 §13/§17 layout fix (visual QA finding): the
                // table gained enough columns/label length ("Έκδοση
                // εργαλείου", "Επανεξοικείωση", "Ενέργειες") that at a
                // ~900px laptop width it can exceed the available
                // width. #ran-app/body clip horizontal overflow (no
                // page scrollbar, by design, for the decorative-blob
                // bleed effect) — without its own scroll container, the
                // excess columns would be silently invisible, not just
                // scrollable. Wrapping in a horizontally-scrollable
                // container (same established pattern as the graph's
                // own .ran-graph-svg-wrap) guarantees every column
                // always stays reachable, never clipped away.
                body.push(el('div', { className: 'ran-history-table-wrap' }, [table]));

                // PASS 2 §2 — EXACT PAIR RULE (replaces the old "filter
                // eligible, then take the two most recent eligible ones"
                // behavior, which could silently search backward past an
                // ineligible most-recent administration). Take ONLY the
                // two chronologically LAST administrations of this
                // assessmentId — any status — and classify exactly that
                // pair; never search further back for a better pair.
                const sortedAll = rows.slice().sort((a, b) => (a.dateISO || '').localeCompare(b.dateISO || ''));
                if (sortedAll.length >= 2) {
                    const previous = sortedAll[sortedAll.length - 2];
                    const current = sortedAll[sortedAll.length - 1];
                    const classification = classifyComparisonPair(previous, current);
                    if (classification.kind === 'valid') {
                        // Deliberately no color-coding for faster/slower —
                        // a descriptive difference, not a normative
                        // judgement. Percentage change is never rendered
                        // (PASS 2 §1) — only the signed absolute
                        // difference, via formatTimeComparison.
                        body.push(el('p', { className: 'ran-comparison-header', textContent: RAN.wording.comparisonHeader(classification.form) }));
                        const labels = RAN.wording.formatTimeComparison(classification.diff.deltaSec);
                        body.push(el('p', { className: 'ran-comparison-line', textContent: labels.comparisonLine }));
                        body.push(el('p', { className: 'ran-comparison-note', textContent: labels.comparisonNote }));
                    } else if (classification.kind === 'flagged') {
                        body.push(el('p', { className: 'ran-comparison-line ran-comparison-unavailable', textContent: RAN.wording.comparisonBlockedFlagged }));
                    } else if (classification.kind === 'form-mismatch') {
                        body.push(el('p', { className: 'ran-comparison-line ran-comparison-unavailable', textContent: RAN.wording.comparisonFormMismatch(classification.previousForm, classification.currentForm) }));
                    } else {
                        // 'ineligible': one or both of the last two are
                        // INCOMPLETE/INVALID (or otherwise not graph-
                        // eligible) — no backward search for an older
                        // eligible pair, per the exact-pair rule.
                        body.push(el('p', { className: 'ran-comparison-line ran-comparison-unavailable', textContent: RAN.wording.comparisonBlockedIneligibleStatus }));
                    }
                }
            }); // end idsToShow.forEach
            }); // end Object.keys(RAN.CURRENT_VERSIONS).forEach

            body.push(el('div', { className: 'ran-actions' }, [
                el('button', { className: 'ran-btn ran-btn-secondary', textContent: '← Πίσω στα Προφίλ', onClick: () => { this.pendingDeleteAdministrationId = null; this.pendingDeleteProfile = false; this.navigate('profiles'); } }),
            ]));

            this.container.appendChild(el('div', { className: 'ran-screen' }, body));
        },
    };
})();
