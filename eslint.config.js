import js from '@eslint/js';
import pluginRouter from '@tanstack/eslint-plugin-router';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // TanStack Router configuration
  ...pluginRouter.configs['flat/recommended'],

  // Base JS configuration
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: { js, prettier: prettierPlugin },
    extends: ['js/recommended'],
    rules: {
      'prettier/prettier': [
        'error',
        {
          // These values should match your .prettierrc.js settings
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'none',
          printWidth: 80
        }
      ]
    }
  },

  // Browser globals
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: { globals: globals.browser }
  },

  // TypeScript configuration
  tseslint.configs.recommended,

  // React configuration
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: 'detect'
      }
    }
  },

  // Custom rules
  {
    rules: {
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-filename-extension': [
        'error',
        {
          extensions: ['.jsx', '.tsx']
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'import/order': 'off' // Turn off ESLint import ordering to let Prettier handle it
    }
  },

  // Prettier configuration (must be last to override conflicting rules)
  prettierConfig
]);
