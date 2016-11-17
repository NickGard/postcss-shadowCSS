# PostCSS ShadowCSS [![Build Status][ci-img]][ci]

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/NickGard/postcss-shadowCSS.svg
[ci]:      https://travis-ci.org/NickGard/postcss-shadowCSS

[PostCSS] plugin to provide pseudo-element-like CSS references for component internals.
Write your component and imbue it with opinionated styles, then mark up the pieces that
consumers may want to style with `shadow-element: some-name` to make them available to style.
As the component author, you are then free to change the CSS selector or markup, while 
being confident that you are not wreaking havoc downstream. As a consumer of a component
using shadowCSS you can write simplified selectors instead of delving into the internals
of the component you are styling.

## Example
### Input
##### The Component
```jsx
// foo.jsx
export default function () => (
  <div className="foo">
    <strong>F</strong><em>oo</em>
  </div>
);
```
```css
// foo.css
.foo strong {
  shadow-element: first-letter;
}
.foo em {
  shadow-element: trailing-letters;
}
```

##### The Consumer
```jsx
// bar.jsx
<Foo className="bar" />
```
```
// bar.css
.bar::-s-first-letter {
  font-size: 2em;
}
.bar::-s-trailing-letters::after {
  content: 'oooooo';
}
```

===

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
