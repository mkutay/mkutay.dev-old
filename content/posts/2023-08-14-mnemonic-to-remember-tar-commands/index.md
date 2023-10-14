---
title: "My mnemonic to remember tar commands on Linux"
description: "Create tarballs with -caf. Extract tarballs with -xaf (or -xf on macOS)."
url: /mnemonic-to-remember-tar-commands
date: 2023-08-19
lastmod: 2023-10-14
---

![A webcomic depicting how hard it can be to use the tar command. First panel: "Rob! You use Unix! Come quick!" Second panel: "To disarm the bomb, simply enter a valid tar command on your first try. No Googling. You have ten seconds." In the final panel, after a hesitation, Rob says "I'm so sorry."](./xkcd.png)

The `tar` command is famous for being hard to use. What flags do you use for creating a tarball? What about extracting one?

I remember two mnemonics when doing this: **c**reate **a** **f**ile and e**x**tract **a** **f**ile.

To create a tarball, run `tar -caf` ("Create A File"):

```sh
tar -caf my_archive.tar.gz file1.txt file2.png
```

To extract a tarball, run `tar -xaf` ("Extract A File"):

```sh
tar -xaf my_archive.tar.gz
```

That's it!

This works on my Linux machines, but may not work on other operating systems like macOS. See below for more info.

## What do the flags mean?

The `-c` and `-x` flags are for creation and extraction, respectively.

The `-f` flag is for the tarball file.

The `-a` flag is the most interesting. It's short for `--auto-compress`. It uses the file's extension to compress the tarball correctly. For example, `tar -caf my_archive.tgz ...` will create a tarball compressed with gzip, while `tar -caf my_archive.tar.bz2 ...` will create a tarball compressed with bzip2.

`man tar` has more information about these flags.

## It's a bit trickier on macOS

This post is about Linux. Unfortunately, it can be a little harder on macOS and any other system that uses BSD Tar.

As you might imagine, the `-a`/`--auto-compress` flag is unnecessary during extraction. There's no need to "auto-compress" when you're decompressing!

GNU Tar ignores the flag in this case; `tar -xf` and `tar -xaf` are equivalent. If you're using GNU Tar—and if you're using Linux, you likely are—you're done!

BSD Tar, which is installed by default on macOS, doesn't allow the `-a` flag during extraction. That means that `tar -xaf` will fail, and the mnemonic won't work.

```sh
tar -xaf my_file.tar.gz
# tar: Option -a is not permitted in mode -x
```

To address this, you have a few options:

- Run `tar -xf` instead of `tar -xaf`. This makes the mnemonic harder to remember ("create a file" versus "extract file"), but works.

  Alternatively, you can tweak your mnemonic. `tar -caf` stands for "create a file" (because you're only creating one tar file), where `tar -xf` stands for "extract files"; the tarball likely has multiple files inside. Thanks to Bozorgmehr Pouyeh for this suggestion.

- Run `tar -xaf`, see the helpful error, and then run `tar -xf` instead. This lets you continue with the mnemonic, but adds a small hurdle.

- Switch to GNU Tar. On macOS, you can run `brew install gnu-tar` and then [follow the instructions to make the switch][1]. This is what I typically do on my macOS machines, but requires a bit of effort.

Again, none of this is relevant if you're using GNU Tar, which is probably the case if you're using Linux.

I don't know what to do on other operating systems like Windows or FreeBSD. Feel free to [reach out]({{< relref "pages/contact" >}}) if you have a suggestion.

I hope the "create a file" and "extract a file" mnemonics are useful for you!

(The [comic][2] at the top of this post is from XKCD, which is licensed under the [Creative Commons Attribution-NonCommercial 2.5 license][0].)

[0]: https://creativecommons.org/licenses/by-nc/2.5/
[1]: https://github.com/Homebrew/homebrew-core/blob/e1d353e30dceb0fa0939d24e22258c4bf9adf65d/Formula/gnu-tar.rb#L65-L68
[2]: https://xkcd.com/1168/
[GNU Tar]: https://www.gnu.org/software/tar/
