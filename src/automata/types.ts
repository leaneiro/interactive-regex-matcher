/**
 * Core types for deterministic finite automata (DFA).
 * These are the minimal building blocks reused later for NFAs and regex parsing.
 */

export type StateId = string;
export type Symbol = string;
export type TransitionKey = string;

/** Deterministic finite automaton configuration. */
export interface AutomatonConfig {
  states: Set<StateId>;
  alphabet: Set<Symbol>;
  start: StateId;
  accept: Set<StateId>;
  transitions: Map<TransitionKey, StateId>; // key = `${state}|${symbol}`
}