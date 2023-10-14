---
title: Use Node built-ins to test small projects
description: "You might not need a full test framework like Mocha or Jest."
url: /use-node-builtins-to-test-small-projects
date: 2022-08-16
---

_In short: small Node projects don't need a testing framework like Jest or Mocha. You can just use Node's built-in `assert` module and a test script._

I maintain a few npm packages. Some of them are very small—often just a single short function. For example, I maintain [`percentage`](https://www.npmjs.com/package/percentage), a tiny package that formats numbers like `0.12` as `12%`.

I write tests for these packages, of course. I used to use a testing framework, such as Mocha or Jest. But for my smaller packages, I've stopped doing that.

I've dropped these dependencies and put everything into a single test file, which I run with `node test.js`. For example, here are the abbreviated tests for `percentage`:

```javascript
import percentage from "./percentage.js";
import assert from "assert";

assert.strictEqual(percentage(0.12), "12%");
assert.strictEqual(percentage(1), "100%");
// ...
```

(The above code is simplified. You can see [the full tests in the repository](https://git.sr.ht/~evanhahn/percentage.js/tree/e54203612ab345e768f56b9eaec6b6942bcdb651/item/test.js).)

You lose some fancy test output and test organization, but you gain simplicity and fewer dependencies.

I also update the `test` script in `package.json`, so `npm test` works just fine. It just looks like this:

```json
...
"scripts": {
  ...
  "test": "node test"
},
...
```

This doesn't work for larger projects, but for small ones, it's a pattern I like.
