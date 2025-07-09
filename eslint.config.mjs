// @ts-check
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import solid from 'eslint-plugin-solid/configs/typescript'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  solid,
  // @ts-ignore
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-else-return': 'error',
      'no-process-env': 'error',
      'no-extra-semi': 'off',
      'no-lonely-if': 'error',
      'one-var': ['error', 'never'],
      'object-shorthand': ['error', 'always'],
      'prefer-object-spread': 'error',
      yoda: 'error',
      eqeqeq: ['error', 'always', { null: 'never' }],
      'prefer-destructuring': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowTypedFunctionExpressions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
          allowDirectConstAssertionInArrowFunctions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
)
