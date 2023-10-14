import * as assert from "assert";
import doubleEquals from "./doubleEquals.mjs";

const primitives = [
  true,
  false,
  null,
  undefined,
  0,
  -0,
  1,
  -1,
  123,
  -123,
  12.34,
  -12.34,
  1 / 3,
  Infinity,
  -Infinity,
  NaN,
  0n,
  123n,
  -123n,
  "",
  "foo",
  "0",
  "-0",
  "1",
  "-1",
  "123",
  "-123",
  "12.34",
  "-12.34",
  "0.33",
  String(1 / 3),
  "0.333333333333333333333333333333",
  "Infinity",
  "-Infinity",
  "NaN",
  "1,2",
  Symbol(),
  Symbol(""),
  Symbol("foo"),
];

const objects = [
  [],
  [1, 2],
  [1, 2, 3],
  {},
  { [Symbol.toPrimitive]: () => 1 },
  { [Symbol.toPrimitive]: "garbage" },
  {
    [Symbol.toPrimitive]() {
      throw new Error("garbage");
    },
  },
  {
    [Symbol.toPrimitive]: () => 1,
    valueOf() {
      throw new Error("Should not be called");
    },
    toString() {
      throw new Error("Should not be called");
    },
  },
  { valueOf: () => 1 },
  {
    valueOf: () => 1,
    toString() {
      throw new Error("Should not be called");
    },
  },
  { toString: () => "1" },
  Object.create(null),
  function () {},
  Object.assign(function () {}, { [Symbol.toPrimitive]: () => "1" }),
  Object.assign(function () {}, { valueOf: () => "1" }),
  Object.assign(function () {}, { toString: () => "1" }),
];

const values = [...primitives, ...primitives.map(Object), ...objects];

function compare(x, y) {
  let expectedResult;
  try {
    expectedResult = x == y;
  } catch (_) {}

  let actualResult;
  try {
    actualResult = doubleEquals(x, y);
  } catch (_) {}

  assert.strictEqual(expectedResult, actualResult);
}

for (const x of values) {
  for (const y of values) {
    compare(x, y);
    compare(y, x);
  }
}
