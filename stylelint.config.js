module.exports = {
  extends: 'stylelint-config-xo-space',
  overrides: [
    {
      files: [ '**/*.less' ],
      customSyntax: 'postcss-less',
      rules: {
        'declaration-property-value-blacklist': null,
        'property-blacklist': null,
        'declaration-block-no-redundant-longhand-properties': null,
        'declaration-property-value-disallowed-list': null,
        'function-no-unknown': null,
        'color-function-notation': null,
      },
    },
  ],
  rules: {
    'string-quotes': [ 'double', { avoidEscape: false } ],
    'declaration-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'selector-list-comma-newline-after': null,
    'rule-empty-line-before': null,
    'value-keyword-case': null,
    'declaration-block-no-duplicate-properties': [ true, { ignore: [ 'consecutive-duplicates' ] } ],
    'declaration-property-value-blacklist': null,
    'property-blacklist': null,
    'no-unknown-animations': null,
    'font-weight-notation': null,
    'no-descending-specificity': null,
    'selector-max-compound-selectors': null,
    'block-no-empty': [ true, { ignore: [] } ],
    'alpha-value-notation': null,
  },
}
