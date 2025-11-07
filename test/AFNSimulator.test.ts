import { describe, it, expect } from "vitest";
import { AFNSimulator } from "../src/automata/AFNSimulator";
import { AFNConfig } from "../src/automata/types";

/**
 * Example NFA for regex "a|b"
 *
 * States:
 *  s  --ε-->  q1
 *  s  --ε-->  q2
 *  q1 --a-->  f
 *  q2 --b-->  f
 *  f = accept
 */
describe("AFNSimulator", () => {
  it('accepts single "a" or "b"', () => {
    const transitions = new Map([
      ["q1|a", new Set(["f"])],
      ["q2|b", new Set(["f"])],
    ]);

    const epsilon = new Map([
      ["s", new Set(["q1", "q2"])],
    ]);

    const config: AFNConfig = {
      states: new Set(["s", "q1", "q2", "f"]),
      alphabet: new Set(["a", "b"]),
      start: "s",
      accept: new Set(["f"]),
      transitions,
      epsilon,
    };

    const nfa = new AFNSimulator(config);
    expect(nfa.run("a").accepted).toBe(true);
    expect(nfa.run("b").accepted).toBe(true);
    expect(nfa.run("ab").accepted).toBe(false);
    expect(nfa.run("").accepted).toBe(false);
  });
});