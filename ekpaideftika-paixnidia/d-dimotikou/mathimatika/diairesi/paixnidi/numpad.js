/* Οριζόντιο αριθμητικό πληκτρολόγιο για πεδία απάντησης */

const NumKeyboard = {
  activeInput: null,

  attach(input, options = {}) {
    if (!input || input.dataset.numpadAttached) return;

    const maxLen = options.maxLength ?? 2;
    const maxVal = options.maxValue ?? 99;

    this.prepareInput(input, maxLen, maxVal);

    const wrap = document.createElement('div');
    wrap.className = 'num-input-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    wrap.appendChild(this.buildKeyboard([input], maxLen, maxVal, { includeDelete: true }));

    this.bindFocus(input, wrap);
  },

  attachDual(inputs, options = {}) {
    const targets = inputs.filter(input => input && !input.dataset.numpadAttached);
    if (targets.length < 2) return;

    const maxLen = options.maxLength ?? 2;
    const maxVal = options.maxValue ?? 99;

    targets.forEach(input => {
      this.prepareInput(input, maxLen, maxVal);
      const wrap = document.createElement('div');
      wrap.className = 'num-input-wrap';
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
      wrap.appendChild(this.buildKeyboard(targets, maxLen, maxVal, { includeDelete: false }));
      this.bindFocus(input, wrap);
    });

    const lastWrap = targets[targets.length - 1].closest('.num-input-wrap');
    lastWrap?.appendChild(this.buildDeleteButton(targets));

    this.setActive(targets[0], targets[0].closest('.num-input-wrap'));
  },

  prepareInput(input, maxLen = 2, maxVal = 99) {
    input.dataset.numpadAttached = '1';
    input.dataset.maxLen = String(maxLen);
    input.dataset.maxVal = String(maxVal);
    // Δεν είναι readonly: επιτρέπεται και το φυσικό πληκτρολόγιο.
    // Το inputmode="none" κρύβει το soft keyboard σε κινητά/tablet.
    input.removeAttribute('readonly');
    input.setAttribute('inputmode', 'none');
    input.setAttribute('autocomplete', 'off');
    this.bindHardwareKeys(input, maxLen, maxVal);
  },

  bindHardwareKeys(input, maxLen, maxVal) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') return;
      const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
      if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
        return;
      }
      const willOverflow = (input.value || '').length >= maxLen;
      if (willOverflow && input.selectionStart === input.selectionEnd) {
        e.preventDefault();
      }
    });
    input.addEventListener('input', () => {
      let v = (input.value || '').replace(/\D/g, '').slice(0, maxLen);
      if (v !== '' && parseInt(v, 10) > maxVal) v = String(maxVal);
      if (v !== input.value) input.value = v;
    });
  },

  bindFocus(input, wrap) {
    const activate = () => this.setActive(input, wrap);
    input.addEventListener('focus', activate);
    input.addEventListener('click', activate);
  },

  setActive(input, wrap) {
    if (!input || input.disabled) return;
    this.activeInput = input;
    document.querySelectorAll('.num-input-wrap.is-active').forEach(el => {
      el.classList.remove('is-active');
    });
    wrap?.classList.add('is-active');
  },

  getTargetInput(fallback) {
    if (this.activeInput && !this.activeInput.disabled) return this.activeInput;
    if (fallback && !fallback.disabled) return fallback;
    return null;
  },

  buildDeleteButton(targets) {
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'num-key num-key--del';
    delBtn.setAttribute('aria-label', 'Διαγραφή');
    delBtn.textContent = '⌫';
    delBtn.addEventListener('click', () => {
      this.pressDelete(this.getTargetInput(targets[0]));
    });
    return delBtn;
  },

  buildKeyboard(targets, maxLen, maxVal, { includeDelete = true } = {}) {
    const kb = document.createElement('div');
    kb.className = 'num-keyboard';
    kb.setAttribute('role', 'group');
    kb.setAttribute('aria-label', 'Αριθμητικό πληκτρολόγιο');

    const fallback = targets[0];

    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].forEach(digit => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'num-key';
      btn.textContent = digit;
      btn.addEventListener('click', () => {
        this.pressDigit(this.getTargetInput(fallback), digit, maxLen, maxVal);
      });
      kb.appendChild(btn);
    });

    if (includeDelete) {
      kb.appendChild(this.buildDeleteButton(targets));
    }

    return kb;
  },

  pressDigit(input, digit, maxLen, maxVal) {
    if (!input || input.disabled) return;
    this.setActive(input, input.closest('.num-input-wrap'));
    input.focus();
    const current = input.value || '';
    if (current.length >= maxLen) return;
    const next = current + digit;
    if (parseInt(next, 10) > maxVal) return;
    input.value = next;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    if (typeof Sound !== 'undefined') Sound.play('tap');
  },

  pressDelete(input) {
    if (!input || input.disabled) return;
    this.setActive(input, input.closest('.num-input-wrap'));
    input.focus();
    input.value = input.value.slice(0, -1);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    if (typeof Sound !== 'undefined') Sound.play('tap');
  },

  attachAll(root = document) {
    const scope = root?.querySelectorAll ? root : document;
    const inputs = [...scope.querySelectorAll('.answer-slot-input:not([data-numpad-attached])')];
    if (!inputs.length) return;

    if (inputs.length === 1) {
      this.attach(inputs[0]);
      return;
    }

    this.attachDual(inputs);
  },
};
