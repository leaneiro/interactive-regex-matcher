import { AFNConfig, StateId, Symbol, TransitionKey } from "@/automata/types";
import { RegexAST, NodeKind } from "./ast";

/**
 * Thompson construction turns a regex AST into an equivalent NFA with ε-transitions.
 * We generate fresh state ids for each fragment and compose with union of maps/sets.
 */
type Fragment = {
  start: StateId;
  accepts: Set<StateId>;
  transitions: Map<TransitionKey, Set<StateId>>;
  epsilon: Map<StateId, Set<StateId>>;
  states: Set<StateId>;
  alphabet: Set<Symbol>;
};

class StateFactory {
  private counter = 0;
  constructor(private prefix = "r") {}
  next(): StateId {
    return `${this.prefix}${this.counter++}`;
  }
}

function addTransition(
  transitions: Map<TransitionKey, Set<StateId>>,
  from: StateId,
  sym: Symbol,
  to: StateId,
) {
  const key: TransitionKey = `${from}|${sym}`;
  const set = transitions.get(key) ?? new Set<StateId>();
  set.add(to);
  transitions.set(key, set);
}

function addEpsilon(
  epsilon: Map<StateId, Set<StateId>>,
  from: StateId,
  to: StateId,
) {
  const set = epsilon.get(from) ?? new Set<StateId>();
  set.add(to);
  epsilon.set(from, set);
}

function mergeFragments(a: Fragment, b: Fragment): Fragment {
  const transitions = new Map(a.transitions);
  for (const [k, v] of b.transitions) {
    const curr = transitions.get(k) ?? new Set<StateId>();
    for (const t of v) curr.add(t);
    transitions.set(k, curr);
  }

  const epsilon = new Map(a.epsilon);
  for (const [k, v] of b.epsilon) {
    const curr = epsilon.get(k) ?? new Set<StateId>();
    for (const t of v) curr.add(t);
    epsilon.set(k, curr);
  }

  const states = new Set<StateId>([...a.states, ...b.states]);
  const alphabet = new Set<Symbol>([...a.alphabet, ...b.alphabet]);

  return {
    start: a.start,
    accepts: new Set([...a.accepts, ...b.accepts]),
    transitions,
    epsilon,
    states,
    alphabet,
  };
}

function buildFragment(ast: RegexAST, sf: StateFactory): Fragment {
  switch (ast.kind) {
    case NodeKind.Literal: {
      const s = sf.next();
      const f = sf.next();
      const transitions = new Map<TransitionKey, Set<StateId>>();
      const epsilon = new Map<StateId, Set<StateId>>();
      addTransition(transitions, s, ast.symbol, f);
      return {
        start: s,
        accepts: new Set([f]),
        transitions,
        epsilon,
        states: new Set([s, f]),
        alphabet: new Set([ast.symbol]),
      };
    }
    case NodeKind.Epsilon: {
      const s = sf.next();
      const f = sf.next();
      const transitions = new Map<TransitionKey, Set<StateId>>();
      const epsilon = new Map<StateId, Set<StateId>>();
      addEpsilon(epsilon, s, f);
      return {
        start: s,
        accepts: new Set([f]),
        transitions,
        epsilon,
        states: new Set([s, f]),
        alphabet: new Set<Symbol>(),
      };
    }
    case NodeKind.Concat: {
      const left = buildFragment(ast.left, sf);
      const right = buildFragment(ast.right, sf);
      const merged = mergeFragments(left, right);
      for (const a of left.accepts) {
        addEpsilon(merged.epsilon, a, right.start);
      }
      return {
        ...merged,
        start: left.start,
        accepts: right.accepts,
      };
    }
    case NodeKind.Alternative: {
      const left = buildFragment(ast.left, sf);
      const right = buildFragment(ast.right, sf);
      const s = sf.next();
      const f = sf.next();

      let merged = mergeFragments(left, right);
      merged.states.add(s);
      merged.states.add(f);

      addEpsilon(merged.epsilon, s, left.start);
      addEpsilon(merged.epsilon, s, right.start);

      for (const a of left.accepts) addEpsilon(merged.epsilon, a, f);
      for (const a of right.accepts) addEpsilon(merged.epsilon, a, f);

      return {
        ...merged,
        start: s,
        accepts: new Set([f]),
      };
    }
    case NodeKind.Star: {
      const inner = buildFragment(ast.inner, sf);
      const s = sf.next();
      const f = sf.next();

      inner.states.add(s);
      inner.states.add(f);

      addEpsilon(inner.epsilon, s, inner.start);
      addEpsilon(inner.epsilon, s, f);

      for (const a of inner.accepts) {
        addEpsilon(inner.epsilon, a, inner.start);
        addEpsilon(inner.epsilon, a, f);
      }

      return {
        ...inner,
        start: s,
        accepts: new Set([f]),
      };
    }
  }
}

export function thompsonFromAST(ast: RegexAST): AFNConfig {
  const sf = new StateFactory("n");
  const frag = buildFragment(ast, sf);
  return {
    states: frag.states,
    alphabet: frag.alphabet,
    start: frag.start,
    accept: frag.accepts,
    transitions: frag.transitions,
    epsilon: frag.epsilon,
  };
}