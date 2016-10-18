# PostCSS ShadowCSS [![Build Status][ci-img]][ci]

[PostCSS] plugin to provide element-like CSS references for components, their modifiable subcomponents, and their custstomizable states.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/NickGard/postcss-shadowCSS.svg
[ci]:      https://travis-ci.org/NickGard/postcss-shadowCSS

```jsx
// foo.jsx
export default function () => (
  <div className="foo">
    <strong>F</strong><em>oo</em>
  </div>
);

// bar.jsx
<Foo className="bar" />
```

```css
// foo.styl
.foo strong {
  shadow-element: first-letter
}
.foo em {
  shadow-element: trailing-letters
}

// bar.styl
.bar::-s-first-letter {
  font-size: 2em;
}
.bar::-s-trailing-letters::after {
  content: 'oooooo';
}
```

```css
.bar.foo strong {
  font-size: 2em;
}
.bar.foo em::after {
  content: 'oooooo';
}
```

## Usage

```js
postcss([ require('postcss-shadowCSS') ])
```

See [PostCSS] docs for examples for your environment.
