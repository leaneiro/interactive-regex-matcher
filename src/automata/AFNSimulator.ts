import { AFNConfig, StateId, Symbol, TransitionKey } from "./types";

/**
 * AFNSimulator executes a nondeterministic finite automaton.
 * It maintains a set of active states and computes ε-closures.
 */
export class AFNSimulator {
  private readonly config: AFNConfig;
  private activeStates: Set<StateId>;

  constructor(config: AFNConfig) {
    this.config = config;
    this.activeStates = this.epsilonClosure(new Set([config.start]));
  }

  /** Computes epsilon-closure of a set of states. */
  private epsilonClosure(states: Set<StateId>): Set<StateId> {
    const closure = new Set(states);
    const stack = [...states];

    while (stack.length > 0) {
      const state = stack.pop()!;
      const epsNext = this.config.epsilon.get(state);
      if (!epsNext) continue;

      for (const n of epsNext) {
        if (!closure.has(n)) {
          closure.add(n);
          stack.push(n);
        }
      }
    }
    return closure;
  }

  /** Performs one transition step for a given symbol. */
  private step(symbol: Symbol): void {
    const nextStates = new Set<StateId>();
    for (const state of this.activeStates) {
      const key: TransitionKey = `${state}|${symbol}`;
      const targets = this.config.transitions.get(key);
      if (targets) {
        for (const n of targets) nextStates.add(n);
      }
    }
    this.activeStates = this.epsilonClosure(nextStates);
  }

  /** Runs the automaton on a given input string. */
  run(input: string): { accepted: boolean; active: Set<StateId> } {
    this.activeStates = this.epsilonClosure(new Set([this.config.start]));
    for (const ch of input) {
      this.step(ch);
    }
    const accepted = [...this.activeStates].some((s) => this.config.accept.has(s));
    return { accepted, active: this.activeStates };
  }
}