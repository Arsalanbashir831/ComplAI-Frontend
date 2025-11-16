import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const nextPlugin = require('@next/eslint-plugin-next');
const tseslint = require('typescript-eslint');
const reactHooks = require('eslint-plugin-react-hooks');

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'dist/**',
      '.turbo/**',
      'build/**',
      'logs/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactHooks.configs.recommended.rules,
      // Disable overly strict React Compiler rules that flag common patterns
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'warn', // Downgrade to warning instead of error
      'react-hooks/incompatible-library': 'warn', // Already a warning, but ensure it doesn't block commits
    },
  },
];

export default eslintConfig;
