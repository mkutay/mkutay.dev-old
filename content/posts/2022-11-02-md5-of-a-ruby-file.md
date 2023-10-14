---
title: "Ruby: how to get the MD5 hash of a file"
description: 'Digest::MD5.file("file.txt").hexdigest does the trick.'
url: /md5-of-a-ruby-file
date: 2022-11-02
---

_This post was last updated for Ruby 3.1.2._

To compute the MD5 hash of a file in Ruby, use `Digest::MD5.file`.

```ruby
require "digest"

Digest::MD5.file("my_file.txt").hexdigest
# => "272946d082eb5758a2bcbdaa2203bc8c"
```

This uses [`Digest::Class.file`][0], the base class for `Digest::MD5`.

It took me awhile to find this, so hopefully I've saved you some time!

[0]: https://ruby-doc.org/stdlib-3.1.2/libdoc/digest/rdoc/Digest/Class.html#method-c-file
