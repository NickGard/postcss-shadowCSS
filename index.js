var postcss = require('postcss');

/*
  TODO:
  0. prevent name collisions. Disambiguate selectors.
  1. shadow-root
    a. only allowed on single class/attribute selector
    b. disallow page styles to flow into element delcared shadow-root
    c. use shadow-root name declaration to classify shadow-elements
        (e.g. shadow-root = "foo" and its shadow-element = "bar", then reference its shadow-element via ::-s-foo-bar)
  2. web-component: allow author to declare a new element type
    a. only allowed on single class/attribute selector
    b. acts as shadow-root
      (e.g. web-component: Foo, referred to via Foo, resolves to selector of declaration)
  3. pseudo-states
    a. same resolution scenario as shadow-elements, but ONLY on shadow-root/web-component
    b. used via :<pseudo-state> (e.g. :hover)
*/

module.exports = postcss.plugin('postcss-shadowCSS', function (options) {
  const opts = options || {}
  const shadowSelectors = [];

  const registerShadowSelector = (name, alias, warn) => {
    if (!name || !/::-[a-zA-Z\-]+|^[A-Z][a-zA-Z\-]*|(?: )[A-Z][a-zA-Z\-]*/.test(name)) {
      warn(`
        Cannot register the shadow selector ${name}.
        Shadow selectors must be either component selectors ([A-Z][a-zA-Z\-]*)
        or pseudo-selectors (::-[a-zA-Z\-]+). No underscores or digits are allowed.
      `);
    } else if (!alias) {
      warn(`Cannot register the shadow selector ${name} without an alias.`)
    } else if (shadowSelectors.indexOf(name) > -1) {
      warn(`
        Shadow selector ${name} already registered as aliasing ${shadowSelectors[name]}.
        Cannot register as alias for ${alias}
      `);
    } else {
      shadowSelectors.push({name, alias});
    }
  };

  const resolveShadowSelectors = (selector, warn) => {
    const shadowSelectorRE = /::-[a-zA-Z\-]+|^[A-Z][a-zA-Z\-]*|(?: )[A-Z][a-zA-Z\-]*/;
    if (shadowSelectorRE.test(selector)) {
      try {
        const shadowSelector = shadowSelectorRE.exec(selector)[0].trim();
        const alias = shadowSelectors.find(c => c.name === shadowSelector).alias;
        return resolveShadowSelectors(selector.replace(shadowSelector, alias), warn);
      } catch (e) {
        warn(`Could not resolve selector: ${selector}\n${e}`);
      }
    }
    return selector;
  };

  const resetInheritablePropsForRule = (rule) => {
    const inheritableProps = [
      'azimuth', 'border-collapse', 'border-spacing', 'caption-side', 'color',
      'cursor', 'direction', 'elevation', 'empty-cells', 'font-family',
      'font-size', 'font-style', 'font-variant', 'font-weight', 'font',
      'letter-spacing', 'line-height', 'list-style-image',
      'list-style-position', 'list-style-type', 'list-style', 'orphans',
      'pitch-range', 'pitch', 'quotes', 'richness', 'speak-header',
      'speak-numeral', 'speak-punctuation', 'speak', 'speech-rate', 'stress',
      'text-align', 'text-indent', 'text-transform', 'visibility',
      'voice-family', 'volume', 'white-space', 'word-spacing'
    ];

    inheritableProps.forEach((p) => rule.prepend({prop: p, value: 'initial'}));
  };

  const isKnownVendorPrefix = (shadowSelector, warn) => {
    const knownVendorPrefixes = ['ms', 'mso', 'moz', 'o', 'xv', 'atsc', 'wap', 'webkit', 'khtml', 'konq', 'apple', 'prince', 'ah', 'hp', 'ro', 'rim', 'tc'];
    if (knownVendorPrefixes.indexOf(shadowSelector) > -1) {
      warn(`Cannot declare "${shadowSelector}" as a shadow-root. It is a known vendor prefix, already in use.`);
      return true;
    }
    return false;
  };

  const isFlatSelector = (selector, shadowSelector, warn) => {
    if (/^[#\.A-Z][\-_a-zA-Z0-9]*$|^\[[^\]]+\]$/.test(rule.selector)) {
      return true;
    }
    warn(`Cannot declare "${shadowSelector}" to be a shadow-root when its alias ("${selector}") is not a single-depth id, class, or attribute selector.`);
    return false;
  };

  return (root, result) => {
    let shadowPrefix = `::-${opts.shadowPrefix || 's'}-`;
    // Find all shadow declarations
    root.walkRules(rule => {
      rule.walkDecls(decl => {
        const warn = (err) => rule.warn(result, err);
        if (decl.prop === 'shadow-root') {
          if (!isKnownVendorPrefix(decl.value, warn) && isFlatSelector(rule.selector, decl.value, warn)) {
            // Set new shadow root
            shadowPrefix = `::-${decl.value}-`;
            // Push Web Component selector name and alias
            registerShadowSelector(
              `${decl.value[0].toUpperCase()}${decl.value.slice(1)}`,
              rule.selector,
              warn
            );
            // Create shadow boundary, if desired AND indicated
            if (opts.shadowBoundary) {
              const next = decl.next();
              if (next && next.prop === 'all' && next.value === 'initial') {
                resetInheritablePropsForRule(rule);
                next.remove();
              }
            }
          }
          decl.remove();
        }
        if (decl.prop === 'shadow-element') {
          registerShadowSelector(shadowPrefix + decl.value, rule.selector, warn);
          decl.remove();
        }
      });
    });
    
    // Replace shadow selectors with their aliases
    root.walkRules(rule => {
      rule.selector = resolveShadowSelectors(rule.selector, err => rule.warn(result, err));
    });
  };
});

