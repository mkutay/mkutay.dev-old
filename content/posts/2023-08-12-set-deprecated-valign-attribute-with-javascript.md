---
title: How to set the (deprecated) valign attribute with JavaScript
description: 'myElement.valign = "bottom"'
url: /set-deprecated-valign-attribute-with-javascript
date: 2023-08-12
---

Recently, I wanted to set the [deprecated `valign` attribute][0] using JavaScript. (I wouldn't normally do this, but I was working on [a code golfing challenge][1].)

Here's how I did it:

```javascript
// Reminder: this is deprecated!
myHtmlElement.vAlign = "bottom";
```

Again, this feature is deprecated. The [`vertical-align` CSS property][2] is a recommended alternative. Here's how you'd do this the "right" way:

```javascript
myHtmlElement.style.verticalAlign = "bottom";
```

I couldn't find this documented anywhere, so I thought I'd write it up for the next person.

[1]: {{< relref "posts/2023-07-13-js1024-2023" >}}
[2]: https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align
[0]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#deprecated_attributes
