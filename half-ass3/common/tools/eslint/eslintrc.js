module.exports = (projectPath) => ({
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  root: true,
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    tsconfigRootDir: projectPath,
  },
  env: {
    node: true,
    jest: true,
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {},
    },
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['index', 'sibling', 'parent', 'object']],
        pathGroups: [
          { pattern: '@types**/**', group: 'external', position: 'after' },
          { pattern: '@**', group: 'internal' },
          { pattern: '@**/**', group: 'internal' },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true
      },
    ],
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.spec.ts', '**/*.mock.ts'] }],
    "prettier/prettier": "error"
  }
});

