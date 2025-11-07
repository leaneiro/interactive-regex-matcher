import { AFDConfig, StateId, Symbol, TransitionKey } from "./types";

/**
 * FiniteAutomaton provides read-only access to deterministic transition rules.
 */
export class FiniteAutomaton {
  constructor(private readonly config: AFDConfig) {}

  get start(): StateId {
    return this.config.start;
  }

  get accepts(): Set<StateId> {
    return this.config.accept;
  }

  get states(): Set<StateId> {
    return this.config.states;
  }

  get alphabet(): Set<Symbol> {
    return this.config.alphabet;
  }

  /** Returns the next state for a given (state, symbol). */
  transition(state: StateId, symbol: Symbol): StateId | undefined {
    const key: TransitionKey = `${state}|${symbol}`;
    return this.config.transitions.get(key);
  }
}