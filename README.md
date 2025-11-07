# Interactive Regex Matcher

A minimal scaffold for an interactive regular expression engine with finite automata visualization.

## Tech Stack
- React + TypeScript + Vite
- TailwindCSS
- ESLint + Prettier
- Husky + lint-staged
- Vitest

## Development
```bash
npm install
npm run prepare
npx husky add .husky/pre-commit "npx lint-staged"
npm run dev