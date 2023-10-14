---
title: "Crystal: how to compute a CRC32 checksum"
description: "Use Digest::CRC32."
url: /crystal-compute-a-crc32-checksum
date: 2023-06-14
---

_This post was last updated for Crystal 1.8.2._

To compute the CRC32 checksum of some data in Crystal, use [`Digest::CRC32`][docs].

For example:

```crystal
require "digest/crc32"

data = Bytes[1, 2, 3]

puts Digest::CRC32.checksum(data)
# => 1438416925
```

You can also build up the digest and call `#final` to get the final result as bytes.

```crystal
require "digest/crc32"

crc = Digest::CRC32.new

crc.update(Bytes[1, 2, 3])
crc.update(Bytes[4, 5, 6])

puts crc.final
# => Bytes[129, 246, 119, 36]
```

`Digest::CRC32` is a `Digest` instance, so there's a lot more you can do with it than I've shown here. Check out [the `Digest` docs][0] for more.

[docs]: https://crystal-lang.org/api/1.8.2/Digest/CRC32.html
[0]: https://crystal-lang.org/api/1.8.2/Digest.html
