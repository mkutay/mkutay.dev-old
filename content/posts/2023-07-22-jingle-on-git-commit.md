---
title: Play a jingle on Git commits
url: /jingle-on-git-commit
date: 2023-07-22
---

When you complete a challenge in a video game, you usually hear a congratulatory sound effect. This is cute and I like it.

**What if you could hear a little jingle when you make Git commits?**

## Step 1: find a sound effect

First, I needed a sound effect that I could play at the command line.

You can get any sound file you want. I downloaded [this one from OpenGameArt](https://opengameart.org/content/get-ruby-se). If you instead want to play the entirety of ["Smooth" by Carlos Santana](https://www.youtube.com/watch?v=6Whgn_iE5uc) every time you commit, you can do that and I support you.

(You can download the one I used <a href="/uploads/2023-07-22-commit-jingle/commit_sound_effect.flac" download>here</a>.)

I wrote down where I saved this file. For the rest of this post, we'll pretend I saved it at `~/Desktop/commit_sound_effect.flac`.

## Step 2: play the sound effect from the command line

Next, I needed to be able to play this sound effect from the command line.

On macOS, I used the preinstalled `afplay` command.

{{< javascript "js/2023-07-22-jingle-on-git-commit.ts" >}}

<span class="js-hidden-on-not-macos">

```sh
# Play the sound effect (macOS only)
afplay ~/Desktop/commit_sound_effect.flac
```

</span>

On Linux, I don't think there's a preinstalled solution. There are lots of different programs you can install—you might already have one!—but I already have [mpv] so I just used that.

<span class="js-hidden-on-macos">

```sh
# Play the sound effect (requires mpv)
mpv ~/Desktop/commit_sound_effect.flac

# Play the sound effect without any output
mpv --really-quiet ~/Desktop/commit_sound_effect.flac
```

</span>

I don't know how to do this on Windows, but it seems like [it can be done](https://superuser.com/a/528541).

Once I could play sounds from the command line, it was time to hook it up to Git.

## Step 3: add a post-commit Git hook

To quote [`git help hooks`](https://git-scm.com/docs/githooks):

> Hooks are programs you can place in a hooks directory to trigger actions at certain points in git’s execution.

There are a bunch of different hooks, like "pre-push" or "post-merge". We'll use the **post-commit** hook, because we want to play the sound effect after we make a commit.

We'll put it in the hooks directory, which is inside your repository's Git folder at `.git/hooks/` by default. For example, it might be at `~/code/my-project/.git/hooks/`.

(Git lets you configure the hooks directory with the `core.hooksPath` config option, if you want to move it around. `git config --global core.hooksPath /path/to/global/hooks` can be used to set this globally if you want to play a jingle in _every_ repo on your computer...but I don't recommend this because it overrides any local hooks you might have.)

We'll create a short shell script inside that directory. Create `.git/hooks/post-commit`:

<noscript>

```sh
#!/usr/bin/env bash

# Play the sound effect.
#
# This uses `mpv --really-quiet`. I'd use `afplay`
# instead if you're on macOS, and something else
# entirely if you're on Windows.
#
# Use `&` to play the sound effect in the background
# so we don't have to wait for the audio to finish.
mpv --really-quiet ~/Desktop/commit_sound_effect.flac &
```

</noscript>

<!-- We hide these <template>s just in case somebody tries to render them. -->

<template id="jingle-script-linux">

```sh
#!/usr/bin/env bash

# Play the sound effect.
#
# This uses `mpv --really-quiet`. I'd use `afplay`
# instead if you're on macOS, and something else
# entirely if you're on Windows.
#
# Use `&` to play the sound effect in the background
# so we don't have to wait for the audio to finish.
mpv --really-quiet ~/Desktop/commit_sound_effect.flac &
```

</template>

<template id="jingle-script-mac" hidden>

```sh
#!/usr/bin/env bash

# Play the sound effect.
#
# We would use `mpv --really-quiet` instead of
# `afplay` on Linux, and something else entirely on
# Windows.
#
# Use `&` to play the sound effect in the background
# so we don't have to wait for the audio to finish.
afplay ~/Desktop/commit_sound_effect.flac &
```

</template>

<div id="jingle-script-code"></div>

We'll make it executable:

```sh
chmod +x .git/hooks/post-commit
```

Now, when we commit in that repo, a sound will play!

<p>
  <video controls loop>
    <source src="/uploads/2023-07-22-commit-jingle/screencast.mp4" type="video/mp4">
    <track
      label="English"
      kind="subtitles"
      srclang="en"
      src="/uploads/2023-07-22-commit-jingle/screencast.vtt"
      default
    />
  </video>
</p>

[mpv]: https://mpv.io
