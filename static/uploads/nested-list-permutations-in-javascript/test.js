import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import { nestedPermutations } from "./nestedPermutations.js";

Deno.test("simple results", () => {
  assertEquals([...nestedPermutations([])], [[]]);
  assertEquals([...nestedPermutations([1])], [[1]]);
});
Deno.test("flat inputs", () => {
  const original = [1, 2, 3];

  const actual = [...nestedPermutations(original)];

  assertContains(actual, [
    [1, 2, 3],
    [1, 3, 2],
    [2, 1, 3],
    [2, 3, 1],
    [3, 1, 2],
    [3, 2, 1],
  ]);
});

Deno.test("nested permutations", () => {
  const original = [1, [2, 3], 4, [[5, 6], 7]];

  const actual = [...nestedPermutations(original)];

  assertContains(actual, [
    [1, [2, 3], 4, [[5, 6], 7]],
    [[[5, 6], 7], 4, [2, 3], 1],
    [[7, [5, 6]], 4, [3, 2], 1],
    [1, [3, 2], 4, [[5, 6], 7]],
    [1, [2, 3], 4, [[6, 5], 7]],
    [1, [2, 3], 4, [7, [5, 6]]],
    [1, [2, 3], 4, [7, [6, 5]]],
  ]);
});

function assertContains(arr, expectedToContain) {
  for (const expected of expectedToContain) {
    const matches = arr.filter(
      (permutation) => (isEqual(expected, permutation)),
    );
    assertEquals(
      matches.length,
      1,
      `Expected ${JSON.stringify(expected)} to be found`,
    );
  }
}

function isEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
