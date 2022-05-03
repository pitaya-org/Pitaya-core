module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
      }
   ],
   '@typescript-eslint/ban-ts-comment': 'warn',
   'import/no-extraneous-dependencies': 'warn',
   'no-underscore-dangle': 'warn',
   'no-param-reassign': 'warn',
   'no-promise-executor-return': 'warn',
   'import/no-cycle': 'warn',
   'import/no-mutable-exports': 'warn',
   'no-restricted-syntax': 'warn'
  },
};
