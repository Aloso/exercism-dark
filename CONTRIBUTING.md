# Contributing

This theme uses SASS files (`*.scss`), so it's best to install sass globally:

```bash
$ npm install sass -g
```

The repository includes tasks for **VS Code** and **IntelliJ** that run the SASS compiler in watch mode.

If you use a different IDE, run this command in the repository's root directory:

```bash
$ sass --watch --no-source-map main.scss:main.css
```

## Code guidelines

Please avoid using colors directly. Instead, use the SASS variables in the `variables.scss` file: `$bg`, `$bg2`, `$bg3` for dark backgrounds, `$t1`, `$t2`, `$t3`, `$t4` for light text, `$link` for links, etc.

## Testing

To make testing as smooth as possible, I created a Greasemonkey script that fetches the stylesheet with some useful key shortcuts. To use it, you need an http server in the repository's root directory. You can set one up with

```bash
$ npm install http-server -g
$ http-server
```

Then download the Greasemonkey browser addon and add [greasemonkey.js](greasemonkey.js) as user-script.

Shortcuts:

- <kbd>R</kbd>: Refresh the theme, without reloading the page
- <kbd>S</kbd>: Switch between the dark theme and the default theme
- <kbd>D</kbd>: Display the CSS classes and IDs of the currently hovered element, and its parents
    - The message disappears after 4 seconds, unless you move the cursor over it
    - When the cursor leaves the message, it disappears

### Other configurations

If you use a different server, make sure it runs on port 8080, or edit the corresponding line in `greasemonkey.js`.
