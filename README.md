# PostCSS ShadowCSS [![Build Status][ci-img]][ci]

[PostCSS] plugin to provide pseudo-element-like CSS references for component internals.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/NickGard/postcss-shadowCSS.svg
[ci]:      https://travis-ci.org/NickGard/postcss-shadowCSS

## Example
#### Markup
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

#### Input CSS
```css
// foo.css
.foo strong {
  shadow-element: first-letter
}
.foo em {
  shadow-element: trailing-letters
}

// bar.css
.bar::-s-first-letter {
  font-size: 2em;
}
.bar::-s-trailing-letters::after {
  content: 'oooooo';
}
```

#### Output CSS
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
postcss([ require('postcss-shadowCSS') ], {shadowPrefix: 'myApp'})
```

See [PostCSS] docs for examples for your environment.
