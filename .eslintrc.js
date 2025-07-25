module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "unused-imports"],
  rules: {
    "no-unused-vars": "off",
    "unused-imports/no-unused-imports": "warn",
    "react/jsx-fragments": ["off"],
    "@typescript-eslint/explicit-module-boundary-types": ["off"],
    "@typescript-eslint/no-empty-function": ["warn"],
    "jsx-a11y/label-has-associated-control": ["off"],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "prefer-const": ["warn"],
    "react/display-name": ["off"],
  },
  overrides: [
    {
      files: ["*.scss"],
      rules: {
        "prettier/prettier": ["off"],
      },
    },
    {
      files: ["*.spec.*"],
      rules: {
        "@typescript-eslint/no-explicit-any": ["off"],
      },
    },
  ],
};
