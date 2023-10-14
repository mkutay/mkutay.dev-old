---
title: Working with the UTF-8 bytes of JavaScript strings
description: "new TextEncoder().encode(str) is the ticket."
url: /working-with-utf8-bytes-of-javascript-strings
date: 2023-06-10
---

_This post assumes you understand UTF-8._

Recently, I wanted to get the UTF-8 bytes of a JavaScript string for [a demo I was working on][utf-21].

I took advantage of JavaScript's built-in [`TextEncoder`][TextEncoder], which turns a string into a `Uint8Array` of the string's bytes.

```javascript
new TextEncoder().encode("hi 🌍");
// => Uint8Array(7) [104, 105, 32, 240, 159, 140, 141]
```

You can use [`TextDecoder`][TextDecoder] to reverse the process.

```javascript
const bytes = new Uint8Array([240, 159, 145, 139, 32, 104, 105]);

new TextDecoder().decode(bytes);
// => "👋 hi"
```

That's it!

If you're curious, I also wrote up how to do this for [UTF-16] and [UTF-32], which are more complicated.

[TextEncoder]: https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
[TextDecoder]: https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder

[utf-16]: {{< relref "posts/2023-06-10-getting-the-utf16-bytes-of-javascript-strings" >}}
[utf-32]: {{< relref "posts/2023-06-10-getting-the-utf32-bytes-of-javascript-strings" >}}
[utf-21]: {{< relref "posts/2023-06-09-utf-21" >}}
