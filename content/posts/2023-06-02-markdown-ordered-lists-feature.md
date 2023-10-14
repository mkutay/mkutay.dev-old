---
title: "My favorite little Markdown feature: reordering ordered lists"
url: "/markdown-ordered-lists-feature"
date: 2023-06-02
---

_In short: in Markdown, you can write `1.` for every list item instead of `1.`, `2.`, `3.`, etc._

Markdown lets you make ordered lists, like so:

1. First list item
2. Second list item
3. Third list item

I often find myself reordering these lists as I write. What was previously item #3 is now item #2.

Good news: Markdown makes this easy, even for numbered lists!

From the [CommonMark spec][0]:

> The start number of an ordered list is determined by the list number of its initial list item. The numbers of subsequent list items are disregarded.

That means I can just start every list item with `1.` and I don't have to worry about reordering things myself.

In other words, the following Markdown:

```markdown
1. One
1. Two
1. Three
```

Renders like this:

> 1. One
> 1. Two
> 1. Three

This is a small thing but it saves me time, and that's why it's my favorite little feature.

[0]: https://spec.commonmark.org/0.30/#lists
