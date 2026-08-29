/* ============================================================
   RAN — tiny DOM builder helper (browser-only, no Node test needs it)

   Mirrors the shape of Phono.helpers.el() from the phonological
   awareness game (same repo, eidiki-ekpaideysi/fonologiki-epignosi/
   paixnidi/js/engine.js) so anyone maintaining both modules recognizes
   the pattern immediately — but this is its own small copy, not a
   shared dependency, so RAN stays fully self-contained.
   ============================================================ */
window.RAN = window.RAN || {};

RAN.dom = {
    /**
     * el('div', { className: 'foo', textContent: 'bar', onClick: fn,
     * style: {color:'red'}, disabled: true }, [child1, child2])
     */
    el(tag, props, children) {
        const node = document.createElement(tag);
        props = props || {};
        Object.keys(props).forEach(key => {
            const value = props[key];
            if (key === 'style' && typeof value === 'object') {
                Object.assign(node.style, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                node.addEventListener(key.slice(2).toLowerCase(), value);
            } else if (key === 'className') {
                node.className = value;
            } else if (key === 'textContent' || key === 'innerHTML') {
                node[key] = value;
            } else if (typeof value === 'boolean') {
                if (value) node.setAttribute(key, '');
                else node.removeAttribute(key);
            } else if (value !== undefined && value !== null) {
                node.setAttribute(key, value);
            }
        });
        (children || []).forEach(child => {
            if (child) node.appendChild(child);
        });
        return node;
    },
};
