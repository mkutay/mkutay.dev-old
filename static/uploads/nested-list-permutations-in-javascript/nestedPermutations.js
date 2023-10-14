export function* nestedPermutations(arr) {
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
  return (n % 2) === 0;
}

function* deepPermutations(arr) {
  // Create "counters". Counters are either values (numbers or empty
  // arrays) or iterators and their values.
  let counters = arr.map(
    (element) => {
      const isValue = (typeof element === "number") || !element.length;
      if (isValue) return { value: element };

      const iterator = nestedPermutations(element)[Symbol.iterator]();
      return { element, iterator, iteratorResult: iterator.next() };
    },
  );

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
        const iterator = nestedPermutations(counter.element)[Symbol.iterator]();
        return { ...counter, iterator, iteratorResult: iterator.next() };
      } else {
        shouldAdvance = false;
        return { ...counter, iteratorResult: newIteratorResult };
      }
    });

    // Stop when we're done advancing.
    if (shouldAdvance) break;
  }
}
