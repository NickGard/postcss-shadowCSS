var postcss = require('postcss');

module.exports = postcss.plugin('postcss-shadowCSS', function (options) {
  'use strict';

  const opts = options || {};
  const shadowSelectors = [];

  const isValidShadowSelector = (selector) => ([
    '-ms-', '-mso-', '-moz-', '-o-', '-xv-', '-atsc-',
    '-wap-', '-webkit-', '-khtml-', '-konq-', '-apple-',
    '-prince-', '-ah-', '-hp-', '-ro-', '-rim-', '-tc-'
  ].indexOf(postcss.vendor.prefix(selector)) === -1);

  const registerShadowSelector = (selector, warn) => {
    if (isValidShadowSelector(selector.name)) {
      shadowSelectors.push(selector);
    } else {
      warn(`Cannot register the shadow selector '${selector.name}'.
        Shadow selectors must be pseudo-selectors ([a-zA-Z\\-]+).
        Shadow selectors must not start with a known vendor prefix (like 'webkit').
        No underscores or digits are allowed.`);
    }
  };

  const resolveShadowSelectors = (selector, warn) => {
    const shadowSelectorRE = /::(-[a-zA-Z]+-[a-zA-Z\-]+)/;
    const shadowSelector = shadowSelectorRE.test(selector) && shadowSelectorRE.exec(selector)[1];
    if (shadowSelector && isValidShadowSelector(shadowSelector)) {
      try {
        const alias = shadowSelectors.find(c => c.name === shadowSelector).alias;
        return resolveShadowSelectors(selector.replace(`::${shadowSelector}`, alias), warn);
      } catch (e) {
        warn(`Could not resolve shadow selector '${shadowSelector}' of '${selector}' because ${e}.`);
      }
    }
    return selector;
  };

  return (root, result) => {
    let shadowPrefix = `-${opts.shadowPrefix || 's'}-`;

    // Find all shadow declarations
    root.walkRules(rule => {
      rule.walkDecls('shadow-element', decl => {
        registerShadowSelector({ name: shadowPrefix + decl.value, alias: rule.selector }, (err) => decl.warn(result, err));
        // clean up
        decl.remove();
        if (rule.nodes.length === 0 || rule.nodes.every(n => n.type === 'comment')) {
          rule.remove();
        }
      });
    });

    // Replace shadow selectors with their aliases
    root.walkRules(rule => {
      rule.selector = resolveShadowSelectors(rule.selector, (err) => rule.warn(result, err));
    });
  };
});
