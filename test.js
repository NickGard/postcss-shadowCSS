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
    .foo {
    }

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
      assert.deepEqual(result.warnings().length, 2);
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
    }

    .foo::-webkit-inner-spinner {
    }`;
  return process(input)
    .then(result => {
      assert.deepEqual(result.css, expectedOutput);
      assert.deepEqual(result.warnings().length, 0);
    });
});

test('warns if known vendor prefix is declared as a shadow-root', (assert) => {
  const input = `
    .foo {
      shadow-root: webkit;
    }`;

  return process(input)
    .then(result => {
      assert.deepEqual(result.warnings().length, 1);
    });
});

test('warns if shadow-root alias is not a single-depth id, class, or attribute selector', (assert) => {
  const input = `
    .foo .bar {
      shadow-root: foo;
    }`;

  return process(input)
    .then(result => {
      assert.deepEqual(result.warnings().length, 1);
    });
});

test('translates a shadow-root selector into its declared alias', (assert) => {
  const input = `
    .foo {
      shadow-root: foo;
    }

    Foo.bar {
      font-size: 2em;
    }`;
  const expectedOutput = `
    .foo {
    }

    .foo.bar {
      font-size: 2em;
    }`;

  return process(input)
    .then(result => {
      assert.deepEqual(result.css, expectedOutput);
      assert.deepEqual(result.warnings().length, 0);
    });
});

'\n    .bar::-s-foo {\n      display: none;\n    }\n\n    .foo::-webkit-inner-spinner {\n    }'
'\n    .bar.foo::-webkit-inner-spinner {\n      display: none;\n    }\n\n    .foo::-webkit-inner-spinner {\n    }'