/* ESLint config focused on React + TS with Prettier integration. */
module.exports = {
    root: true,
    env: { browser: true, es2022: true, node: true },
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      project: false
    },
    plugins: ["@typescript-eslint", "react-refresh"],
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react-hooks/recommended",
      "plugin:react-refresh/recommended",
      "prettier"
    ],
    settings: {},
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn"
    },
    ignorePatterns: ["dist", "node_modules"]
};