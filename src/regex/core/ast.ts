/**
 * Abstract Syntax Tree for regular expressions.
 */

export enum NodeKind {
    Literal = "Literal",
    Concat = "Concat",
    Alternative = "Alt",
    Star = "Star",
    Epsilon = "Epsilon",
  }
  
export interface Node {
    kind: NodeKind;
}
  
export type RegexAST = Literal | Concat | Alternative | Star | Epsilon;
  
export interface Literal extends Node {
    kind: NodeKind.Literal;
    symbol: string; // single-character symbol from the alphabet
}
  
export interface Concat extends Node {
    kind: NodeKind.Concat;
    left: RegexAST;
    right: RegexAST;
}
  
export interface Alternative extends Node {
    kind: NodeKind.Alternative;
    left: RegexAST;
    right: RegexAST;
}
  
export interface Star extends Node {
    kind: NodeKind.Star;
    inner: RegexAST;
}
  
export interface Epsilon extends Node {
    kind: NodeKind.Epsilon;
}
  
  /** Helpers to build nodes with minimal noise in tests/factories. */
  export const lit = (s: string): Literal => ({ kind: NodeKind.Literal, symbol: s });
  export const cat = (a: RegexAST, b: RegexAST): Concat => ({ kind: NodeKind.Concat, left: a, right: b });
  export const alt = (a: RegexAST, b: RegexAST): Alternative => ({ kind: NodeKind.Alternative, left: a, right: b });
  export const star = (a: RegexAST): Star => ({ kind: NodeKind.Star, inner: a });
  export const eps = (): Epsilon => ({ kind: NodeKind.Epsilon });