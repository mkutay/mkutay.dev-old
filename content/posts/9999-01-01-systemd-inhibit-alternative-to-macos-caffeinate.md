---
title: 'systemd-inhibit: a built-in Linux alternative to macOS''s "caffeinate" command'
description: Try systemd-inhibit as an alternative to the command on macOS.
url: /systemd-inhibit-alternative-to-macos-caffeinate
date: 9999-01-01
draft: true
---

_In short: try `systemd-inhibit` if you're looking for an alternative to macOS's `caffeinate`._

macOS's `caffeinate` command prevents your computer from going to sleep, which can be useful.

It's been [ported](https://launchpad.net/caffeine/) to Linux...but if you're like me, you don't like installing unnecessary software.

Good news: there's a similar command already installed if you're using systemd: `systemd-inhibit`.

This command is roughly equivalent to `caffeinate make`:

```sh
systemd-inhibit make
```

This will prevent your system from sleeping, shutting down, or idling while `make` runs.

The two commands are a bit different, of course. For example, I don't think there's an equivalent to `caffeinate -d` in `systemd-inhibit`. But if this command works for you, I recommend giving it a try instead of installing something new!
