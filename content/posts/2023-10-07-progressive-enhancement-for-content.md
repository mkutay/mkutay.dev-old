---
title: Progressive enhancement for content
description: Show something interactive when possible, but don't require JavaScript.
url: /progressive-enhancement-for-content
date: 9999-01-01
draft: true
---

A few of my recent blog posts have featured a kind of "[progressive enhancement] for content", and I'd like to share how I did it. It's not very complicated, and certainly not clever.

A [recent post about character encoding][UTF-21] let readers play around and type their own text. If you've got JavaScript running in your browser, you can type characters and see their UTF-8 values.

However, people might not have JavaScript on. It might be explicitly disabled. They might also be in an environment without it, such as an RSS reader or a web crawler. What should happen for these people?

In short, I use a `<noscript>` tag for no-JS users, and then populate (or unhide) some other content with JavaScript. I write all my posts in Markdown and I can get away with this because Markdown can include HTML.

Here's what the Markdown looks like:

```markdown
This is a regular Markdown paragraph.

<noscript>
  <p>
    It looks like you don't have JavaScript enabled.
  </p>
</noscript>

<p id="js-demo" hidden>
  It looks like JavaScript is enabled for you!
  <a href="#">Click here to change the text style.</a>
</p>

<script>
const demoEl = document.getElementById("js-demo");

demoEl.querySelector("a").addEventListener("click", (event) => {
  // ...change the text style...
});

demoEl.removeAttribute("hidden");
</script>
```

Here's what that looks like for you in your browser (try toggling JavaScript to see the difference):

<noscript>
  <p style="font-style: italic">
    It looks like you don't have JavaScript enabled.
  </p>
</noscript>

<p id="js-demo" hidden>
  It looks like JavaScript is enabled for you!
  <a href="#">Click here to change the text style.</a>
</p>

<script>
let style = "bold";

const demoEl = document.getElementById("js-demo");

demoEl.querySelector("a").addEventListener("click", (event) => {
  event.preventDefault();
  style = style === "bold" ? "italic" : "bold";
  render();
});

function render() {
  if (style === "bold") {
    demoEl.style.fontWeight = "bold";
    demoEl.style.fontStyle = "normal";
  } else {
    demoEl.style.fontWeight = "normal";
    demoEl.style.fontStyle = "italic";
  }
  demoEl.removeAttribute("hidden");
}

render();
</script>

The actual content is highly dependent on the specific post. For example, my character encoding post has an interactive input for JS-enabled people and shows a table of sample text for everyone else.

Again, this isn't very clever, but I thought it was a little bit useful and figured I'd share!

[UTF-21]: {{< relref "posts/2023-06-09-utf-21" >}}
[progressive enhancement]: https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement
