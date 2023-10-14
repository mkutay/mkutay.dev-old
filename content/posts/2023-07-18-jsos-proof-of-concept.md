---
title: "Proof of concept: drop-in JSON replacement that produces smaller payloads"
description: "What if your JSON payloads got smaller by changing one line of code? I made a proof of concept."
url: /jsos-proof-of-concept
date: 2023-07-19
---

**JSOS**, which stands for **JavaScript Objects, but Smaller**, is a proof-of-concept data interchange format for busy programmers. It aims to be a drop-in replacement for JSON that produces smaller payloads.

_It may be a bad idea._ [(I want feedback!)][contact]

If you use JSON today, you might have code that looks like this:

```ruby
require "json"

payload = JSON.generate({ "foo": "bar" })
parsed = JSON.parse(payload)
```

If you want to switch to JSOS, you just change "JSON" to "JSOS"...

```ruby
require "jsos"

payload = JSOS.generate({ "foo": "bar" })
parsed = JSOS.parse(payload)
```

...and you're done! **All you need to do is update the import and two function calls.**

This payload is ~30% smaller and you don't need to do any additional work. Other data formats (like [MessagePack], [Cap'n Proto], [CBOR], and [BSON]) are great, but they aren't perfectly compatible. You can't always drop them in without introducing bugs. If you're a busy programmer, JSOS can improve efficiency with minimal effort. (Hopefully!)

JSOS uses a binary format—meaning payloads are not easily human-readable—that's more efficient than JSON.

<div id="jsos-demo"></div>
{{< javascript "js/2023-07-18-jsos/index.ts" >}}

## Project goals?

JSOS is currently at the "proof of concept" stage. I don't know whether I'll continue it, but if I do, these are the high-level goals:

- It should be **easy to port JSON code** to JSOS.

  - `JSON.parse(value)` should become `JSOS.parse(value)`, or equivalent. Same for encoding.
  - `JSOS.parse(value)`, or equivalent, should continue to parse JSON to ease the transition.

- JSOS should produce **smaller payloads**, in bytes, than their JSON counterparts. It's okay if there are edge cases where JSON is actually better.

- JSOS implementations should be **easy to build**, as there will need to be one for your programming language.

There are also a few "non-goals"; in other words, things I don't care about:

- JSOS does not strive to be the most efficient data interchange format. For example, CBOR or MessagePack may produce smaller payloads.
- JSOS is a binary format and does not strive to be human-readable.

## This is a proof of concept

I've said this a few times, but this is a proof of concept. As you might expect, there are a lot of things missing and a lot of rough edges.

I want feedback on a lot of things here.

- The main thing: **should I keep working on this?** Without positive feedback, I probably won't.
- Is "JSOS" a good name?
- Is it easy enough that a busy developer would choose this over something like CBOR?
- Can the JavaScript library be made small enough to be worth the byte savings?
- Would you be willing to help build a JSOS library in your favorite programming language?

If you like the idea and want me to continue, please let me know! Feel free to email <me@evanhahn.com>, mention me [on the Fediverse at @EvanHahn@bigshoulders.city](https://bigshoulders.city/@EvanHahn), or [contact me another way][contact].

[contact]: {{< relref "pages/contact" >}}
[JSON]: https://www.json.org/
[MessagePack]: https://msgpack.org/
[Cap'n Proto]: https://capnproto.org/
[CBOR]: https://cbor.io/
[BSON]: https://bsonspec.org/
