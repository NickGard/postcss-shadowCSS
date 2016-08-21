# PostCSS ShadowCSS [![Build Status][ci-img]][ci]

[PostCSS] plugin to provide element-like CSS references for components, their modifiable subcomponents, and their custstomizable states.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/NickGard/postcss-shadowCSS.svg
[ci]:      https://travis-ci.org/NickGard/postcss-shadowCSS

```css
.foo {
    /* Input example */
}
```

```css
.foo {
  /* Output example */
}
```

## Usage

```js
postcss([ require('postcss-shadowCSS') ])
```

See [PostCSS] docs for examples for your environment.
