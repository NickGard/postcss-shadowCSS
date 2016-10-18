import postcss from 'postcss';
import test    from 'ava';

import plugin from './';

function run(t, input, output, opts) {
  return postcss([ plugin(opts || {}) ]).process(input)
    .then( result => {
      t.deepEqual(result.css, output);
      t.deepEqual(result.warnings().length, 0);
    });
}

/* Write tests here*/

test('translates a shadow selector into its declared alias', t => {
  const input = `
  .foo {
    shadow-element: foo;
  }

  .bar::-s-foo {
    font-size: 2em;
  }`;
  const expectedOutput = `
  .foo {
  }

  .bar.foo {
    font-size: 2em;
  }`;

  return run(t, input, expectedOutput, { });
});
