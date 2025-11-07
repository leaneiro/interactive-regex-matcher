import { describe, it, expect } from "vitest";
import { parseRegex, RegexParseError } from "../src/regex/core/parser";
import { NodeKind } from "../src/regex/core/ast";
import { thompsonFromAST } from "../src/regex/core/thompson";
import { AFNSimulator } from "../src/automata/AFNSimulator";

/** run text regex through parser → NFA → simulate. */
function accepts(pattern: string, word: string): boolean {
  const ast = parseRegex(pattern);
  const nfa = new AFNSimulator(thompsonFromAST(ast));
  return nfa.run(word).accepted;
}

describe("regex parser → AST → NFA (integration)", () => {
  it("parses and matches (ab|ba)*a", () => {
    expect(accepts("(ab|ba)*a", "a")).toBe(true);
    expect(accepts("(ab|ba)*a", "aba")).toBe(true);
    expect(accepts("(ab|ba)*a", "baa")).toBe(true);
    expect(accepts("(ab|ba)*a", "ababa")).toBe(true);

    expect(accepts("(ab|ba)*a", "")).toBe(false);
    expect(accepts("(ab|ba)*a", "b")).toBe(false);
    expect(accepts("(ab|ba)*a", "bb")).toBe(false);
    expect(accepts("(ab|ba)*a", "ba")).toBe(false);
    expect(accepts("(ab|ba)*a", "baba")).toBe(false);
  });

  it("respects precedence: concat > alt", () => {
    // a b | a  => (ab) | a
    expect(accepts("ab|a", "ab")).toBe(true);
    expect(accepts("ab|a", "a")).toBe(true);
    expect(accepts("ab|a", "b")).toBe(false);
  });

  it("handles unary operators *, +, ?", () => {
    // a* : zero or more a's
    expect(accepts("a*", "")).toBe(true);
    expect(accepts("a*", "aaaa")).toBe(true);
    expect(accepts("a*", "b")).toBe(false);

    // a+ : one or more a's
    expect(accepts("a+", "")).toBe(false);
    expect(accepts("a+", "a")).toBe(true);
    expect(accepts("a+", "aaaa")).toBe(true);

    // a? : zero or one 'a'
    expect(accepts("a?", "")).toBe(true);
    expect(accepts("a?", "a")).toBe(true);
    expect(accepts("a?", "aa")).toBe(false);
  });

  it("supports grouping and escapes", () => {
    // literal metacharacters via escape
    expect(accepts("\\(", "(")).toBe(true);
    expect(accepts("\\*", "*")).toBe(true);
    expect(accepts("\\|", "|")).toBe(true);
    // grouping still works
    expect(accepts("(a\\|b)b", "a|bb")).toBe(true);
    expect(accepts("(a\\|b)b", "abb")).toBe(false); 
  });
});

describe("parser errors", () => {
  it("throws on unbalanced parens", () => {
    expect(() => parseRegex("(ab")).toThrow(RegexParseError);
    expect(() => parseRegex("ab)")).toThrow(RegexParseError);
  });

  it("throws on stray operators", () => {
    expect(() => parseRegex("*ab")).toThrow(RegexParseError);
    expect(() => parseRegex("|ab")).toThrow(RegexParseError);
    expect(() => parseRegex("+")).toThrow(RegexParseError);
    expect(() => parseRegex("?")).toThrow(RegexParseError);
  });

  it("parses empty string as Epsilon", () => {
    const ast = parseRegex("");
    expect(ast.kind).toBe(NodeKind.Epsilon);
    // epsilon accepts only empty
    const nfa = new AFNSimulator(thompsonFromAST(ast));
    expect(nfa.run("").accepted).toBe(true);
    expect(nfa.run("a").accepted).toBe(false);
  });
});