module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  "@typescript-eslint/naming-convention": [
    "error",
    {
      "selector": "interface",
      "format": ["PascalCase"],
      "custom": {
        "regex": "^I[A-Z]",
        "match": true
      }
    },
    {
      "selector": "class",
      "format": ["PascalCase"]
    },
    {
      "selector": "typeParameter",
      "format": ["PascalCase"],
      "custom": {
        "regex": "^T[A-Z]",
        "match": true
      }
    },
    {
      "selector": "variable",
      "format": ["camelCase", "UPPER_CASE"],
      "leadingUnderscore": "allow"
    },
    {
      "selector": "function",
      "format": ["camelCase"]
    },
    {
      "selector": "parameter",
      "format": ["camelCase"],
      "leadingUnderscore": "allow"
    },
    {
      "selector": "property",
      "format": ["camelCase", "PascalCase", "snake_case"]
    },
    {
      "selector": "method",
      "format": ["camelCase"]
    },
    {
      "selector": "enumMember",
      "format": ["PascalCase"]
    },
    {
      "selector": "property",
      "modifiers": ["static"],
      "format": ["camelCase", "UPPER_CASE"]
    },
    {
      "selector": "memberLike",
      "modifiers": ["private"],
      "format": ["camelCase"],
      "leadingUnderscore": "require"
    },
    {
      "selector": "memberLike",
      "modifiers": ["protected"],
      "format": ["camelCase"],
      "leadingUnderscore": "require"
    },
    {
      "selector": "memberLike",
      "modifiers": ["public"],
      "format": ["camelCase"]
    },
    {
      "selector": "memberLike",
      "modifiers": ["protected"],
      "format": ["camelCase"],
      "leadingUnderscore": "require"
    },
    {
      "selector": "typeAlias",
      "format": ["PascalCase"],
      "custom": {
        "regex": "^T[A-Z]",
        "match": true
      }
    },
    {
      "selector": "enum",
      "format": ["PascalCase"],
      "custom": {
        "regex": "^E[A-Z]",
        "match": true
      }
    }
  ]
};
