---
title: Getting the UTF-16 bytes of JavaScript strings
description: "Here's how I worked with the UTF-16 bytes of a JavaScript string."
url: /getting-the-utf16-bytes-of-javascript-strings
date: 2023-06-10
---

_This post assumes you understand UTF-16._

Recently, I wanted to get the UTF-16 bytes of a JavaScript string for [a demo I was working on][utf-21]. I couldn't find anyone else who had done this, so I thought I'd write this post.

## I just want the length

If you need the number of UTF-16 code units, just use the length of the string! The [`length` property][length] asks for the number of UTF-16 code units, so you can do this:

```javascript
function numberOfUtf16CodeUnits(str) {
  return str.length;
}

numberOfUtf16CodeUnits("hello world");
// => 11
```

Because UTF-16 code units are always two bytes each, you can just multiply the length by two to get the number of UTF-16 bytes.

```javascript
function numberOfUtf16Bytes(str) {
  return str.length * 2;
}

numberOfUtf16CodeUnits("hello world");
// => 22
```

## I want the bytes

However, I didn't just want the number of UTF-16 bytes: I wanted the actual bytes!

My goal was to write a generator function that yielded each UTF-16 byte.

First, I started by generating the string's UTF-16 code units.

```javascript
function* utf16CodeUnits(str) {
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    yield charCode;
  }
}

[...utf16CodeUnits("hi 🌍")];
// => [104, 105, 32, 55356, 57101]
```

Now I needed to turn these into bytes. I did a little bit masking and shifting to turn these two-byte numbers into two one-byte numbers:

```javascript
function* utf16Bytes(str) {
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);

    // Get the most significant byte.
    // For example, given 0x1234, yield 0x12.
    yield (charCode & 0xff00) >> 8;

    // Get the least significant byte.
    // For example, given 0x1234, yield 0x34.
    yield charCode & 0x00ff;
  }
}

[...utf16Bytes("hi 🌍")];
// => [0, 104, 0, 105, 0, 32, 216, 60, 223, 13]
```

And that's it! I could now get the UTF-16 bytes of a JavaScript string.

### I want the results as a buffer

My solution uses a generator. If you want the results as a `Uint8Array`, simply pass the result to the `Uint8Array` constructor:

```javascript
new Uint8Array(utf16Bytes("hi 🌍"));
// => Uint8Array(10) [0, 104, 0, 105, ...]
```

Alternatively, if you're using Node, you can get the results as a `Buffer`—[see below](#im-using-node).

### I want the little endian bytes

My solution yields _big endian_ results (UTF-16BE), not _little endian_ (UTF-16LE). If you want little endian results, you can just switch the order of the `yield`s.

```javascript
function* utf16LeBytes(str) {
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);

    // Get the least significant byte.
    // For example, given 0x1234, yield 0x34.
    yield charCode & 0x00ff;

    // Get the most significant byte.
    // For example, given 0x1234, yield 0x12.
    yield (charCode & 0xff00) >> 8;
  }
}

[...utf16LeBytes("hi 🌍")];
// => [104, 0, 105, 0, 32, 0, 60, 216, 13, 223]
```

You can also attach the [byte order mark][BOM] to your result by adding a couple of `yield`s at the beginning.

Alternatively, if you're using Node, keep reading.

### I'm using Node

Node's built-in [`Buffer.from()`][Buffer.from] can do this much quicker.

To get the UTF-16LE bytes of a string in Node:

```javascript
import { Buffer } from "node:buffer";

Buffer.from("hi 🌍", "utf16le");
// => <Buffer 68 00 69 00 20 00 3c d8 0d df>
```

Node only supports UTF-16LE natively, but there's an easy way to get the big endian bytes: just call [`swap16()`][swap16] on the result.

```javascript
Buffer.from("hi 🌍", "utf16le").swap16();
// => <Buffer 00 68 00 69 00 20 d8 3c df 0d>
```

## I want something else

I also needed to get the UTF-8 and UTF-32 bytes for my little demo, so I wrote up how to do those too:

- ["Working with the UTF-8 bytes of JavaScript strings"][utf8]
- ["Getting the UTF-32 bytes of JavaScript strings"][utf32]

[utf8]: {{< relref "posts/2023-06-10-working-with-utf8-bytes-of-javascript-strings" >}}
[utf32]: {{< relref "posts/2023-06-10-getting-the-utf32-bytes-of-javascript-strings" >}}
[utf-21]: {{< relref "posts/2023-06-09-utf-21" >}}
[length]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length
[Buffer.from]: https://nodejs.org/docs/latest-v20.x/api/buffer.html#static-method-bufferfromstring-encoding
[swap16]: https://nodejs.org/docs/latest-v20.x/api/buffer.html#bufswap16
[BOM]: https://www.unicode.org/glossary/#byte_order_mark
