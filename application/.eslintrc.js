module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: 'eslint:recommended',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '(next|error|results)',
        varsIgnorePattern: 'result',
      },
    ],
  },
}
