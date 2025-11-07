import { RegexAST, NodeKind, lit, cat, alt, star, eps } from "./ast";

/**
 * Tiny Pratt-style parser (precedence-climbing) for a regex subset:
 * - Literals: single characters except metacharacters: ()|*+?
 * - Grouping: ( ... )
 * - Unary:   A*  A+  A?
 * - Concat:  implicit (left-associative)
 * - Alt:     A | B  (left-associative)
 * - Escape:  \X makes X a literal even if metachar
 *
 * Precedence (low → high): Alt < Concat < Unary
 */

const META = new Set(["(", ")", "|", "*", "+", "?", "\\"]);

export class RegexParseError extends SyntaxError {
  constructor(message: string, public readonly position: number) {
    super(`${message} at ${position}`);
    this.name = "RegexParseError";
  }
}

export function parseRegex(source: string): RegexAST {
  const p = new Parser(source);
  const ast = p.parseAlt();
  if (!p.eof()) {
    throw new RegexParseError("Unexpected characters after end of expression", p.pos);
  }
  return ast;
}

class Parser {
  constructor(private readonly src: string, public pos = 0) {}

  eof(): boolean {
    return this.pos >= this.src.length;
  }

  peek(): string | null {
    return this.eof() ? null : this.src[this.pos];
  }

  next(): string {
    const ch = this.peek();
    if (ch === null) throw new RegexParseError("Unexpected end of input", this.pos);
    this.pos += 1;
    return ch;
  }

  /** alt := concat ( '|' concat )* */
  parseAlt(): RegexAST {
    if (this.peek() === "|"){
        throw new RegexParseError("Empty alternative '|' not allowed", this.pos)
    }
    let left = this.parseConcat();
    while (this.peek() === "|") {
      this.next(); // consume '|'
      const right = this.parseConcat();
      left = alt(left, right);
    }
    return left;
  }

  /** concat := (unary)+ | ε  (left-associative) */
  parseConcat(): RegexAST {
    const parts: RegexAST[] = [];
    while (true) {
      const ch = this.peek();
      if (ch === null) break;
      if (ch === ")" || ch === "|") break;
      const term = this.parseUnary();
      parts.push(term);
    }
    if (parts.length === 0) return eps();
    let node = parts[0]!;
    for (let i = 1; i < parts.length; i++) {
      node = cat(node, parts[i]!);
    }
    return node;
  }

  /** unary := primary ( '*' | '+' | '?' )*  (right-associative for chains) */
  parseUnary(): RegexAST {
    let node = this.parsePrimary();
    while (true) {
      const ch = this.peek();
      if (ch === "*" || ch === "+" || ch === "?") {
        this.next();
        if (ch === "*") {
          node = star(node);
        } else if (ch === "+") {
          // A+  =>  A A*
          node = cat(node, star(clone(node)));
        } else {
          // A?  =>  (A | ε)
          node = alt(node, eps());
        }
        continue;
      }
      break;
    }
    return node;
  }

  /** primary := literal | '(' alt ')' | escaped */
  parsePrimary(): RegexAST {
    const ch = this.peek();
    if (ch === null) throw new RegexParseError("Unexpected end of input", this.pos);

    if (ch === "(") {
      this.next();
      const inner = this.parseAlt();
      if (this.peek() !== ")") throw new RegexParseError("Expected ')'", this.pos);
      this.next();
      return inner;
    }

    if (ch === "\\") {
      this.next();
      const esc = this.next(); // treat next as literal even if meta
      return lit(esc);
    }

    if (META.has(ch)) {
      throw new RegexParseError(`Unexpected token '${ch}'`, this.pos);
    }

    // Normal literal
    this.next();
    return lit(ch);
  }
}

/** Deep-ish clone for small ASTs (only node kinds we use here). */
function clone(node: RegexAST): RegexAST {
  switch (node.kind) {
    case NodeKind.Literal:
      return lit(node.symbol);
    case NodeKind.Epsilon:
      return eps();
    case NodeKind.Star:
      return { kind: NodeKind.Star, inner: clone(node.inner) };
    case NodeKind.Concat:
      return { kind: NodeKind.Concat, left: clone(node.left), right: clone(node.right) };
    case NodeKind.Alternative:
      return { kind: NodeKind.Alternative, left: clone(node.left), right: clone(node.right) };
  }
}