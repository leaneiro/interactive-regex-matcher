import { FiniteAutomaton } from "./FiniteAutomaton";
import { StateId, Symbol } from "./types";

/**
 * AFDSimulator executes a deterministic finite automaton.
 * It maintains current state and provides step/run methods.
 */
export class AFDSimulator {
  private currentState: StateId;
  private readonly automaton: FiniteAutomaton;

  constructor(automaton: FiniteAutomaton) {
    this.automaton = automaton;
    this.currentState = automaton.start;
  }

  /** Resets to start state. */
  reset(): void {
    this.currentState = this.automaton.start;
  }

  /** Reads one symbol and performs a transition. */
  step(symbol: Symbol): void {
    const next = this.automaton.transition(this.currentState, symbol);
    if (!next) throw new Error(`No transition from (${this.currentState}, ${symbol})`);
    this.currentState = next;
  }

  /** Runs the automaton over an input string (split by characters). */
  run(input: string): { accepted: boolean; finalState: StateId } {
    this.reset();
    for (const ch of input) {
      this.step(ch);
    }
    return { accepted: this.automaton.accepts.has(this.currentState), finalState: this.currentState };
  }
}