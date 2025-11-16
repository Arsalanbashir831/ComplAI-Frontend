import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Flat config-friendly packages
const tseslint = require('typescript-eslint');
const nextPlugin = require('@next/eslint-plugin-next');
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
  // TypeScript + ESLint recommended config
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
];

export default eslintConfig;
