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
                        else if (ev.key === 'd') display(x, y);
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

    const notify = (txt, cls, long) => {
        let notification = document.createElement('div');
        notification.setAttribute('style', 'color:black;background:white;box-shadow:0 0 7px #0005;padding:10px;' +
            'display:inline-block;position:fixed;font-size:1.3em;left:5px;top:5px;' + cls);
        notification.innerHTML = txt;
        document.body.appendChild(notification);

        if (long) {
            let timeout = setTimeout(() => notification.remove(), 4000);
            notification.addEventListener('mouseenter', () => clearTimeout(timeout));
            notification.addEventListener('mouseleave', () => notification.remove());
        } else {
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

    const display = (x, y) => {
        const el = document.elementFromPoint(x, y);
        const out = [];
        for (let e = el; e !== document.documentElement && e != null; e = e.parentElement) {
            let s = '<span style="color:#69a7ff">' + e.tagName.toLowerCase() + '</span>';
            if (e.id != null && e.id !== '') {
                s += '<span style="color:#d53d3b">#' + e.id + '</span>';
            }
            let classes = e.className.trim().split(/\s+/).filter(c => c.length > 0);
            if (classes.length > 0) {
                s += '<span style="color:#224b00">.' + classes.join('.') + '</span>';
            }
            out.push(s);
        }

        notify('<div contenteditable>' + out.join('<br>') + '</div>', 'font-size:1em;', true);
    };

    load();

})();