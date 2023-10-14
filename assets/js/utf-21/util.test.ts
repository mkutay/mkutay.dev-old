import * as util from "./util.ts";
import { assertEquals } from "https://deno.land/std@0.186.0/testing/asserts.ts";

const TEST_RUNS = 1000;
const MAX_RANDOM_STRING_CODEPOINTS = 100;
const MAX_UNICODE_CODEPOINT = 0x10ffff;

Deno.test("getUtf8Bytes", () => {
  for (let i = 0; i < TEST_RUNS; i++) {
    const str = randomString();

    const actual = util.getUtf8Bytes(str);

    const expected = new TextEncoder().encode(str);

    assertEquals(actual, expected);
  }
});

Deno.test("getUtf16Bytes", () => {
  for (let i = 0; i < TEST_RUNS; i++) {
    const str = randomString();

    const actual = stringify(util.getUtf16Bytes(str));

    const expected = (() => {
      let result = "";
      for (let i = 0; i < str.length; i++) {
        result += str.charCodeAt(i).toString(16).padStart(4, "0");
      }
      return result;
    })();

    assertEquals(actual, expected);
  }
});

Deno.test("getUtf32Bytes", () => {
  for (let i = 0; i < TEST_RUNS; i++) {
    const str = randomString();

    const actual = stringify(util.getUtf32Bytes(str));

    const expected = (() => {
      let result = "";
      for (const c of str) {
        result += c.codePointAt(0)!.toString(16).padStart(8, "0");
      }
      return result;
    })();

    assertEquals(actual, expected);
  }
});

function randomString(): string {
  const codepointLength =
    Math.round(Math.random() * (MAX_RANDOM_STRING_CODEPOINTS - 1)) + 1;

  const codepoints = new Uint32Array(codepointLength);

  for (
    let codepointIndex = 0;
    codepointIndex <= codepointLength;
    codepointIndex++
  ) {
    const codepoint = Math.round(Math.random() * MAX_UNICODE_CODEPOINT);
    codepoints[codepointIndex] = codepoint;
  }

  return String.fromCodePoint(...codepoints);
}

function stringify(bytes: Iterable<number>): string {
  return [...bytes]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
