export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Browser globals
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',

        // Chrome extension API
        chrome: 'readonly',
      }
    },
    rules: {
      // Allow console.log for development
      'no-console': 'off',

      // Fix case declarations in switch statements
      'no-case-declarations': 'off',

      // Other useful rules
      'no-unused-vars': 'warn',
      'max-len': ['warn', {
        'code': 180,
        'ignoreComments': true
      }],
    },
  },
  {
    // Content and options specific settings
    files: ['src/content/**/*.js', 'src/options/**/*.js'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
      }
    }
  },
  {
    // Background script specific settings
    files: ['src/background/**/*.js'],
    languageOptions: {
      globals: {
        chrome: 'readonly',
      }
    }
  }
];
