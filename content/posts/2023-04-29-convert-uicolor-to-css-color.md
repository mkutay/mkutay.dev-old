---
title: Converting UIColors to CSS colors
description: "Convert a UIColor to a color you can use in CSS."
url: /convert-uicolor-to-css-color
date: 2023-04-29
---

I recently wanted to convert a `UIColor` to a CSS-compatible string so I could update the color inside a webview. Here's how I did it.

At a high level, I:

1. Convert the `UIColor` to a [`CIColor`][CIColor]
1. Extract the color channels (red, green, blue, and alpha)
1. Format each channel to something like `"12%"`
1. Put it into [CSS's `rgba()` function][rgba]

Here's the full code:

```swift
extension UIColor {
    /// Convert to a [CSS `rgba` value][0], such as `rgba(10%, 20%, 30%, 100%)`.
    ///
    /// [0]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgba
    var asCssRgb: String {
        let ciColor = CIColor(color: self)
        let channels = [ciColor.red, ciColor.green, ciColor.blue, ciColor.alpha]
        let cssPercentages = channels.map(\.asCssPercentage)
        return "rgba(\(cssPercentages.joined(separator: ",")))"
    }
}

private extension CGFloat {
    /// Convert to a [CSS `percentage` value][0], such as `42%`.
    ///
    /// [0]: https://developer.mozilla.org/en-US/docs/Web/CSS/percentage
    var asCssPercentage: String {
        let percent = (self * 100).rounded()
        return "\(Int(percent))%"
    }
}

```

And here's how you can use it:

```swift
let orange = UIColor.orange
print(orange.asCssRgb)
// => "rgba(100%,50%,0%,100%)"
```

Hope this helps other people who run into a similar problem.

[CIColor]: https://developer.apple.com/documentation/coreimage/cicolor
[rgba]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgba
