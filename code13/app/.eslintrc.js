const prettierConfig = require('./.prettierrc')

module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      classes: true,
      jsx: true,
    },
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier', 'prettier/react'],
  plugins: ['json', 'prettier', 'react'],
  env: {
    browser: true,
    meteor: true,
    node: true,
    es6: true,
    jest: true,
  },
  globals: {
    __meteor_runtime_config__: false,
    ga: false,
    Meteor: false,
    Restivus: false,
  },
  rules: {
    'no-console': 'off',
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-fallthrough': 'off',
    'no-unused-expressions': 'off',
    'no-unused-vars': ['warn', { args: 'none' }],
    'object-shorthand': ['error', 'always', { avoidExplicitReturnArrows: true }],
    'prettier/prettier': ['error', prettierConfig],
    'react/display-name': 'off',
    'react/jsx-boolean-value': 'error',
    'react/jsx-no-comment-textnodes': 'off',
    'react/no-deprecated': 'off',
    'react/no-string-refs': 'off',
    'react/no-find-dom-node': 'off',
    'react/no-unescaped-entities': 'off',
    'react/prop-types': 'off',
  },
}
