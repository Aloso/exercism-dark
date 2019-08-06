# Contributing

This theme uses SASS files (`*.scss`), so it's best to install sass globally:

```bash
$ npm install sass -g
```

Please avoid using colors directly. Instead, use the SASS variables in the `variables.scss` file: `$bg`, `$bg2`, `$bg3` for dark backgrounds, `$t1`, `$t2`, `$t3`, `$t4` for light text, `$link` or `$t3` for links.

If you use VS Code, you can press `Ctrl+Shift+B` and select `sass` to run the SASS compiler every time a file is modified.

## Testing

To make testing as smooth as possible, I created a Greasemonkey script that fetches the stylesheet when you press <kbd>R</kbd>. To fetch the stylesheet, you need an http server on port 8080. You can set one up with

```bash
$ npm install http-server -g
$ http-server
```

Download the Greasemonkey browser addon and add this script:

```js
// ==UserScript==
// @name     Exercism-dark develop
// @include  https://exercism.io/*
// @version  1
// @grant    GM.xmlHttpRequest
// ==/UserScript==

(function load(el) {
  'use strict'

  GM.xmlHttpRequest({
    method: 'GET',
    url: `http://localhost:8080/main.css?t=${new Date()}`,
    onload(response) {
      if (el) {
        let prev = el.innerHTML;
        let next = response.responseText;
        if (prev === next) {
          notify("Stylesheet is identical", "color:white;background:#e44");
        } else {
          el.innerHTML = response.responseText
          notify("Style reloaded", "");
        }
      } else {
        el = document.createElement('style')
        el.innerHTML = response.responseText
        document.querySelector('head').appendChild(el)

        window.addEventListener('keypress', ev => {
          if (ev.target === document.body && ev.key === 'r') load(el)
        })
      }
    },
    onerror: e => console.warn('Error', e)
  })
})()

function notify(txt, cls) {
  let notification = document.createElement("span");
  notification.setAttribute("style", "color:black;background:#cfd;box-shadow:0 0 7px #0005;padding:10px;" +
                            "display:inline-block;position:fixed;font-size:1.3em;left:5px;top:5px;" + cls);
  notification.innerHTML = txt;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 1000);
}
```
