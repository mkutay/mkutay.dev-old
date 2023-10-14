---
title: 'Why does "👩🏾‍🌾" have a length of 7 in JavaScript?'
description: "👩🏾‍🌾 is made up of 1 grapheme cluster, 4 scalars, and 7 UTF-16 code units."
url: /javascript-string-lengths
date: 2023-05-27
lastmod: 2023-10-02
---

_[I turned this blog post into a talk][talk] which you might prefer._

_In short: 👩🏾‍🌾 is made of 1 grapheme cluster, 4 scalars, and 7 UTF-16 code units. That's why its length is 7._

The [`length` property][length] is used to determine the length of a JavaScript string. Sometimes, its results are intuitive:

```javascript
"E".length;
// => 1

"♬".length;
// => 1
```

...sometimes, its results are surprising:

```javascript
"🌸".length;
// => 2

"👩🏾‍🌾".length;
// => 7
```

To understand why this happens, you need to understand a few terms from the [Unicode glossary].

The first term is the [**extended grapheme cluster**](https://www.unicode.org/glossary/#extended_grapheme_cluster). This is probably what most people would call a character. `E`, `♬`, `🌸`, and `👩🏾‍🌾` are examples of extended grapheme clusters.

Extended grapheme clusters are made up of [**scalars**](https://www.unicode.org/glossary/#unicode_scalar_value). Scalars are integers between `0` and `1114111`, though many of these numbers are currently unused.

Many extended grapheme clusters contain just one scalar. For example, `🌸` is made up of the scalar `127800` and `E` is made up of scalar `69`. `👩🏾‍🌾`, however, is made up of _four_ scalars: `128105`, `127998`, `8205`, and `127806`.

(Scalars are usually written in hex with a "U+" prefix. For example, the scalar for `♬` is `9836`, which might be written as "U+266C".)

Internally, JavaScript stores these scalars as [**UTF-16 code units**](https://www.unicode.org/glossary/#code_unit). Each code unit is a 16-bit unsigned integer, which can store numbers between 0 and 65,535. Many scalars fit into a single code unit. Scalars that are too big get split apart into two 16-bit numbers. These are called [**surrogate pairs**](https://www.unicode.org/glossary/#surrogate_pair), which is a term you might see.

For example, `♬` is made up of the scalar `9836`. That fits into a single 16-bit integer, so we just store `9836`.

The scalar for `🌸` is `127800`. That's too big for a 16-bit integer so we have to break it up. It gets split up into `55356` and `57144`. (I won't discuss _how_ this splitting works, but it's not too complicated—the bits are divided in the middle and a different number is added to each half.)

That's why `"🌸".length === 2`—JavaScript is interrogating the number of UTF-16 code units, which is 2 in this case.

`👩🏾‍🌾` is made up of four scalars. One of those scalars fits in a single UTF-16 code unit, but the remaining three are too big and get split up. That makes for a total of 7 code units. That's why `"👩🏾‍🌾".length === 7`.

To summarize our examples:

| Extended grapheme cluster | Scalar(s)                            | UTF-16 code units                                            |
| ------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| `E`                       | `69`                                 | `69`                                                         |
| `♬`                       | `9836`                               | `9836`                                                       |
| `🌸`                      | `127800`                             | `55356`, `57144`                                             |
| `👩🏾‍🌾`                      | `128105`, `127998`, `8205`, `127806` | `55357`, `56425`, `55356`, `57342`, `8205`, `55356`, `57150` |

Most JavaScript string operations also work with UTF-16.

[`slice()`][slice], for example, works with UTF-16 code units too. That's why you might get strange results if you slice in the middle of a surrogate pair:

```javascript
"The best character is X".slice(-1);
// => "X"

"The best character is 🌸".slice(-1);
// => "\udf38"
```

However, not all JavaScript string operations use UTF-16 code units. For example, [iterating over a string][iterator] works a little differently:

```javascript
// The spread operator uses an iterator:
[..."👩🏾‍🌾"];
// => ["👩","🏾","","🌾"]

// Same for `for ... of`:
for (const c of "👩🏾‍🌾") {
  console.log(c);
}
// => "👩"
// => "🏾"
// => ""
// => "🌾"
```

As you can see, this iterates over scalars, not UTF-16 code units.

[`Intl.Segmenter()`][segmenter], an object that doesn't work in all browsers, can help you iterate over extended grapheme clusters if that's what you need:

```javascript
const str = "farmer: 👩🏾‍🌾";

// Warning: this is not supported on all browsers!
const segments = new Intl.Segmenter().segment(str);
[...segments];
// => [
//      { segment: "f", index: 0, input: "farmer: 👩🏾‍🌾" },
//      { segment: "a", index: 1, input: "farmer: 👩🏾‍🌾" },
//      { segment: "r", index: 2, input: "farmer: 👩🏾‍🌾" },
//      { segment: "m", index: 3, input: "farmer: 👩🏾‍🌾" },
//      { segment: "e", index: 4, input: "farmer: 👩🏾‍🌾" },
//      { segment: "r", index: 5, input: "farmer: 👩🏾‍🌾" },
//      { segment: ":", index: 6, input: "farmer: 👩🏾‍🌾" },
//      { segment: " ", index: 7, input: "farmer: 👩🏾‍🌾" },
//      { segment: "👩🏾‍🌾", index: 8, input: "farmer: 👩🏾‍🌾" }
//    ]
```

For more on this tricky stuff, check out ["It's Not Wrong that `"🤦🏼‍♂️".length == 7`"][0], ["The Absolute Minimum Every Software Developer Must Know About Unicode in 2023"][2], ["JavaScript has a Unicode problem"][1], and [a talk I gave on this topic][talk].

[talk]: {{< relref "posts/2023-08-23-chicagojs2023" >}}
[length]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length
[slice]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice
[iterator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/@@iterator
[segmenter]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
[Unicode glossary]: https://www.unicode.org/glossary/
[0]: https://hsivonen.fi/string-length/
[1]: https://mathiasbynens.be/notes/javascript-unicode
[2]: https://tonsky.me/blog/unicode/
