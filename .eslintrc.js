module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': 0,
    'no-unused-vars': 1,
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    Joi: 'readonly',
    moment: 'readonly',
  },
};