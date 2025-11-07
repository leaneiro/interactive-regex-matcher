/**
 * Core types for deterministic finite automata (DFA).
 * These are the minimal building blocks reused later for NFAs and regex parsing.
 */

export type StateId = string;
export type Symbol = string;
export type TransitionKey = string;

/** Deterministic Finite Automaton configuration. */
export interface AFDConfig {
  states: Set<StateId>;
  alphabet: Set<Symbol>;
  start: StateId;
  accept: Set<StateId>;
  transitions: Map<TransitionKey, StateId>; // key = `${state}|${symbol}`
}

/** NFA (Non-deterministic Finite Automaton) configuration. */
export interface AFNConfig {
  states: Set<StateId>;
  alphabet: Set<Symbol>;
  start: StateId;
  accept: Set<StateId>;
  transitions: Map<TransitionKey, Set<StateId>>; // possibly multiple next states
  epsilon: Map<StateId, Set<StateId>>; // ε-transitions
}