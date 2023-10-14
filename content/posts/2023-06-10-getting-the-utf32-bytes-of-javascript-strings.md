---
title: Getting the UTF-32 bytes of JavaScript strings
description: "Here's how I worked with the UTF-32 bytes of a JavaScript string."
url: /getting-the-utf32-bytes-of-javascript-strings
date: 2023-06-10
---

_This post assumes you understand UTF-32._

Recently, I wanted to get the UTF-32 bytes of a JavaScript string for [a demo I was working on][utf-21]. I couldn't find anyone else who had done this, so I thought I'd write this post.

My goal was to write a generator function that yielded each UTF-32 byte.

First, I started by generating the string's Unicode code points. [Iterating over a JavaScript string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/@@iterator) yields the Unicode code points as strings.

```javascript
function* unicodeCodePoints(str) {
  for (const character of str) {
    const codePoint = character.codePointAt(0);
    yield codePoint;
  }
}

[...unicodeCodePoints("hi 🌍")];
// => [104, 105, 32, 127757]
```

Now I needed to turn these into bytes. I did a little bit masking and shifting to turn these four-byte numbers into four one-byte numbers:

```javascript
function* utf32Bytes(str) {
  for (const character of str) {
    const codepoint = character.codePointAt(0);

    // Get the most significant byte.
    // For example, given 0x12345678, yield 0x12.
    yield (codepoint & 0xff000000) >> 24;

    // Get the next most significant byte, and so on.
    yield (codepoint & 0x00ff0000) >> 16;
    yield (codepoint & 0x0000ff00) >> 8;
    yield codepoint & 0x000000ff;
  }
}

[...utf32Bytes("hi 🌍")];
// => [0, 0, 0, 104, 0, 0, 0, 105, 0, 0, 0, 32, 0, 1, 243, 13]
```

And that's it! I could now get the UTF-32 bytes of a JavaScript string.

## I want the results as a buffer

My solution uses a generator. If you want the results as a `Uint8Array`, simply pass the result to the `Uint8Array` constructor:

```javascript
new Uint8Array(utf32Bytes("hi 🌍"));
// => Uint8Array(16) [0, 0, 0, 104, 0, ...]
```

## I want the little endian bytes

My solution yields _big endian_ results (UTF-32BE), not _little endian_ (UTF-32LE). If you want little endian results, you can just switch the order of the `yield`s.

```javascript
function* utf32LeBytes(str) {
  for (const character of str) {
    const codepoint = character.codePointAt(0);

    // Get the least significant byte.
    // For example, given 0x12345678, yield 0x78.
    yield codepoint & 0x000000ff;

    // Get the next least significant byte, and so on.
    yield (codepoint & 0x0000ff00) >> 8;
    yield (codepoint & 0x00ff0000) >> 16;
    yield (codepoint & 0xff000000) >> 24;
  }
}

[...utf32LeBytes("hi 🌍")];
// => [104, 0, 0, 0, 105, 0, 0, 0, 32, 0, 0, 0, 13, 243, 1, 0]
```

You can also attach the [byte order mark][BOM] to your result by adding a few `yield`s at the beginning.

## I want something else

I also needed to get the UTF-8 and UTF-16 bytes for my little demo, so I wrote up how to do those too:

- ["Working with the UTF-8 bytes of JavaScript strings"][utf8]
- ["Getting the UTF-16 bytes of JavaScript strings"][utf16]

[utf8]: {{< relref "posts/2023-06-10-working-with-utf8-bytes-of-javascript-strings" >}}
[utf16]: {{< relref "posts/2023-06-10-getting-the-utf16-bytes-of-javascript-strings" >}}
[utf-21]: {{< relref "posts/2023-06-09-utf-21" >}}
[length]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length
[Buffer.from]: https://nodejs.org/docs/latest-v20.x/api/buffer.html#static-method-bufferfromstring-encoding
[swap16]: https://nodejs.org/docs/latest-v20.x/api/buffer.html#bufswap16
[BOM]: https://www.unicode.org/glossary/#byte_order_mark
