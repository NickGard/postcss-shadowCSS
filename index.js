var postcss = require('postcss');

module.exports = postcss.plugin('postcss-shadowCSS', function (options) {
  "use strict";

  const opts = options || {}
  const shadowSelectors = [];
  const SHADOW_SELECTOR_RE = /::-([a-zA-Z]+)-[a-zA-Z\-]+/;

  const registerShadowSelector = (selector, warn) => {
    if (!selector.name || !isValidShadowSelector(selector.name)) {
      warn(`
        Cannot register the shadow selector "${selector.name}".
        Shadow selectors must be pseudo-selectors (::-[a-zA-Z\\-]+).
        Shadow selectors must not start with a known vendor prefix (like "-webkit-").
        No underscores or digits are allowed.
      `);
    } else if (!selector.alias) {
      warn(`Cannot register the shadow selector "${selector.name}" without an alias.`)
    } else {
      shadowSelectors.push(selector);
    }
  };

  const resolveShadowSelectors = (selector, warn) => {
    const shadowSelector = getShadowSelector(selector);
    if (isValidShadowSelector(shadowSelector)) {
      try {
        const alias = shadowSelectors.find(c => c.name === shadowSelector).alias;
        return resolveShadowSelectors(selector.replace(shadowSelector, alias), warn);
      } catch (e) {
        warn(`Could not resolve selector "${selector}" because ${e}.`);
      }
    }
    return selector;
  };

  const getShadowSelector = (selector) => (
    SHADOW_SELECTOR_RE.test(selector) ? SHADOW_SELECTOR_RE.exec(selector)[0] : ''
  );

  const getShadowRoot = (selector) => (
    SHADOW_SELECTOR_RE.test(selector) ? SHADOW_SELECTOR_RE.exec(selector)[1] : ''
  );

  const isValidShadowSelector = (selector) => ([
    'ms', 'mso', 'moz', 'o', 'xv', 'atsc', 'wap', 'webkit', 'khtml', 'konq',
    'apple', 'prince', 'ah', 'hp', 'ro', 'rim', 'tc'
  ].indexOf(getShadowRoot(selector)) === -1);

  return (root, result) => {
    let shadowPrefix = `::-${opts.shadowPrefix || 's'}-`;

    // Find all shadow declarations
    root.walkRules(rule => {
      rule.walkDecls(decl => {
        if (decl.prop === 'shadow-element') {
          registerShadowSelector({name: shadowPrefix + decl.value, alias: rule.selector}, (err) => rule.warn(result, err));
          decl.remove();
        }
      });
    });
    
    // Replace shadow selectors with their aliases
    root.walkRules(rule => {
      rule.selector = resolveShadowSelectors(rule.selector, (err) => rule.warn(result, err));
    });
  };
});
