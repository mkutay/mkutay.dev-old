---
title: "Nested array permutations in JavaScript"
description: "What are all the permutations of [1, [2, 3], [4, 5]]?"
url: /nested-list-permutations-in-javascript
date: 2023-03-06
---

I recently ran into this problem and couldn't find a solution online:

**How do you compute the nested permutations of an array that contains sub-arrays?** This is all the ways to shuffle an array, including shuffling sub-arrays. (I'm sure there's a fancy term for this, but I don't know it.)

For example, `[1, [2, 3]]` has four nested permutations:

- `[1, [2, 3]]`
- `[1, [3, 2]]`
- `[[2, 3], 1]`
- `[[3, 2], 1]`

`[1, [2, 3], 4, [[5, 6], 7]]` has 192 nested permutations, such as:

- `[1, [3, 2], 4, [7, [6, 5]]]`
- `[[2, 3], [[6, 5], 7], 4, 1]`
- `[[[5, 6], 7], 4, [2, 3], 1]`
- ...many more...

_Skip to the end for the full solution._

I wanted my solution to use [iterators] to avoid big memory allocations. This works better for a large number of permutations. For example, `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]` has about 40 million permutations. I ran out of memory trying to allocate that result in a single array, but doing it lazily worked fine.

I also assumed that my input was an array, and that the array contained numbers or input arrays of the same shape. In TypeScript, that type might be represented as:

```typescript
type InputArray = Array<number | InputArray>;
```

(My solution didn't use TypeScript, but I think it's useful to see the type.)

It should be easy to extend this to support additional types, but I didn't care to for this exercise.

Finally, I didn't care about removing duplicates if the original array contained duplicates. For example, `[2, 2]` really only has one permutation, but I was fine if my solution returned two.

## The top level

I solved this with two conceptual parts:

1. "Flat", non-nested permutations. Only the top level will be reordered.

   For example, `[1, [2, 3]]` has two flat permutations: `[1, [2, 3]]` and `[[2, 3], 1]`. `[1, [3, 2]]` is _not_ a flat permutation because a sub-array is shuffled.

2. "Deep", nested-only permutations. Only sub-arrays will be reordered.

   For example, `[1, [2, 3]]` has two deep permutations: `[1, [2, 3]]` and `[1, [3, 2]]`. `[[3, 2], 1]` is _not_ a deep permutation because it reorders the array at the top level.

I made up both of these terms. I bet there are better names for both of these.

The top-level function is pretty short. All it does is delegate to those two functions:

```javascript
function* nestedPermutations(arr) {
  for (const flatPermutation of flatPermutations(arr)) {
    yield* deepPermutations(flatPermutation);
  }
}
```

So what do each of those look like?

## "Flat" permutations

A lot of people have figured out flat permutations. They're usually just called "permutations".

Rather than reinvent the wheel, I just reimplemented [Heap's algorithm][heaps], a permutations algorithm I found. I basically just translated [the pseudocode from Wikipedia](https://en.wikipedia.org/wiki/Heap%27s_algorithm#Details_of_the_algorithm). (Some JavaScript solutions [already existed](https://github.com/angus-c/just/tree/00d518dd454b56fcccd2824f23cb20307017d2e4/packages/array-permutations) but I couldn't find any that used iterables.)

Here's what I came up with:

```javascript
/**
 * An implementation of [Heap's algorithm][0] to find the "flat"
 * permutations of an array.
 *
 * [0]: https://en.wikipedia.org/wiki/Heap%27s_algorithm
 */
function* flatPermutations(arr) {
  const c = Array(arr.length).fill(0);

  yield arr;

  let i = 1;
  while (i < arr.length) {
    if (c[i] < i) {
      arr = swapping(arr, isEven(i) ? 0 : c[i], i);
      yield arr;

      c[i] += 1;
      i = 1;
    } else {
      c[i] = 0;
      i += 1;
    }
  }
}

function swapping(arr, index1, index2) {
  const result = arr.slice();
  result[index1] = arr[index2];
  result[index2] = arr[index1];
  return result;
}

function isEven(n) {
  return n % 2 === 0;
}
```

With that out of the way, it was time to build the "deep" permutations.

## "Deep" permutations

This was the part where I had to do some thinking, because I couldn't just copy pseudocode off the internet.

I think the best way to understand my solution is to think about counting time durations. When you count time durations, each unit has different counts. There are 60 minutes in an hour, 24 hours in a day, 7 days in a week, and so on. This is different from counting in decimal, where each digit has exactly 10 possible choices (0 through 9).

Computing "deep" permutations is a similar idea. Each sub-array has some number of permutations, and you have to compute all the different arrangements of all the different permutations.

It's a _little_ bit different because the lengths aren't known upfront—you don't know how many permutations a given sub-array will have before you compute it—but I think it's conceptually similar. I also had to do some work to treat numbers and empty arrays as special cases, because those don't have permutations.

Here's the code:

```javascript
function* deepPermutations(arr) {
  // Create "counters". Counters are either values (numbers or empty
  // arrays) or iterators and their values.
  let counters = arr.map((element) => {
    const isValue = typeof element === "number" || !element.length;
    if (isValue) return { value: element };

    const iterator = nestedPermutations(element)[Symbol.iterator]();
    return { element, iterator, iteratorResult: iterator.next() };
  });

  while (true) {
    // Yield the current state of all the counters.
    yield counters.map((counter) => {
      if ("value" in counter) {
        return counter.value;
      } else if (counter.iteratorResult.done) {
        throw new Error("Iterators should not be done at this point");
      } else {
        return counter.iteratorResult.value;
      }
    });

    // Advance non-value counters. Typically, only one will be advanced,
    // but if one "rolls over", more may be advanced.
    //
    // For example, counting from 12 to 13 only advances one digit,
    // counting from 19 to 20 advances two, and counting from 199 to 200
    // advances three. This is a similar idea.
    let shouldAdvance = true;
    counters = counters.map((counter) => {
      if ("value" in counter || !shouldAdvance) {
        return counter;
      }
      const newIteratorResult = counter.iterator.next();
      if (newIteratorResult.done) {
        const iterator = nestedPermutations(counter.element)[
          Symbol.iterator
        ]();
        return {
          ...counter,
          iterator,
          iteratorResult: iterator.next(),
        };
      } else {
        shouldAdvance = false;
        return { ...counter, iteratorResult: newIteratorResult };
      }
    });

    // Stop when we're done advancing.
    if (shouldAdvance) break;
  }
}
```

I'm not sure this is the best solution, but it worked for me.

With that, we're done!

## Putting it all together

Here's what the full, finished code looks like:

```javascript
function* nestedPermutations(arr) {
  for (const flatPermutation of flatPermutations(arr)) {
    yield* deepPermutations(flatPermutation);
  }
}

/**
 * An implementation of [Heap's algorithm][0] to find the "flat"
 * permutations of an array.
 *
 * [0]: https://en.wikipedia.org/wiki/Heap%27s_algorithm
 */
function* flatPermutations(arr) {
  const c = Array(arr.length).fill(0);

  yield arr;

  let i = 1;
  while (i < arr.length) {
    if (c[i] < i) {
      arr = swapping(arr, isEven(i) ? 0 : c[i], i);
      yield arr;

      c[i] += 1;
      i = 1;
    } else {
      c[i] = 0;
      i += 1;
    }
  }
}

function swapping(arr, index1, index2) {
  const result = arr.slice();
  result[index1] = arr[index2];
  result[index2] = arr[index1];
  return result;
}

function isEven(n) {
  return n % 2 === 0;
}

function* deepPermutations(arr) {
  // Create "counters". Counters are either values (numbers or empty
  // arrays) or iterators and their values.
  let counters = arr.map((element) => {
    const isValue = typeof element === "number" || !element.length;
    if (isValue) return { value: element };

    const iterator = nestedPermutations(element)[Symbol.iterator]();
    return { element, iterator, iteratorResult: iterator.next() };
  });

  while (true) {
    // Yield the current state of all the counters.
    yield counters.map((counter) => {
      if ("value" in counter) {
        return counter.value;
      } else if (counter.iteratorResult.done) {
        throw new Error("Iterators should not be done at this point");
      } else {
        return counter.iteratorResult.value;
      }
    });

    // Advance non-value counters. Typically, only one will be advanced,
    // but if one "rolls over", more may be advanced.
    //
    // For example, counting from 12 to 13 only advances one digit,
    // counting from 19 to 20 advances two, and counting from 199 to 200
    // advances three. This is a similar idea.
    let shouldAdvance = true;
    counters = counters.map((counter) => {
      if ("value" in counter || !shouldAdvance) {
        return counter;
      }
      const newIteratorResult = counter.iterator.next();
      if (newIteratorResult.done) {
        const iterator = nestedPermutations(counter.element)[
          Symbol.iterator
        ]();
        return {
          ...counter,
          iterator,
          iteratorResult: iterator.next(),
        };
      } else {
        shouldAdvance = false;
        return { ...counter, iteratorResult: newIteratorResult };
      }
    });

    // Stop when we're done advancing.
    if (shouldAdvance) break;
  }
}
```

I'm sure this isn't the best solution, but it worked for me. I bet this problem has been repeatedly solved by academics and just didn't know what to search. Please [let me know][contact] if you have ideas for improvement!

I hope this helps the next person hunting for a solution to this problem.

[contact]: {{< relref "contact" >}}
[iterators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
[heaps]: https://en.wikipedia.org/wiki/Heap%27s_algorithm
