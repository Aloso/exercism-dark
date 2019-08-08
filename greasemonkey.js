// ==UserScript==
// @name     Exercism-dark develop
// @include  https://exercism.io/*
// @version  1
// @grant    GM.xmlHttpRequest
// ==/UserScript==

(() => {
    'use strict';

    const load = el => GM.xmlHttpRequest({
        method: 'GET',
        url: `http://localhost:8080/main.css?t=${new Date()}`,
        onload(response) {
            if (el) {
                let prev = el.innerHTML;
                let next = response.responseText;
                if (prev === next) {
                    notify('Stylesheet is identical', 'color:white;background:#e44');
                } else {
                    el.innerHTML = response.responseText;
                    notify('Style reloaded', 'background:#cfd');
                }
            } else {
                el = init(response.responseText);

                window.addEventListener('keypress', ev => {
                    if (ev.target === document.body && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
                        if (ev.key === 'r') load(el);
                        else if (ev.key === 's') toggle(el);
                        else if (ev.key === 'd') display(document.elementFromPoint(x, y));
                        else if (ev.key === 'f') find();
                    }
                });

                window.addEventListener('mousemove', ev => {
                    x = ev.clientX;
                    y = ev.clientY;
                })
            }
        },
        onerror: e => console.warn('Error', e)
    });

    const notify = (txt, cls, disableRemove) => {
        let notification = document.createElement('div');
        notification.setAttribute('style', 'color:black;background:white;box-shadow:0 0 7px #0005;' +
            'padding:10px;display:inline-block;position:fixed;z-index:100000001;overflow:hidden;font-size:1.3em;' +
            'left:5px;top:5px;' + cls);
        if (typeof txt === 'string') {
            notification.innerHTML = txt;
        } else {
            notification.appendChild(txt);
        }
        document.body.appendChild(notification);

        if (!disableRemove) {
            setTimeout(() => notification.remove(), 1000);
        }
        return notification;
    };

    const init = txt => {
        const el = document.createElement('style');
        el.innerHTML = txt;
        if (sessionStorage.devThemeDisabled == null) toggle(el);
        return el;
    };

    const toggle = el => {
        if (el.parentNode != null) {
            el.remove();
            sessionStorage.devThemeDisabled = '1';
        } else {
            document.querySelector('head').appendChild(el);
            delete sessionStorage.devThemeDisabled;
        }
    };

    let x = 0;
    let y = 0;
    /** @type {HTMLElement} */
    let notification = null;
    /** @type {HTMLElement} */
    let currentHl = null;

    const breakable = '<span style="user-select:none;-moz-user-select:none;margin-right:-3px"> </span>';
    const nowrapSpan = (color, content) => `<span style="color:${color};white-space:nowrap">${content}</span>`;

    const mkNodeDescription = node => {
        let s = '<span style="color:#3899ff;margin-left:-10px">' + node.tagName.toLowerCase() + '</span>';
        if (node.id != null && node.id !== '') {
            s += breakable + nowrapSpan('#d53d3b', '#' + node.id);
        }
        let classes = node.className.trim().split(/\s+/).filter(c => c.length > 0);
        if (classes.length > 0) {
            s += classes.map(c => breakable + nowrapSpan('#224b00', '.' + c)).join('');
        }

        const el = document.createElement('div');
        el.innerHTML = s;
        return el;
    };

    const display = el => {
        if (notification) notification.remove();
        if (currentHl) currentHl.remove();

        currentHl = highlight(el);

        const out = document.createElement('div');
        out.contentEditable = 'true';
        out.style.padding = '0 10px';

        for (let e = el; e !== document.documentElement && e != null; e = e.parentElement) {
            const el = mkNodeDescription(e);
            el.addEventListener('mouseenter', () => {
                currentHl.remove();
                currentHl = highlight(e);
                switchedPosition = optimizePos(notification, currentHl);
            });
            out.appendChild(el);
        }

        notification = notify(out, 'font-size:0.92em;', true);

        notification.style.opacity = '0.9';
        notification.style.maxWidth = '300px';
        notification.style.maxHeight = '250px';
        optimizePos(notification, currentHl);

        let timeout = setTimeout(() => {
            notification.remove();
            currentHl.remove();
        }, 5000);

        let switchedPosition = false;
        notification.addEventListener('mouseenter', () => {
            switchedPosition = false;
            clearTimeout(timeout);
            notification.style.maxHeight = '';
        });

        notification.addEventListener('mouseleave', () => {
            clearTimeout(timeout);
            if (!switchedPosition) {
                notification.remove();
                currentHl.remove();
            }
        });
    };

    const optimizePos = (notif, highlight) => {
        const box = highlight.getBoundingClientRect();
        const html = document.documentElement;
        let moved = false;

        optimizeHlPos(box, highlight);

        if (notif.style.top === '5px') {
            if (box.left < 310 && box.top < 260 && box.bottom <= html.clientHeight - 260) {
                notification.style.top = '';
                notification.style.bottom = '5px';
                moved = true;
            }
        } else {
            if (box.left < 310 && box.top >= 260 && box.bottom > html.clientHeight - 260) {
                notification.style.top = '5px';
                notification.style.bottom = '';
                moved = true;
            }
        }

        return moved;
    };
    const optimizeHlPos = (box, highlight) => {
        if (box.top > document.documentElement.clientHeight || box.bottom < 0) highlight.scrollIntoView();
    };

    const mkItem = (bTop, bRight, bBottom, bLeft, bColor) => {
        const t = Math.max(0, bTop);
        const r = Math.max(0, bRight);
        const b = Math.max(0, bBottom);
        const l = Math.max(0, bLeft);
        const item = document.createElement('div');
        item.setAttribute('style', `box-sizing:border-box;background:transparent;border-style:solid;
        border-color:${bColor};border-width:${t}px ${r}px ${b}px ${l}px;pointer-events:none;`);
        return item;
    };

    /** @return {number[]} */
    const getTopRightBottomLeft = (obj, prefix, suffix) =>
        ['Top', 'Right', 'Bottom', 'Left'].map(s => obj[prefix + s + suffix].replace('px', '') | 0);

    const highlight = el => {
        const pos = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const html = document.documentElement;

        const [paddingT, paddingR, paddingB, paddingL] = getTopRightBottomLeft(style, 'padding', '');
        const [marginT, marginR, marginB, marginL] = getTopRightBottomLeft(style, 'margin', '');
        const [borderT, borderR, borderB, borderL] = getTopRightBottomLeft(style, 'border', 'Width');

        const item = mkItem(marginT, marginR, marginB, marginL, 'rgba(255,255,50,0.2)');
        item.style.position = 'absolute';
        item.style.zIndex = '100000000';
        item.style.boxShadow = `inset 0 ${-borderB}px 0 #ff0, inset ${-borderL}px 0 0 #ff0,
                                inset 0 ${borderT}px 0 #ff0, inset ${borderR}px 0 0 #ff0`;
        item.style.padding = `${borderT}px ${borderR}px ${borderB}px ${borderL}px`;
        item.style.left = (pos.left - Math.max(0, marginL) + html.scrollLeft) + 'px';
        item.style.top = (pos.top - Math.max(0, marginT) + html.scrollTop) + 'px';

        const itemI = mkItem(paddingT, paddingR, paddingB, paddingL, 'rgba(123,46,153,0.3)');
        itemI.style.boxShadow = 'inset 0 0 0 10000px ' + 'rgba(59,119,191,0.3)';
        itemI.style.width = (pos.width - borderL - borderR) + 'px';
        itemI.style.height = (pos.height - borderT - borderB) + 'px';
        item.appendChild(itemI);

        document.body.appendChild(item);
        return item;
    };

    const find = () => {
        const par = document.createElement('div');
        par.style.width = '350px';
        par.style.display = 'flex';
        par.style.flexWrap = 'wrap';

        const style = document.createElement('style');
        style.innerHTML = 'input.dev-search::placeholder { color: rgba(0,0,0,0.6); font-size: 90% }';
        par.appendChild(style);

        const search = document.createElement('input');
        search.className = 'dev-search';
        search.placeholder = 'Regex search for CSS id/class';
        search.style.fontSize = '22px';
        search.style.border = 'none';
        search.style.padding = '0';
        search.style.margin = '0';
        search.style.background = 'transparent';
        search.style.color = 'black';
        search.style.outline = 'none';
        search.style.width = '20px';
        search.style.flexGrow = '1';

        const counter = document.createElement('span');
        counter.style.color = 'gray';

        const results = document.createElement('div');
        results.style.maxHeight = '250px';
        results.style.width = 'calc(100% + 10px)';
        results.style.overflow = 'auto';
        results.style.padding = '5px 0 10px 10px';
        results.style.margin = '0 -10px -10px 0';
        results.style.fontSize = '14px';

        par.appendChild(search);
        par.appendChild(counter);
        par.appendChild(results);

        const notif = notify(par, 'background:rgba(255, 255, 255, 0.7)', true);
        search.focus();

        /**
         * @param {HTMLElement} node
         * @param {RegExp} needle
         * @param {function(HTMLElement)} found
         */
        function searchNode(node, needle, found) {
            /** @type {string} */
            let s = node.nodeName;
            if (node.id != null && node.id !== '') {
                s += '#' + node.id;
            }
            if (node.classList.length) {
                const res = [];
                for (const c of node.classList) res.push(c);
                res.sort();
                s += '.' + res.join('.');
            }
            if (needle.test(s)) found(node);
            for (const child of node.children) {
                searchNode(child, needle, found);
            }
        }

        let highlights = [];
        function input() {
            highlights.forEach(h => h.remove());
            highlights = [];
            results.innerHTML = '';

            if (search.value.length < 3) {
                counter.innerHTML = 'Enter at least 3 characters';
                return;
            }
            counter.innerHTML = 'searching...';

            // use index instead
            const needle = new RegExp(search.value.replace(/\s+/g, '.*?'), "i");

            searchNode(document.body, needle, found => {
                let high = highlight(found);
                let desc = mkNodeDescription(found);

                highlights.push(high);
                results.appendChild(desc);

                desc.addEventListener('mouseenter', () => {
                    for (const hl of highlights) {
                        if (hl === high) {
                            if (hl.parentNode == null) document.body.appendChild(hl);
                            hl.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
                        } else hl.remove();
                    }
                    optimizeHlPos(high.getBoundingClientRect(), high);
                });
            });
            counter.innerHTML = highlights.length + ' results';
        }

        results.addEventListener('mouseleave', () => {
            for (const hl of highlights) {
                if (hl.parentNode == null) document.body.appendChild(hl);
                hl.style.boxShadow = '';
            }
        });

        function ctrlListener(ev) {
            if (!ev.ctrlKey && !ev.altKey && !ev.metaKey) {
                if (ev.key === 'Escape') {
                    notif.remove();
                    highlights.forEach(h => h.remove());
                }
            }
        }

        search.addEventListener('keydown', ctrlListener);
        search.addEventListener('input', input);
    };

    load();

})();