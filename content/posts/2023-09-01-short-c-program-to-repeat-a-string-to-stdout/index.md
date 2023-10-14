---
title: Short C program that repeats a string forever
description: "I made something like the `yes` command. Maybe it will be useful to you."
url: /short-c-program-to-repeat-a-string-to-stdout
date: 2023-09-01
lastmod: 2023-09-06
---

I recently wanted a command that would endlessly repeat a string at the command line. Like [the `yes` command][yes], but without newlines.

**Update:** After I published this, [Sven] told me about the [`jot`][jot] command, which can do exactly what I want. For example:

```sh
jot -b abc -s '' 0 | head -c 30
# => abcabcabcabcabcabcabcabcabcabc
```

Before Sven reached out, I couldn't find a good way to do this, so I gave up and wrote a short C program to do it. Here's it is:

```c
#include <stdio.h>
#include <string.h>

int main(int argc, char **argv) {
  if (argc != 2) {
    fprintf(stderr, "error: please supply exactly one argument\n");
    return 1;
  }

  char *arg = argv[1];

  if (strlen(arg) == 0) {
    fprintf(stderr, "error: please no empty strings\n");
    return 1;
  }

  while (fputs(arg, stdout) != EOF) {
  }

  return 0;
}
```

Once compiled, I run it like this:

```sh
./repeat abc | head -c 30
# => abcabcabcabcabcabcabcabcabcabc
```

It's a little slow and probably doesn't work in some cases, but it was good enough for me. (Now I'll probably be using `jot`—thanks again, [Sven].)

If this is useful to you, great! That's why I published it! (You can download it [here](./repeat.c).)

[yes]: https://man7.org/linux/man-pages/man1/yes.1.html
[jot]: https://man.freebsd.org/cgi/man.cgi?query=jot
[Sven]: http://dahlstrand.net/
