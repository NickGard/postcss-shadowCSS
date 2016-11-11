import postcss from 'postcss';
import test    from 'ava';

import plugin from './';

function process(input, opts) {
  return postcss([ plugin(opts || {}) ]).process(input);
}

/* Write tests here*/

test('translates a shadow-element selector into its declared alias', (assert) => {
  const input = `
    .foo {
      shadow-element: foo;
    }

    .bar::-s-foo {
      font-size: 2em;
    }`;
  const expectedOutput = `
    .bar.foo {
      font-size: 2em;
    }`;

  return process(input)
    .then(result => {
      assert.deepEqual(result.css, expectedOutput);
      assert.deepEqual(result.warnings().length, 0);
    });
});

test('warns for unknown shadow-element selector', (assert) => {
  const input = `
    .bar::-s-foo {
      font-size: 2em;
    }`;

  return process(input)
    .then(result => {
      assert.deepEqual(result.warnings().length, 1);
    });
});

test('warns for unknown nested shadow-element selector', (assert) => {
  const input = `
    .bar::-s-foo {
      font-size: 2em;
    }

    .foo::-s-baz {
      shadow-element: foo;
    }`;

  return process(input)
    .then(result => {
      assert.deepEqual(result.warnings().length, 1);
    });
});

test('ignores known pseudo-element selector', (assert) => {
  const input = `
    .bar::-s-foo {
      display: none;
    }

    .foo::-webkit-inner-spinner {
      shadow-element: foo;
    }`;
  const expectedOutput = `
    .bar.foo::-webkit-inner-spinner {
      display: none;
    }`;

  return process(input)
    .then(result => {
      assert.deepEqual(result.css, expectedOutput);
      assert.deepEqual(result.warnings().length, 0);
    });
});

test('uses custom shadowPrefix if passed', (assert) => {
  const input = `
    .bar::-myApp-foo {
      display: none;
    }

    .foo::-webkit-inner-spinner {
      shadow-element: foo;
    }`;
  const expectedOutput = `
    .bar.foo::-webkit-inner-spinner {
      display: none;
    }`;

  return process(input, {shadowPrefix: 'myApp'})
    .then(result => {
      assert.deepEqual(result.css, expectedOutput);
      assert.deepEqual(result.warnings().length, 0);
    });
});

test('removes rules that have only shadow-element delcarations and comments', (assert) => {
  const input = `
    .foo {
      shadow-element: foo;
    }

    .bar {
      /* some comment */
      shadow-element: bar
    }`;
  const expectedOutput = '';

  return process(input)
    .then(result => {
      assert.deepEqual(result.css, expectedOutput);
      assert.deepEqual(result.warnings().length, 0);
    });
});

test('warns if known vendor prefix is used', (assert) => {
  const input = `
    .foo {
      shadow-element: foo;
    }`;

  return process(input, {shadowPrefix: 'webkit'})
    .then(result => {
      assert.deepEqual(result.warnings().length, 1);
    });
});

