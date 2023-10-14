---
title: "How to format SQLite BLOB columns as hex"
description: "Use hex(column)."
url: /how-to-format-sqlite-blob-columns-as-hex
date: 2023-01-27
---

I recently had a small problem: I was using the SQLite CLI and I wanted to see binary data in a BLOB column. When I did a normal `SELECT` on it, I got unreadable garbage:

```sql
SELECT my_blob_column FROM my_table;
-- ´õ
```

I wanted to see the value in hex instead. After reading some documentation, I changed my query to use SQLite's [`hex` function][0], like so:

```sql
SELECT hex(my_blob_column) FROM my_table;
-- C2B4C3B5
```

Alternatively, the [`quote` function][1] also presents it in a readable way:

```sql
SELECT quote(my_blob_column) FROM my_table;
-- X'C2B4C3B5'
```

Now, I can make sense of the data in BLOB columns when I use the SQLite CLI. I hope this post helps somebody else!

[0]: https://www.sqlite.org/lang_corefunc.html#hex
[1]: https://www.sqlite.org/lang_corefunc.html#quote
