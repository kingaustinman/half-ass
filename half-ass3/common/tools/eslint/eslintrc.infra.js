const base = require('./eslintrc.js');

module.exports = (projectPath) => {
  const baseConfig = base(projectPath);
  return {
    ...baseConfig,
    overrides: [
      {
        files: ['src/**/*.ts', 'bin/**/*.ts'],
        rules: {
          // Place here the rules that overrides the base rule for node projects.
          'no-new': 'off',
          '@typescript-eslint/restrict-template-expressions': 'off',
          'import/no-extraneous-dependencies': 'off',
          'no-restricted-syntax': 'off',
        },
      },
    ],
  };
};
