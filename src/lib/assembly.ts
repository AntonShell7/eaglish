/** Words used by the sentence-builder. Punctuation is not a separate tile. */
export function assemblyTokens(value: string): string[] {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘ʼ`´]/g, "'")
    .match(/[a-z0-9]+(?:'[a-z0-9]+)*'?/g) ?? [];
}

/** Alternative answers may reorder words, but may not introduce new ones. */
export function sameWordBank(a: string, b: string): boolean {
  const left = assemblyTokens(a).sort();
  const right = assemblyTokens(b).sort();
  return left.length === right.length && left.every((word, index) => word === right[index]);
}

/** Word order matters: only an explicitly accepted sequence passes. */
export function sameAssembly(selected: string[], answer: string): boolean {
  const expected = assemblyTokens(answer);
  const actual = selected.map((word) => assemblyTokens(word)[0] ?? "");
  return actual.length === expected.length && actual.every((word, index) => word === expected[index]);
}
