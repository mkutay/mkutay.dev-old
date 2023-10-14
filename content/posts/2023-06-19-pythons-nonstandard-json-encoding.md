---
title: "Python's nonstandard JSON encoding"
url: /pythons-nonstandard-json-encoding
date: 2023-06-19
---

_This was last updated for Python 3.11.4._

Python's built-in JSON module, [`json`](https://docs.python.org/3/library/json.html), can produce results that most other JSON parsers do not accept. This is because it has nonstandard serializations for infinity, negative infinity, and NaN.

```python
import json
import math

json.dumps([math.inf, -math.inf, math.nan])
# => "[Infinity, -Infinity, NaN]"
```

Most other languages and libraries can't decode this. For example, `JSON.parse("Infinity")` throws an error in JavaScript.

To avoid this, you can pass the `allow_nan` option, which will throw an error if you try to serialize these values. (Though it's called "allow NaN", it also throws if passed `inf`.)

```python
json.dumps(math.nan, allow_nan=False)
# ValueError: Out of range float values are not JSON compliant

json.dumps(math.inf, allow_nan=False)
# ValueError: Out of range float values are not JSON compliant
```

I [tested](https://git.sr.ht/~evanhahn/python-nonstandard-json-tests) the following languages and libraries, all of which fail to parse these values:

- C++: [nlohmann::json](https://github.com/nlohmann/json)
- Clojure: [data.json](https://github.com/clojure/data.json)
- Crystal: [`JSON.parse()`](https://crystal-lang.org/api/1.8.2/JSON.html#parse%28input%3AString%7CIO%29%3AAny-class-method)
- Dart: [`json.decode()`](https://api.dart.dev/stable/3.0.5/dart-convert/JsonCodec/decode.html)
- Go: [encoding/json](https://pkg.go.dev/encoding/json)
- Java: [Jackson](https://github.com/FasterXML/jackson)
- Java: [org.json](https://mvnrepository.com/artifact/org.json/json) [parses unquoted strings](https://github.com/stleary/JSON-java/blob/a963115ac2527dee688f54f7c1150d6f25b887c1/docs/NOTES.md) so these values are parsed as the string "Infinity" or "NaN", but this is not a special case. For example, this is no different from parsing the string "foo".
- JavaScript: [`JSON.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
- PHP: [`json_decode()`](https://www.php.net/manual/en/function.json-decode.php)
- Ruby: [`JSON.parse()`](https://docs.ruby-lang.org/en/3.2/JSON.html#method-i-parse) fails by default, though the `allow_nan` option will parse these values
- Rust: [Serde JSON](https://github.com/serde-rs/json)
- Swift: [`JSONSerialization.jsonObject(with:)`](https://developer.apple.com/documentation/foundation/jsonserialization/1415493-jsonobject)

However, there are a few places that parse these just fine:

- Python, of course
- Java's [Gson](https://github.com/google/gson)
- [jq](https://jqlang.github.io/jq/), which also parses `inf` and `-inf`
- [SQLite's JSON functions](https://www.sqlite.org/json1.html), though its [`json_valid()` function](https://www.sqlite.org/json1.html#jvalid) returns `0` for these strings

These values are also valid [JSON5](https://json5.org/). JSON5 "is _not intended_ to be used for machine-to-machine communication", but can parse the values "Infinity", "-Infinity", and "NaN".

I found Python's behavior pretty surprising, so I thought I'd write it up!
