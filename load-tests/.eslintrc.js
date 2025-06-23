module.exports = {
  extends: ['eslint:recommended'],
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  globals: {
    __ENV: 'readonly',
    __ITER: 'readonly',
    __VU: 'readonly',
  },
  rules: {
    'no-console': 'off', // Allow console in load tests
    'import/no-anonymous-default-export': 'off',
    'no-undef': 'error',
    'no-unused-vars': 'warn',
  },
};