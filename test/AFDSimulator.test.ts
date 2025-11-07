import { describe, it, expect } from "vitest";
import { FiniteAutomaton } from "../src/automata/FiniteAutomaton";
import { AFDSimulator } from "../src/automata/AFDSimulator";
import { AutomatonConfig } from "../src/automata/types";

/**
 * Test language: strings ending with "ab"
 * Regex equivalent: (a|b)*ab
 *
 * States:
 * q0 - start
 * q1 - saw 'a'
 * q2 - saw "ab" (accept)
 */
describe("AFDSimulator", () => {
  it("accepts strings ending with 'ab'", () => {
    const transitions = new Map([
      ["q0|a", "q1"],
      ["q0|b", "q0"],
      ["q1|a", "q1"],
      ["q1|b", "q2"],
      ["q2|a", "q1"],
      ["q2|b", "q0"],
    ]);

    const config: AutomatonConfig = {
      states: new Set(["q0", "q1", "q2"]),
      alphabet: new Set(["a", "b"]),
      start: "q0",
      accept: new Set(["q2"]),
      transitions,
    };

    const finiteAutomaton = new FiniteAutomaton(config);
    const simulator = new AFDSimulator(finiteAutomaton);

    expect(simulator.run("ab").accepted).toBe(true);
    expect(simulator.run("aab").accepted).toBe(true);
    expect(simulator.run("babbab").accepted).toBe(true);

    expect(simulator.run("a").accepted).toBe(false);
    expect(simulator.run("b").accepted).toBe(false);
    expect(simulator.run("aba").accepted).toBe(false);
    expect(simulator.run("").accepted).toBe(false);
  });
});