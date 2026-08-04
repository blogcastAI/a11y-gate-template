// OPTIONAL — React/JSX projects only.
//
// Static accessibility linting with eslint-plugin-jsx-a11y: the cheapest
// layer of the gate. It catches a class of defects at the source level —
// missing labels, redundant/invalid ARIA, mouse-only handlers — before a
// browser ever starts. It cannot see rendered output, so it complements
// (never replaces) the axe + keyboard e2e layers.
//
// To enable:
//   1. npm i -D eslint eslint-plugin-jsx-a11y
//   2. Rename this file to eslint.config.mjs and scope `files` to your source
//   3. Uncomment the lint step in .github/workflows/a11y-gate.yml

import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    files: ["src/**/*.{jsx,tsx}"],
    plugins: { "jsx-a11y": jsxA11y },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },
];
