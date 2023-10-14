---
title: "What's the largest possible PNG?"
description: "There's no file size limit, but there is a maximum width and height."
url: /largest-possible-png
date: 2023-07-03
---

The maximum dimension of a PNG is 2<sup>31</sup>−1 pixels. That means that a PNG can be at most ~2.1 billion pixels wide and ~2.1 billion pixels tall.

This is because the width and height are stored in ["PNG four-byte unsigned integers"][0] which are between 0 and 2<sup>31</sup>−1.

However, PNGs have no maximum file size. You can embed an infinite amount of metadata in PNGs&mdash;even a 1&times;1 image could be terabytes large if it has enough metadata inside.

In practice, many PNG decoders impose smaller limits than the spec. For example, [libpng] imposes a default maximum width and height of 1 million pixels.

[0]: https://www.w3.org/TR/2022/WD-png-3-20221025/#dfn-png-four-byte-unsigned-integer
[libpng]: http://www.libpng.org/
