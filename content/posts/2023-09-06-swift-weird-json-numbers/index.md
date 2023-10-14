---
title: 'How does Swift decode "weird" JSON numbers?'
description: "What happens when you try to parse 9999999999999999999999999999999999999999?"
url: /swift-weird-json-numbers
date: 2023-09-06
---

_This post was last updated for Swift 5.8.1._

Swift has several number types like `UInt64` and `Double`. Like most languages, these types can't represent every possible number. For example, `Int16` can only represent numbers between `-32768` and `32767`.

The JSON specification has no such restriction. Numbers like `9999999999999999999999999999999999999999` or `0.00000000000000000000000000000000000001` are completely valid.

[RFC 8259], which specifies JSON, says that implementations don't have to be precise when they parse these "weird" numbers. It says:

> This specification allows implementations to set limits on the range and precision of numbers accepted. [...] A JSON number such as 1E400 or 3.141592653589793238462643383279 may indicate potential interoperability problems, since it suggests that the software that created it expects receiving software to have greater capabilities for numeric magnitude and precision than is widely available.

So Swift is allowed to set limits on the range and precision of JSON numbers. What does it actually do?

## The algorithm

I found [the Foundation function that does this][source]. It effectively does the following:

1. If it fits into a `UInt64`, use that.
1. If it fits into an `Int64`, use that.
1. Try `Decimal`, possibly losing precision.
1. If it fits into a `Double`, use that, possibly losing precision.
1. Else, throw an error.

Let's explore in more detail. To do so, I wrote this little test function:

```swift
func parse(_ jsonString: String) -> Any {
    try! JSONSerialization.jsonObject(
        with: jsonString.data(using: .utf8)!,
        // Allow numbers at the top level
        options: [.fragmentsAllowed]
    )
}
```

### Part 1: try an integer

Foundation starts by deciding whether the value is an integer. Here are the first 3 lines of Foundation's parser function:

```swift
let decIndex = string.firstIndex(of: ".")
let expIndex = string.firstIndex(of: "e")
let isInteger = decIndex == nil && expIndex == nil
```

As you can see, two things determine whether something is an integer:

1. Does the string have a decimal point? For example, `12.34` has a decimal point but `5678` does not.
1. Does the string have an exponent? For example, `12e3` has an exponent but `456` does not.

I was a little surprised by the second part. Even though it has an exponent, `1e2` is an integer...but I guess not according to this function. Perhaps the variable could be called something like `isBoringInteger`.

The function then sees if the value is negative by checking if the string starts with a minus sign:

```swift
let isNegative = string.utf8[string.utf8.startIndex] == UInt8(ascii: "-")
```

Finally, it counts the number of digits before the exponent, if there is one. For example, `123` and `456e78` both have 3 digits.

```swift
let digitCount = string[string.startIndex..<(expIndex ?? string.endIndex)].count
```

All of this is used to try parsing the value as a `UInt64` or an `Int64`.

```swift
if isInteger {
    if isNegative {
        if digitCount <= 19, let intValue = Int64(string) {
            return NSNumber(value: intValue)
        }
    } else {
        if digitCount <= 20, let uintValue = UInt64(string) {
            return NSNumber(value: uintValue)
        }
    }
}
```

If the value is positive and fits in a `UInt64`, we use that. If the value is negative and fits in an `Int64`, we use that. (The digit count checks are, presumably, optimizations that match the number of digits in `UInt64.max` and `Int64.max`.)

That means that the following values are parsed by Swift perfectly:

```swift
parse("18446744073709551615") as? UInt64 == UInt64.max
// => true

parse("-9223372036854775808") as? Int64 == Int64.min
// => true
```

Values outside of this range, however, aren't so lucky.

### Part 2: try a Decimal

If it doesn't get put into an integer, we try [`Decimal`][Decimal].

`Decimal` is a numeric type that can has more precision than `Double`. It effectively has two parts: a "mantissa" and an "exponent". The value of the number is _mantissa &times; 10<sup>exponent</sup>_. The mantissa is a decimal integer up to 38 digits long (so the maximum is 99,999,999,999,999,999,999,999,999,999,999,999,999) and the exponent is a number between -128 and 127.

It can't represent any number, but it can represent a lot of them.

First, Foundation parses out the exponent into an integer, `exp`.

```swift
var exp = 0

if let expIndex = expIndex {
    let expStartIndex = string.index(after: expIndex)
    if let parsed = Int(string[expStartIndex...]) {
        exp = parsed
    }
}
```

This means that `123` will have an exponent of `0`, `456e7` will have an exponent of `7`, and `89e-1` will have an exponent of `-1`. And if the value doesn't fit in an `Int`, we won't return a `Decimal` at all, moving onto later steps.

Next, we try to create a `Decimal`. If we can (and it's finite), we put it into an `NSDecimalNumber` and return it:

```swift
if digitCount > 17, exp >= -128, exp <= 127, let decimal = Decimal(string: string), decimal.isFinite {
	return NSDecimalNumber(decimal: decimal)
}
```

Notice that we avoid cases where `exp` is too big, because that won't fit in a `Decimal`.

This means that values like `99999999998888888888` or `77777777777777777777e10` will get turned into an `NSDecimalNumber`. Because `Decimal`s can't represent any number, some values might lose precision. For example, `9.8888888888777777777766666666665555555555` loses a few digits of precision at the end.

### Part 3: try a Double

If all of the above fails, we try to stuff the value into a `Double`.

```swift
if let doubleValue = Double(string), doubleValue.isFinite {
	return NSNumber(value: doubleValue)
}
```

Values like `9e128` get converted to `Double` because they don't hit any of the above cases, but are still valid `Double`s.

### Part 4: throw

If everything else fails, the inner function returns `nil`, which causes [the outer function to throw an error](https://github.com/apple/swift-corelibs-foundation/blob/9f53cc551e065d73b327a80147895822bc8f89e0/Sources/Foundation/JSONSerialization.swift#L696-L698):

```swift
guard let number = NSNumber.fromJSONNumber(string) else {
	throw JSONError.numberIsNotRepresentableInSwift(parsed: string)
}
```

Values like `99999999999999999999e200` don't hit any of the cases above, so errors are thrown.

## Summary

You can represent "weird" numbers in JSON, such as very large or very small numbers. When parsing these, Swift will:

1. If it fits into a `UInt64`, use that.
1. If it fits into an `Int64`, use that.
1. Try `Decimal`, possibly losing precision.
1. If it fits into a `Double`, use that, possibly losing precision.
1. Else, throw an error.

I hope this deep dive helped!

_Legal disclaimer in case lawyers get mad: parts of this post reproduce publicly-available source code from Swift's Foundation framework, which is licensed under the Apache License. You can read the full license [here](./foundation-license.txt) or at [swift.org/LICENSE.txt](https://www.swift.org/LICENSE.txt)._

[source]: https://github.com/apple/swift-corelibs-foundation/blob/9f53cc551e065d73b327a80147895822bc8f89e0/Sources/Foundation/JSONSerialization.swift#L712-L753
[RFC 8259]: https://www.rfc-editor.org/rfc/rfc8259
[Decimal]: https://developer.apple.com/documentation/foundation/decimal
