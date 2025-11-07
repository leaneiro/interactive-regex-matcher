/**
 * Base layout scaffold for the Interactive Regex Matcher.
 * Next commits will add core automata types and NFA/DFA builders.
 */
export default function App() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Interactive Regex Matcher</h1>
        <p className="mt-2 text-sm text-gray-600">
          Scaffold OK. Next: core AF automata types and Thompson NFA builder.
        </p>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-gray-700">
          Project initialized with React, TypeScript, Tailwind, ESLint/Prettier, Husky, and Vitest.
        </p>
      </section>
    </main>
  );
}