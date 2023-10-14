---
title: "How to compute the distance between two Cartesian points in JavaScript"
description: "Given two Cartesian coordinates, here's how you compute the distance between them."
url: /javascript-distance-between-two-points
date: 2023-05-31
lastmod: 2023-06-05
---

Given two Cartesian coordinates, here's how you compute the distance between them:

```javascript
function pointDistance(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}
```

Here's how you might use this function:

```javascript
pointDistance(0, 0, 3, 4);
// => 5

pointDistance(100, 7, 200, 7);
// => 100
```

## Supporting ancient browsers

The above solution uses [`Math.hypot()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot), which has been supported in browsers since around 2014. If you need to support ancient browsers that don't have `Math.hypot()`, you can use [`Math.sqrt()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sqrt) which has been around for a long time.

```javascript
// This version supports very old browsers.
function pointDistance(x1, y1, x2, y2) {
  var dx = x1 - x2;
  var dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}
```

It's used the same way.
