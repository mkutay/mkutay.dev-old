// A re-implementation of the [Abstract Equality Comparison algorithm][0],
// which powers JavaScript's `==`.
//
// [0]: https://262.ecma-international.org/11.0/#sec-abstract-equality-comparison
export default function doubleEquals(x, y) {
  // > 1. If Type(x) is the same as Type(y), then
  if (type(x) === type(y)) {
    // > a. Return the result of performing Strict Equality Comparison
    // > x === y.
    return x === y;
  }

  // > 2. If x is null and y is undefined, return true.
  // > 3. If x is undefined and y is null, return true.
  if (
    (x === null && y === undefined) ||
    (x === undefined && y === null)
  ) {
    return true;
  }

  // > 4. If Type(x) is Number and Type(y) is String, return the result
  // > of the comparison x == ! ToNumber(y).
  //
  // `Number` works well as an implementation of ToNumber.
  if (type(x) === "number" && type(y) === "string") {
    return doubleEquals(x, Number(y));
  }

  // > 5. If Type(x) is String and Type(y) is Number, return the result
  // > of the comparison ! ToNumber(x) == y.
  if (type(x) === "string" && type(y) === "number") {
    return doubleEquals(Number(x), y);
  }

  // > 6. If Type(x) is BigInt and Type(y) is String, then
  if (type(x) === "bigint" && type(y) === "string") {
    // > a. Let n be ! StringToBigInt(y).
    const n = stringToBigInt(y);
    // > b. If n is NaN, return false.
    if (Number.isNaN(n)) {
      return false;
    }
    // > c. Return the result of the comparison x == n.
    return doubleEquals(x, n);
  }

  // > 7. If Type(x) is String and Type(y) is BigInt, return the result
  // > of the comparison y == x.
  if (type(x) === "string" && type(y) === "bigint") {
    return doubleEquals(y, x);
  }

  // > 8. If Type(x) is Boolean, return the result of the comparison
  // > ! ToNumber(x) == y.
  if (type(x) === "boolean") {
    return doubleEquals(Number(x), y);
  }

  // > 9. If Type(y) is Boolean, return the result of the comparison
  // > x == ! ToNumber(y).
  if (type(y) === "boolean") {
    return doubleEquals(x, Number(y));
  }

  // > 10. If Type(x) is either String, Number, BigInt, or Symbol and
  // > Type(y) is Object, return the result of the comparison
  // > x == ToPrimitive(y).
  if (
    ["string", "number", "bigint", "symbol"].includes(type(x)) &&
    type(y) === "object"
  ) {
    return doubleEquals(x, toPrimitive(y));
  }

  // > 11. If Type(x) is Object and Type(y) is either String, Number,
  // > BigInt, or Symbol, return the result of the comparison
  // > ToPrimitive(x) == y.
  if (
    type(x) === "object" &&
    ["string", "number", "bigint", "symbol"].includes(type(y))
  ) {
    return doubleEquals(toPrimitive(x), y);
  }

  // > 12. If Type(x) is BigInt and Type(y) is Number, or if Type(x) is
  // > Number and Type(y) is BigInt, then
  if (
    (type(x) === "bigint" && type(y) === "number") ||
    (type(x) === "number" && type(y) === "bigint")
  ) {
    // > a. If x or y are any of NaN, +∞, or -∞, return false.
    const areBothValid = [x, y].every((number) => {
      if (typeof number === "bigint") {
        return true;
      }
      return (
        !Number.isNaN(number) &&
        Number.isFinite(number) &&
        Number.isInteger(number)
      );
    });
    if (!areBothValid) {
      return false;
    }

    // > b. If the mathematical value of x is equal to the mathematical
    // > value of y, return true; otherwise return false.
    return BigInt(x) === BigInt(y);
  }

  // > 13. Return false.
  return false;
}

// See [the spec][1] for more details on this function. It's
// similar to `typeof`, but (1) `null` is its own type
// (2) functions should be treated as objects.
//
// [1]: https://262.ecma-international.org/11.0/#sec-ecmascript-data-types-and-values
function type(x) {
  if (x === null) {
    return "null";
  } else if (typeof x === "function") {
    return "object";
  } else {
    return typeof x;
  }
}

// See [the spec][2] for more details on this function.
//
// [2]: https://262.ecma-international.org/11.0/#sec-stringtobigint
function stringToBigInt(str) {
  try {
    return BigInt(str);
  } catch (err) {
    return NaN;
  }
}

// [The spec][3] outlines detailed steps for converting a value to a
// primitive. This implements a simplified version of that, as used by
// `doubleEquals`.
//
// [3]: https://262.ecma-international.org/11.0/#sec-toprimitive
function toPrimitive(input) {
  // > Let exoticToPrim be ? GetMethod(input, @@toPrimitive).
  const exoticToPrim = input[Symbol.toPrimitive];
  // > If exoticToPrim is not undefined, then
  if (exoticToPrim !== undefined) {
    // > Let result be ? Call(exoticToPrim, input, « hint »).
    const result = exoticToPrim.call(input, "default");
    // > If Type(result) is not Object, return result.
    if (type(result) !== "object") {
      return result;
    }
    // > Throw a TypeError exception.
    throw new TypeError("Cannot convert object to primitive");
  }

  // What follows is a simplified version of the
  // ["OrdinaryToPrimitive" algorithm from the spec][4].
  //
  // [4]: https://262.ecma-international.org/11.0/#sec-ordinarytoprimitive

  if (typeof input.valueOf === "function") {
    const result = input.valueOf();
    if (type(result) !== "object") {
      return result;
    }
  }

  if (typeof input.toString === "function") {
    const result = input.toString();
    if (type(result) !== "object") {
      return result;
    }
  }

  throw new TypeError("Cannot convert object to primitive");
}
