import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // We intentionally call setState inside effects to load async data.
      // This pattern is fine for our use case (loading data from Supabase
      // and reflecting it in component state) and disabling the rule keeps
      // the code straightforward.
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': 'off',
      // Allow {} as a generic shape in some places.
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
])
