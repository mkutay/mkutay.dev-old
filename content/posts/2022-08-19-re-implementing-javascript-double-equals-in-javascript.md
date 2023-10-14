---
title: Re-implementing JavaScript's == in JavaScript
description: A useless exercise, re-implementing JavaScript's == in pure JavaScript.
url: /re-implementing-javascript-double-equals-in-javascript
date: 2022-08-19
---

_This post is for people who are familiar with JavaScript's `==` operator._

JavaScript's "double equals" operator, `==`, is typically discouraged. And for good reason: its behavior is tricky. Where `===` asks "are these the same thing?", the double-equals operator asks a question that's not straightforward.

More specifically, `==` implements something called the [Abstract Equality Comparison Algorithm][0], a 13-step process for determining if two things are equivalent.

Let's try to implement this algorithm in pure JavaScript. (Without using the `==` operator, of course.) This is mostly a useless idea, but I wanted to try it!

## Step 0: the skeleton

We'll implement a function called `doubleEquals`. I put the following in `doubleEquals.mjs`:

```js
export default function doubleEquals(x, y) {
  // TODO: steps 1 - 13
}
```

I also wrote [a test script](/uploads/re-implementing-javascript-double-equals-in-javascript/test.mjs) that tries a bunch of different values, to make sure it works.

## Step 1: use `===` if they're the same type

The first the step of the algorithm says the following:

> 1. If Type(_x_) is the same as Type(_y_), then
>
>    a. Return the result of performing Strict Equality Comparison _x_ === _y_.

[The spec says](https://262.ecma-international.org/11.0/#sec-ecmascript-data-types-and-values) "the notation 'Type(_x_)' is used as shorthand for 'the type of _x_'", where the types are "Undefined, Null, Boolean, String, Symbol, Number, BigInt, and Object".

This is similar to the [`typeof` operator][typeof], but Type(null) should be Null where `typeof null` is `"object"`, and Type(_function_) should be Object where `typeof myFunction` is `"function"`.

So we basically want our function to start like this:

```js
export default function doubleEquals(x, y) {
  if (type(x) === type(y)) {
    return x === y;
  }

  // TODO: steps 2 - 13
}

function type(x) {
  if (x === null) {
    return "null";
  } else if (typeof x === "function") {
    return "object";
  } else {
    return typeof x;
  }
}
```

This will cover cases like `1 == 1`, `"foo" == "bar"`, and `null == {}`.

## Steps 2 & 3: `null` and `undefined`

The next steps read:

> 2. If _x_ is **null** and _y_ is **undefined**, return **true**.
> 3. If _x_ is **undefined** and _y_ is **null**, return **true**.

In other words, there are special cases for comparing `null` and `undefined`.

This is pretty easy to implement. We can just add the following section at the bottom:

```js
export default function doubleEquals(x, y) {
  // ...step 1...

  if (
    (x === null && y === undefined) ||
    (x === undefined && y === null)
  ) {
    return true;
  }

  // TODO: steps 4 - 13
}
```

Now we're covering `undefined == null` and `null == undefined`.

## Steps 4 & 5: strings and numbers

Next, we need to handle cases where one side is a string and the other is a number. The spec continues:

> 4. If Type(_x_) is Number and Type(_y_) is String, return the result of the comparison _x_ == ! ToNumber(_y_).
> 5. If Type(_x_) is String and Type(_y_) is Number, return the result of the comparison ! ToNumber(_x_) == _y_.

[The spec describes ToNumber at great length](https://262.ecma-international.org/11.0/#sec-tonumber), especially for strings. However, it's nearly identical to the [`Number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#function_syntax) function. So we'll use it instead of reimplementing that part of the spec.

```js
export default function doubleEquals(x, y) {
  // ...steps 1 - 3...

  if (type(x) === "number" && type(y) === "string") {
    return doubleEquals(x, Number(y));
  }

  if (type(x) === "string" && type(y) === "number") {
    return doubleEquals(Number(x), y);
  }

  // TODO: steps 6 - 13
}
```

This will cover cases like `1 == "1"` and `"0.3333333333333333333333333" == 1/3`.

## Steps 6 & 7: strings and BigInts

You can also compare strings and BigInts. Another special case!

> 6. If Type(_x_) is BigInt and Type(_y_) is String, then
>
>    a. Let _n_ be ! StringToBigInt(_y_).
>
>    b. If _n_ is **NaN**, return **false**.
>
>    c. Return the result of the comparison _x_ == _n_.
>
> 7. If Type(_x_) is String and Type(_y_) is BigInt, return the result of the comparison _y_ == _x_.

In English, step 6 says: try to convert the string to a BigInt. If you can't, return `false`. If you can, compare them as BigInts. Step 7 is basically the reverse.

[StringToBigInt](https://262.ecma-international.org/11.0/#sec-stringtobigint) is a function that only exists in the spec (not the standard library), but it's very similar to the global `BigInt` function. If we were to reimplement it, it'd look like this:

```js
function stringToBigInt(str) {
  try {
    return BigInt(str);
  } catch (err) {
    return NaN;
  }
}
```

Once that's implemented, we can use it in our `doubleEquals` function:

```js
export default function doubleEquals(x, y) {
  // ...steps 1 - 5...

  if (type(x) === "bigint" && type(y) === "string") {
    const n = stringToBigInt(y);
    if (Number.isNaN(n)) {
      return false;
    }
    return doubleEquals(x, n);
  }

  if (type(x) === "string" && type(y) === "bigint") {
    return doubleEquals(y, x);
  }

  // TODO: steps 8 - 13
}
```

This covers cases like `"5" == 5n` and `123n == "garbage"`.

## Steps 8 & 9: booleans

If either argument is a boolean, it's supposed to be converted to a number (0 for `false`, 1 for `true`) and then compared with `==`.

> 8. If Type(_x_) is Boolean, return the result of the comparison ! ToNumber(_x_) == _y_.
> 9. If Type(_y_) is Boolean, return the result of the comparison _x_ == ! ToNumber(_y_).

Like before, we can use `Number` as a standin for ToNumber. `Number(false)` is `0`, and `Number(true)` is `1`.

```js
export default function doubleEquals(x, y) {
  // ...steps 1 - 7...

  if (type(x) === "boolean") {
    return doubleEquals(Number(x), y);
  }

  if (type(y) === "boolean") {
    return doubleEquals(x, Number(y));
  }

  // TODO: steps 10 - 13
}
```

This covers cases like `1 == true`, `false == 0`, and `9 == true`.

## Steps 10 & 11: objects to primitives

The steps above are a little weird, I suppose, but the implementations have been fairly short. Steps 10 and 11 are where things get funky.

The spec lists the next steps:

> 10. If Type(_x_) is either String, Number, BigInt, or Symbol and Type(_y_) is Object, return the result of the comparison _x_ == ToPrimitive(_y_).
> 11. If Type(_x_) is Object and Type(_y_) is either String, Number, BigInt, or Symbol, return the result of the comparison ToPrimitive(_x_) == _y_.

In other words: if one side is a string, number, BigInt, or Symbol, and the other is an object, convert the object to a primitive and compare them.

[The spec defines a detailed process of converting an object to a primitive.](https://262.ecma-international.org/11.0/#sec-toprimitive) We don't need to implement every part of that spec, though. We basically need to try three methods (`obj[Symbol.toPrimitive]()`, `obj.valueOf()`, and `obj.toString()`).

ToPrimitive can be implemented as follows. I've annotated it with lines from the spec.

```javascript
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
```

As you can see, `TypeError`s are thrown in various situations. That's why you'll see errors when you try to run `3 == Object.create(null)`. The right-hand side doesn't have any of these methods, so it can't be converted to a primitive, so it throws an error.

Armed with this function, we can we can implement steps 10 and 11.

```js
export default function doubleEquals(x, y) {
  // ...steps 1 - 9...

  if (
    ["string", "number", "bigint", "symbol"].includes(type(x)) &&
    type(y) === "object"
  ) {
    return doubleEquals(x, toPrimitive(y));
  }
  if (
    type(x) === "object" &&
    ["string", "number", "bigint", "symbol"].includes(type(y))
  ) {
    return doubleEquals(toPrimitive(x), y);
  }

  // TODO: steps 12, 13
}
```

This handles many infamously confusing cases, like `{} == "[object Object]"` and `9 == [9]`.

## Step 12: numbers and BigInts

Step 12 is a little weird, but it's mostly back to normal. It lets you compare numbers and BigInts.

> 12. If Type(_x_) is BigInt and Type(_y_) is Number, or if Type(_x_) is Number and Type(_y_) is BigInt, then
>
>     a. If _x_ or _y_ are any of **NaN**, **+∞**, or **-∞**, return **false**.
>
>     b. If the mathematical value of _x_ is equal to the mathematical value of _y_, return **true**; otherwise return **false**.

Each of these parts is fairly easy, if not a bit tedious to express. To implement this in JavaScript:

```js
export default function doubleEquals(x, y) {
  // ...steps 1 - 11...

  if (
    (type(x) === "bigint" && type(y) === "number") ||
    (type(x) === "number" && type(y) === "bigint")
  ) {
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

    return BigInt(x) === BigInt(y);
  }

  // TODO: step 13
}
```

This handles cases like `123 == 123n`.

## Step 13: I guess they're not equal

The final step is my favorite:

> 13. Return **false**.

We haven't found these two values to be equal, so let's return `false` to say they're not.

When that's all done, our function (and its dependencies) will look like this. I've added comments.

{{< codesnippet "static/uploads/re-implementing-javascript-double-equals-in-javascript/doubleEquals.mjs" "javascript" >}}

## Conclusion

[My full `doubleEquals` function](/uploads/re-implementing-javascript-double-equals-in-javascript/doubleEquals.mjs), and its dependencies, is 104 lines of code (182 lines if you count blank lines and comments).

As I said at the beginning of the post, reimplementing this was mostly a useless exercise. I hope it demonstrates that `==` is discouraged for a reason: it's a fairly complex algorithm which yields some surprising results. Just use `===` instead!

[0]: https://262.ecma-international.org/11.0/#sec-abstract-equality-comparison
[typeof]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
