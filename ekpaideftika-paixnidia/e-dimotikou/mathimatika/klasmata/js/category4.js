const Category4 = {
    stage: 0,
    questions: [],
    currentQ: 0,
    draggingId: null,
    touchClone: null,
    touchOffsetX: 0,
    touchOffsetY: 0,

    startStage(stageNum) {
        Category4.stage = stageNum;
        Category4.questions = [];
        Category4.currentQ = 0;
        for (let i = 0; i < 10; i++) {
            Category4.questions.push(Category4.generateQuestion(stageNum));
        }
        Category4.loadQuestion();
    },

    generateQuestion(stageNum) {
        if (stageNum === 1) {
            // Same denominator, 4 unique fractions. Keep it under 10 — den
            // must be >= 5 for 4 numerators, and 5-9 always has enough, so
            // there's no need to ever reach for a bigger one here.
            let den = Utils.randomInt(5, 9);
            let allNums = Array.from({ length: den - 1 }, (_, k) => k + 1);
            Utils.shuffle(allNums);
            let fracs = allNums.slice(0, 4).map(n => ({ n, d: den, val: n / den }));
            Utils.shuffle(fracs);
            return { fracs };
        } else if (stageNum === 2) {
            // Groups: < 1/2, = 1/2, > 1/2  (always at least one per group)
            const lt = [[1,3],[1,4],[1,5],[2,7],[1,6],[2,9],[3,8],[1,7],[3,10],[2,11],[1,8],[4,9],[1,9],[3,7],[2,13],[4,11],[1,10],[3,11]];
            const eq = [[1,2],[2,4],[3,6],[4,8],[5,10],[6,12],[7,14],[8,16]];
            const gt = [[2,3],[3,4],[3,5],[4,7],[5,8],[4,6],[5,7],[6,8],[7,9],[7,10],[5,6],[8,9],[9,10],[10,11],[11,12],[9,11],[7,8]];
            Utils.shuffle(lt); Utils.shuffle(eq); Utils.shuffle(gt);
            let picked = [lt[0], lt[1], eq[0], gt[0], gt[1]];
            Utils.shuffle(picked);
            let fracs = picked.map(([n, d]) => ({ n, d, val: n / d }));
            return { fracs };
        } else {
            // Different denominators, 4 fractions with distinct values.
            // Prefer denominators under 10; only reach a bit higher (up to
            // 12, still close to ten) if that's not enough to find 4
            // sufficiently distinct values.
            let fracs = [];
            let vals = [];
            let attempts = 0;
            while (fracs.length < 4 && attempts < 200) {
                attempts++;
                let maxDen = attempts < 150 ? 9 : 12;
                let d = Utils.randomInt(2, maxDen);
                let n = Utils.randomInt(1, d - 1);
                let val = n / d;
                if (!vals.some(v => Math.abs(v - val) < 0.05)) {
                    fracs.push({ n, d, val });
                    vals.push(val);
                }
            }
            Utils.shuffle(fracs);
            return { fracs };
        }
    },

    loadQuestion() {
        if (Category4.currentQ >= Category4.questions.length) {
            app.showCelebration();
            return;
        }
        let q = Category4.questions[Category4.currentQ];
        let prompt = Category4.stage === 2
            ? 'Τοποθέτησε κάθε κλάσμα στο σωστό κουτί!'
            : 'Βάλε τα κλάσματα σε σειρά από το μικρότερο ως το μεγαλύτερο!';
        app.prepareGameArea(`Ερώτηση ${Category4.currentQ + 1} / ${Category4.questions.length}`, prompt);

        let area = document.getElementById('game-area');
        area.innerHTML = '';
        area.style.flexDirection = 'column';
        area.style.flexWrap = 'nowrap';
        area.style.alignItems = 'stretch';
        area.style.gap = '16px';

        if (Category4.stage === 2) {
            area.innerHTML = Category4.renderStage2(q.fracs);
        } else {
            area.innerHTML = Category4.renderNumberLine(q.fracs);
        }
    },

    // ── Number Line (Stages 1 & 3) ──────────────────────────────────────────

    // Positions slots by min-gap-clamped true value instead of even spacing,
    // so the line reflects real magnitude. Uses the SORTED values (not bank
    // order) since the exercise only requires ascending order across slots,
    // not a fixed fraction-to-slot mapping.
    declutterPositions(positions, minGap, lo, hi) {
        let pos = positions.slice();
        let n = pos.length;
        for (let i = 1; i < n; i++) {
            if (pos[i] - pos[i - 1] < minGap) pos[i] = pos[i - 1] + minGap;
        }
        if (pos[n - 1] > hi) {
            pos[n - 1] = hi;
            for (let i = n - 2; i >= 0; i--) {
                if (pos[i + 1] - pos[i] < minGap) pos[i] = pos[i + 1] - minGap;
            }
        }
        if (pos[0] < lo) {
            pos[0] = lo;
            for (let i = 1; i < n; i++) {
                if (pos[i] - pos[i - 1] < minGap) pos[i] = pos[i - 1] + minGap;
            }
        }
        return pos;
    },

    renderNumberLine(fracs) {
        let n = fracs.length;
        let sortedVals = fracs.map(f => f.val).sort((a, b) => a - b);
        let truePositions = sortedVals.map(v => v * 100);
        let positions = Category4.declutterPositions(truePositions, 11, 8, 92);

        let slotsHTML = '';
        for (let i = 0; i < n; i++) {
            let pct = positions[i].toFixed(1);
            slotsHTML += `
                <div class="nl-slot" data-index="${i}" style="left:${pct}%"
                    ondragover="event.preventDefault(); document.getElementById('nl-drop-${i}').classList.add('drag-over')"
                    ondragleave="document.getElementById('nl-drop-${i}').classList.remove('drag-over')"
                    ondrop="Category4.dropOnSlot(event,${i})">
                    <div class="nl-tick"></div>
                    <div class="nl-drop-box" id="nl-drop-${i}"></div>
                </div>`;
        }
        let bankHTML = fracs.map((f, i) => Category4.makeFrac(f, i)).join('');
        return `
            <div class="nl-container">
                <div class="nl-bar">
                    <span class="nl-label-end">0</span>
                    <div class="nl-track" id="nl-track">${slotsHTML}</div>
                    <span class="nl-label-end">1</span>
                </div>
                <div class="frac-bank" id="fraction-bank"
                    ondragover="event.preventDefault()"
                    ondrop="Category4.dropOnBank(event)">
                    ${bankHTML}
                </div>
            </div>`;
    },

    // ── Stage 2 (Three Boxes) ────────────────────────────────────────────────

    renderStage2(fracs) {
        let bankHTML = fracs.map((f, i) => Category4.makeFrac(f, i)).join('');
        const labels = [
            `<span class="box-cmp">μικρότερο από</span>${Utils.renderFraction(1, 2)}`,
            `<span class="box-cmp">ίσο με</span>${Utils.renderFraction(1, 2)}`,
            `<span class="box-cmp">μεγαλύτερο από</span>${Utils.renderFraction(1, 2)}`
        ];
        let boxesHTML = [0, 1, 2].map(b => `
            <div class="s2-box" data-box="${b}"
                ondragover="event.preventDefault(); this.classList.add('drag-over')"
                ondragleave="this.classList.remove('drag-over')"
                ondrop="Category4.dropOnBox(event,${b})">
                <div class="s2-label">${labels[b]}</div>
                <div class="s2-content" id="box-content-${b}"></div>
            </div>`).join('');
        return `
            <div class="s2-container">
                <div class="s2-boxes">${boxesHTML}</div>
                <div class="frac-bank" id="fraction-bank"
                    ondragover="event.preventDefault()"
                    ondrop="Category4.dropOnBank(event)">
                    ${bankHTML}
                </div>
            </div>`;
    },

    makeFrac(f, i) {
        return `<div class="drag-frac" id="frac-${i}"
            draggable="true"
            data-val="${f.val}"
            ondragstart="Category4.dragStart(event,'frac-${i}')"
            ontouchstart="Category4.touchStart(event,'frac-${i}')"
            ontouchmove="Category4.touchMove(event)"
            ontouchend="Category4.touchEnd(event)">
            ${Utils.renderFraction(f.n, f.d)}
        </div>`;
    },

    // ── HTML5 Drag events ────────────────────────────────────────────────────

    dragStart(e, id) {
        Category4.draggingId = id;
        e.dataTransfer.setData('text', id);
        setTimeout(() => document.getElementById(id)?.classList.add('frac-dragging'), 0);
        Utils.playSound('pop');
    },

    dropOnSlot(e, idx) {
        e.preventDefault();
        let id = e.dataTransfer.getData('text') || Category4.draggingId;
        document.getElementById(`nl-drop-${idx}`)?.classList.remove('drag-over');
        Category4.placeInSlot(id, idx);
    },

    dropOnBank(e) {
        e.preventDefault();
        let id = e.dataTransfer.getData('text') || Category4.draggingId;
        Category4.placeInBank(id);
    },

    dropOnBox(e, b) {
        e.preventDefault();
        let id = e.dataTransfer.getData('text') || Category4.draggingId;
        e.currentTarget.classList.remove('drag-over');
        Category4.placeInBox(id, b);
    },

    // ── Shared placement ─────────────────────────────────────────────────────

    placeInSlot(id, idx) {
        let el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('frac-dragging');
        let drop = document.getElementById(`nl-drop-${idx}`);
        if (!drop) return;
        // Send occupant back to bank
        while (drop.firstChild) {
            drop.firstChild.classList.remove('frac-dragging');
            document.getElementById('fraction-bank')?.appendChild(drop.firstChild);
        }
        drop.appendChild(el);
        Utils.playSound('pop');
    },

    placeInBank(id) {
        let el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('frac-dragging');
        document.getElementById('fraction-bank')?.appendChild(el);
    },

    placeInBox(id, b) {
        let el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('frac-dragging');
        document.getElementById(`box-content-${b}`)?.appendChild(el);
        Utils.playSound('pop');
    },

    // ── Touch drag ───────────────────────────────────────────────────────────

    touchStart(e, id) {
        e.preventDefault();
        Category4.draggingId = id;
        let el = document.getElementById(id);
        let rect = el.getBoundingClientRect();
        let touch = e.touches[0];

        let clone = el.cloneNode(true);
        clone.id = 'touch-clone';
        clone.style.cssText = `position:fixed;z-index:9999;pointer-events:none;
            opacity:0.85;transform:scale(1.12);
            left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;`;
        document.body.appendChild(clone);
        Category4.touchClone = clone;
        Category4.touchOffsetX = touch.clientX - rect.left;
        Category4.touchOffsetY = touch.clientY - rect.top;
        el.style.opacity = '0.35';
    },

    touchMove(e) {
        e.preventDefault();
        if (!Category4.touchClone) return;
        let touch = e.touches[0];
        Category4.touchClone.style.left = (touch.clientX - Category4.touchOffsetX) + 'px';
        Category4.touchClone.style.top  = (touch.clientY - Category4.touchOffsetY) + 'px';
    },

    touchEnd(e) {
        e.preventDefault();
        if (!Category4.touchClone) return;
        let touch = e.changedTouches[0];

        // Hide clone so elementFromPoint sees through it
        Category4.touchClone.style.display = 'none';
        let target = document.elementFromPoint(touch.clientX, touch.clientY);
        Category4.touchClone.remove();
        Category4.touchClone = null;

        let origEl = document.getElementById(Category4.draggingId);
        if (origEl) origEl.style.opacity = '';

        if (!target) { Category4.draggingId = null; return; }

        let slot  = target.closest('.nl-slot');
        let box   = target.closest('.s2-box');
        let bank  = target.closest('#fraction-bank');

        if (slot) {
            Category4.placeInSlot(Category4.draggingId, parseInt(slot.dataset.index));
        } else if (box) {
            Category4.placeInBox(Category4.draggingId, parseInt(box.dataset.box));
        } else if (bank) {
            Category4.placeInBank(Category4.draggingId);
        }

        Category4.draggingId = null;
    },

    // ── Check answer ─────────────────────────────────────────────────────────

    check() {
        if (Category4.stage === 2) Category4.checkStage2();
        else Category4.checkOrdering();
    },

    checkOrdering() {
        let n = Category4.questions[Category4.currentQ].fracs.length;
        let vals = [];
        let allFilled = true;

        for (let i = 0; i < n; i++) {
            let drop = document.getElementById(`nl-drop-${i}`);
            if (!drop || !drop.firstChild) { allFilled = false; break; }
            vals.push(parseFloat(drop.firstChild.dataset.val));
        }

        if (!allFilled) {
            let bank = document.getElementById('fraction-bank');
            bank?.classList.add('shake');
            setTimeout(() => bank?.classList.remove('shake'), 500);
            return;
        }

        let wrongIdxs = new Set();
        for (let i = 0; i < vals.length - 1; i++) {
            if (vals[i] >= vals[i + 1]) { wrongIdxs.add(i); wrongIdxs.add(i + 1); }
        }

        if (wrongIdxs.size === 0) {
            Utils.playSound('correct');
            app.addScore(1);
            for (let i = 0; i < n; i++) {
                document.getElementById(`nl-drop-${i}`)?.classList.add('slot-correct');
            }
            app.autoNext();
        } else {
            Utils.playSound('wrong');
            wrongIdxs.forEach(i => {
                let db = document.getElementById(`nl-drop-${i}`);
                db?.classList.add('shake');
                setTimeout(() => db?.classList.remove('shake'), 600);
            });
            setTimeout(() => {
                for (let i = 0; i < n; i++) {
                    let db = document.getElementById(`nl-drop-${i}`);
                    if (db?.firstChild) {
                        document.getElementById('fraction-bank')?.appendChild(db.firstChild);
                    }
                }
            }, 750);
        }
    },

    checkStage2() {
        let bank = document.getElementById('fraction-bank');
        if (bank?.children.length > 0) {
            bank.classList.add('shake');
            setTimeout(() => bank.classList.remove('shake'), 500);
            return;
        }

        let wrongEls = [];
        for (let b = 0; b < 3; b++) {
            let content = document.getElementById(`box-content-${b}`);
            if (!content) continue;
            for (let child of [...content.children]) {
                let val = parseFloat(child.dataset.val);
                let ok;
                if (b === 0) ok = val < 0.5 - 0.001;
                else if (b === 1) ok = Math.abs(val - 0.5) < 0.001;
                else ok = val > 0.5 + 0.001;
                if (!ok) wrongEls.push(child);
            }
        }

        if (wrongEls.length === 0) {
            Utils.playSound('correct');
            app.addScore(1);
            document.querySelectorAll('.s2-box').forEach(b => b.classList.add('box-correct'));
            app.autoNext();
        } else {
            Utils.playSound('wrong');
            wrongEls.forEach(el => {
                el.classList.add('shake');
                setTimeout(() => {
                    el.classList.remove('shake');
                    document.getElementById('fraction-bank')?.appendChild(el);
                }, 750);
            });
        }
    },

    next() {
        Category4.currentQ++;
        Category4.loadQuestion();
    }
};
