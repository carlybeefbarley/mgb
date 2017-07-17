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
  },
  globals: {
    __meteor_runtime_config__: false,
    $: false,
    ga: false,
    Meteor: false,
    Restivus: false,
    Push: false,
  },
  rules: {
    'no-console': 'off',
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-fallthrough': 'off',
    'no-unused-expressions': 'off',
    'no-unused-vars': 'off',
    // TODO - enable once we install prettier from a release and not GH
    // 'prettier/prettier': [
    //   'error',
    //   {
    //     semi: false,
    //     printWidth: 110,
    //     singleQuote: true,
    //     trailingComma: 'all',
    //   },
    // ],
    'react/display-name': 'off',
    'react/jsx-boolean-value': 'error',
    'react/no-find-dom-node': 'off',
    'react/prop-types': 'off',
  },
}
