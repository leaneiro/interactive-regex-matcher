import { describe, it, expect } from "vitest";
import { lit, cat, alt, star, eps } from "../src/regex/core/ast";
import { thompsonFromAST } from "../src/regex/core/thompson";
import { AFNSimulator } from "../src/automata/AFNSimulator";

/**
 * Pattern: (ab|ba)* a
 * Accepts: "a", "aba", "ba", "baba", "abaabaa" (with proper pairing), etc.
 * Rejects: "", "b", "bb", "bba"
 *
 * AST: Concat( Star( Alt( Cat(a,b), Cat(b,a) ) ), a )
 */
describe("Thompson NFA builder", () => {
  it("builds NFA that matches (ab|ba)*a", () => {
    const ab = cat(lit("a"), lit("b"));
    const ba = cat(lit("b"), lit("a"));
    const body = star(alt(ab, ba));
    const pattern = cat(body, lit("a"));

    const nfaConfig = thompsonFromAST(pattern);
    const nfa = new AFNSimulator(nfaConfig);

    // accepted
    expect(nfa.run("a").accepted).toBe(true);
    expect(nfa.run("aba").accepted).toBe(true);
    expect(nfa.run("baa").accepted).toBe(true);

    // rejected
    expect(nfa.run("").accepted).toBe(false);
    expect(nfa.run("b").accepted).toBe(false);
    expect(nfa.run("bb").accepted).toBe(false);
    expect(nfa.run("bba").accepted).toBe(false);
    expect(nfa.run("ba").accepted).toBe(false);
    expect(nfa.run("baba").accepted).toBe(false);
  });

  it("handles epsilon only", () => {
    const nfaConfig = thompsonFromAST(eps());
    const nfa = new AFNSimulator(nfaConfig);

    expect(nfa.run("").accepted).toBe(true);   // ε matches empty
    expect(nfa.run("a").accepted).toBe(false); // anything else should fail
  });

  it("handles simple literal star a*", () => {
    const nfaConfig = thompsonFromAST(star(lit("a")));
    const nfa = new AFNSimulator(nfaConfig);

    expect(nfa.run("").accepted).toBe(true);
    expect(nfa.run("a").accepted).toBe(true);
    expect(nfa.run("aaaa").accepted).toBe(true);
    expect(nfa.run("b").accepted).toBe(false);
  });
});