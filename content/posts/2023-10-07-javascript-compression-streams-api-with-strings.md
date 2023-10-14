---
title: How to use the JavaScript Compression Streams API to (de)compress strings
description: Convert strings to compression streams and vice-versa.
date: 2023-10-07
lastmod: 2023-10-14
url: /javascript-compression-streams-api-with-strings
---

_This post is written for people familiar with JavaScript._

The [JavaScript Compression Streams API][Compression Streams API] lets you
compress and decompress data. Let's see how to use it with strings.

## Just show me the code!

Here's some code you can copy-paste:

```javascript
/**
 * Convert a string to its UTF-8 bytes and compress it.
 *
 * @param {string} str
 * @returns {Promise<Uint8Array>}
 */
async function compress(str) {
  // Convert the string to a byte stream.
  const stream = new Blob([str]).stream();

  // Create a compressed stream.
  const compressedStream = stream.pipeThrough(
    new CompressionStream("gzip")
  );

  // Read all the bytes from this stream.
  const chunks = [];
  for await (const chunk of compressedStream) {
    chunks.push(chunk);
  }
  return await concatUint8Arrays(chunks);
}

/**
 * Decompress bytes into a UTF-8 string.
 *
 * @param {Uint8Array} compressedBytes
 * @returns {Promise<string>}
 */
async function decompress(compressedBytes) {
  // Convert the bytes to a stream.
  const stream = new Blob([compressedBytes]).stream();

  // Create a decompressed stream.
  const decompressedStream = stream.pipeThrough(
    new DecompressionStream("gzip")
  );

  // Read all the bytes from this stream.
  const chunks = [];
  for await (const chunk of decompressedStream) {
    chunks.push(chunk);
  }
  const stringBytes = await concatUint8Arrays(chunks);

  // Convert the bytes to a string.
  return new TextDecoder().decode(stringBytes);
}

/**
 * Combine multiple Uint8Arrays into one.
 *
 * @param {ReadonlyArray<Uint8Array>} uint8arrays
 * @returns {Promise<Uint8Array>}
 */
async function concatUint8Arrays(uint8arrays) {
  const blob = new Blob(uint8arrays);
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}
```

Here's you compress a string:

```javascript
const str = "foo".repeat(1000);
const compressedBytes = await compress(str);
console.log(compressedBytes);
// => Uint8Array(61) [31, 139, 8, 0, ...]
```

And here's how you decompress one:

```javascript
const decompressed = await decompress(compressedBytes);
console.log(decompressed);
// => "foofoofoofoofoo ..."
```

I recommend reading the ["What can go wrong?"](#what-can-go-wrong) section
below.

If you want to learn how this works, read on.

## Compressing strings

In this post, we'll build a function that takes a string and gives back
compressed bytes.

At a high level, our function will:

1. Convert the string to a stream of UTF-8 bytes.
1. Pipe that stream through a compressor to get a compressed stream.
1. Read all the bytes out of that compressed stream.

Let's start with a skeleton function signature:

```javascript
/**
 * Convert a string to its UTF-8 bytes and compress it.
 *
 * @param {string} str
 * @returns {Promise<Uint8Array>}
 */
async function compress(str) {
  // TODO
}
```

This function takes a string and returns a `Promise` that resolves to a
[`Uint8Array`][Uint8Array], which is basically an array of bytes.

The Compression Streams API operates on streams of bytes, not strings. Let's
start by converting our string to a byte stream:

```javascript
async function compress(str) {
  const stream = new Blob([str]).stream();

  // TODO
}
```

This converts our string to a [`Blob`][Blob] and pulls a stream out. There are
other ways to convert strings to streams, but I like this method because (1) it
converts the string to UTF-8 automatically (2) it's short.

Next, we need to pipe this stream through a
[`CompressionStream`][CompressionStream].

```javascript
async function compress(str) {
  // ...

  const compressedStream = stream.pipeThrough(
    new CompressionStream("gzip")
  );

  // TODO
}
```

This example uses gzip compression, but you can also use DEFLATE. (It's possible
that other compression algorithms will be supported in the future.)

We have a stream of compressed bytes! We've done the hard part. Now let's read
all of those bytes:

```javascript
async function compress(str) {
  // ...

  const chunks = [];
  for await (const chunk of compressedStream) {
    chunks.push(chunk);
  }

  // TODO
}
```

As you can see, this reads all the chunks from the stream into an array. It's
likely that your compressed stream will have multiple chunks. Each chunk is a
`Uint8Array`, which we want to combine into one. There are a few ways to do
this, but here's my favorite:

```javascript
async function concatUint8Arrays(uint8arrays) {
  const blob = new Blob(uint8arrays);
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}
```

The last thing we need to do is call this new function on our array of chunks:

```javascript
async function compress(str) {
  // ...

  return await concatUint8Arrays(chunks);
}
```

And we're done! Here's how you might use it:

```javascript
const str = "foo".repeat(1000);
const compressedBytes = await compress(str);
console.log(compressedBytes);
// => Uint8Array(61) [31, 139, 8, 0, ...]
```

Here's the finished code peppered with some comments:

```javascript
/**
 * Convert a string to its UTF-8 bytes and compress it.
 *
 * @param {string} str
 * @returns {Promise<Uint8Array>}
 */
async function compress(str) {
  // Convert the string to a byte stream.
  const stream = new Blob([str]).stream();

  // Create a compressed stream.
  const compressedStream = stream.pipeThrough(
    new CompressionStream("gzip")
  );

  // Read all the bytes from this stream.
  const chunks = [];
  for await (const chunk of compressedStream) {
    chunks.push(chunk);
  }
  return await concatUint8Arrays(chunks);
}

/**
 * Combine multiple Uint8Arrays into one.
 *
 * @param {ReadonlyArray<Uint8Array>} uint8arrays
 * @returns {Promise<Uint8Array>}
 */
async function concatUint8Arrays(uint8arrays) {
  const blob = new Blob(uint8arrays);
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}
```

## Decompressing

Decompressing is basically the same process in reverse. Our function will look
very similar.

At a high level, our function will:

1. Convert the compressed bytes to a stream.
1. Pipe that stream through a decompressor to get a decompressed stream.
1. Read all the bytes out of that compressed stream.
1. Interpret those bytes as UTF-8 and convert them to a string.

Let's start with the first three steps, which are almost identical to the
compression step:

```javascript
/**
 * Decompress bytes into a UTF-8 string.
 *
 * @param {Uint8Array} compressedBytes
 * @returns {Promise<string>}
 */
async function decompress(compressedBytes) {
  // Convert the bytes to a stream.
  const stream = new Blob([compressedBytes]).stream();

  // Create a decompressed stream.
  const decompressedStream = stream.pipeThrough(
    new DecompressionStream("gzip")
  );

  // Read all the bytes from this stream.
  const chunks = [];
  for await (const chunk of decompressedStream) {
    chunks.push(chunk);
  }
  const stringBytes = await concatUint8Arrays(chunks);

  // TODO
}
```

As you can see, this looks a lot like the `compress` function we wrote above. It
converts the argument to a stream, pipes it through a decompressor, and reads
all the bytes in chunks.

However, there's still a TODO in there—we haven't converted the bytes to a
string. To do that, we can use a [`TextDecoder`][TextDecoder]:

```javascript
async function decompress(compressedBytes) {
  // ...

  return new TextDecoder().decode(stringBytes);
}
```

This will interpret the decompressed bytes as UTF-8 and convert them to a
string.

Here's how you use this:

```javascript
const decompressed = await decompress(compressedBytes);
console.log(decompressed);
// => "foofoofoofoofoofoofoofoo..."
```

And here's the whole function:

```javascript
/**
 * Decompress bytes into a UTF-8 string.
 *
 * @param {Uint8Array} compressedBytes
 * @returns {Promise<string>}
 */
async function decompress(compressedBytes) {
  // Convert the bytes to a stream.
  const stream = new Blob([compressedBytes]).stream();

  // Create a decompressed stream.
  const decompressedStream = stream.pipeThrough(
    new DecompressionStream("gzip")
  );

  // Read all the bytes from this stream.
  const chunks = [];
  for await (const chunk of decompressedStream) {
    chunks.push(chunk);
  }
  const stringBytes = await concatUint8Arrays(chunks);

  // Convert the bytes to a string.
  return new TextDecoder().decode(stringBytes);
}
```

Everything's working great! What could possibly go wrong...?

## What can go wrong?

There are three major things that can go wrong here.

### Problem 1: decompressing garbage

The most obvious issue: our `decompress` breaks if passed invalid data.

```javascript
const garbage = new Uint8Array([1, 2, 3]);
await decompress(garbage);
// => TypeError: The input data is corrupted: incorrect header check
```

If you pass gzip-compressed data, great! If you don't, the promise will reject
with an error. I recommend handling this problem, possibly by showing an error
to the user.

### Problem 2: inefficiency

Streams let you work with data in smaller chunks. For small data this can be
inconvenient, but you can get a lot of efficiency benefits as you deal with more
data.

Streams can be useful as part of a data pipeline. For example, imagine you're
compressing a large string and uploading it to a server. If you use streams
effectively, you can start the upload before the compression finishes—imagine an
assembly line where each chunk is uploaded as soon as it's ready.

Streams can also help reduce memory usage. If you're decompressing a lot of
data, you can do it in small chunks instead of having to allocate huge swaths of
RAM and processing everything all at once.

Here's an example that takes a string and converts it to a compressed stream,
then uploads that stream with `fetch`:

```javascript
const getCompressedStream = (str) =>
  new Blob([str]).stream().pipeThrough(new CompressionStream("gzip"));

const str = "foo".repeat(500);

await fetch("https://server.example/upload-text", {
  method: "POST",
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Encoding": "gzip",
  },
  body: getCompressedStream(str),
});
```

Notice that we avoid compressing the whole string at once. Instead, we pass the
stream to `fetch`, which can start uploading as soon as the first compressed
chunk is ready.

### Problem 3: bad strings

JavaScript strings are made up of UTF-16 code units. It's called UTF-16 because
each code unit is 16 bits long, which means that there are 65,536
(2<sup>16</sup>) possibilities.

However, there are a lot more than 65,536 characters! That means that some
characters need to be split into two code units, which is called a "surrogate
pair". For example, `😎` requires two code units: 55,357 and 56,846.

It's possible to construct strings that have "lone surrogates"—in other words,
strings that contain half of a surrogate pair. The bad news: this is bogus data.
The good news: it's pretty easy to detect.

The `Blob` constructor (which we use in our compressor) will replace lone
surrogates with the [Unicode replacement character]. That means that you might
lose a small amount of bogus data during compression.

For example, if you compress a string with a lone surrogate, you'll get a
slightly different string back out the other side:

```javascript
const stringWithLoneSurrogate = "\uDFFF ok";
const compressed = await compress(stringWithLoneSurrogate);
const decompressed = await decompress(compressed);
console.log(compressed === stringWithLoneSurrogate);
// => false
```

If you've got a string with lone surrogates, this is _probably_ not your biggest
problem. But know that `Blob` will slightly alter your data, which can mess with
the compression.

## Conclusion

Today, we've learned about JavaScript's Compression Streams API. We've learned
how to compress and decompress strings, and a bunch of ancillary stuff along the
way: streams, Blobs, UTF-16, and more.

I hope this post has helped!

[Compression Streams API]: https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API
[Uint8Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
[Blob]: https://developer.mozilla.org/en-US/docs/Web/API/Blob
[CompressionStream]: https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream
[TextDecoder]: https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
[Unicode replacement character]: https://unicodeplus.com/U+FFFD
