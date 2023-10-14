import { createFragment, crel } from "../lib/crel.ts";
import randomId from "../lib/randomId.ts";
import * as util from "./util.ts";
import * as utf21 from "./utf21.js";

class Bundle {
  constructor(title, getBytes) {
    this._byteLengthEl = crel("td");
    this._bytesEl = crel("textarea", {
      id: randomId(),
      readonly: true,
      className: "mono",
      rows: 2,
    });

    this.trEl = crel(
      "tr",
      {},
      crel(
        "th",
        {},
        crel("label", { htmlFor: this._bytesEl.id }, title)
      ),
      this._byteLengthEl,
      crel("td", {}, this._bytesEl)
    );

    this._getBytes = getBytes;
  }

  render(str) {
    let byteLength = 0;
    const formattedBytes = [];

    for (const byte of this._getBytes(str)) {
      byteLength++;
      formattedBytes.push(byte.toString(16).padStart(2, "0"));
    }

    this._byteLengthEl.innerHTML = byteLength;
    this._bytesEl.value = formattedBytes.join(" ");
  }
}

(() => {
  const introParagraphEl = crel(
    "p",
    {},
    "I built ",
    crel(
      "a",
      {
        href: "https://git.sr.ht/~evanhahn/UTF-21.js",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      "UTF-21.js"
    ),
    ", a JavaScript library to encode and decode UTF-21 strings. It powers the following demo."
  );

  const inputEl = crel("input", {
    id: randomId(),
    type: "text",
    placeholder: "Enter some text",
    value: "Hi 🌍",
    maxLength: 1024,
  });

  const labelParagraphEl = crel(
    "p",
    {},
    crel("label", { htmlFor: inputEl.id }, "Enter some text:")
  );

  const theadEl = crel(
    "thead",
    {},
    crel(
      "tr",
      {},
      crel("th", {}, "Encoding"),
      crel("th", {}, "Byte length"),
      crel("th", {}, "Bytes")
    )
  );

  const utf21Bundle = new Bundle("UTF-21", utf21.encode);
  const utf8Bundle = new Bundle("UTF-8", util.getUtf8Bytes);
  const utf16Bundle = new Bundle("UTF-16", util.getUtf16Bytes);
  const utf32Bundle = new Bundle("UTF-32", util.getUtf32Bytes);
  const bundles = [utf21Bundle, utf8Bundle, utf16Bundle, utf32Bundle];
  const tbodyEl = crel("tbody", {}, ...bundles.map((b) => b.trEl));

  const render = () => {
    bundles.forEach((bundle) => bundle.render(inputEl.value));
  };
  inputEl.addEventListener("input", render);
  render();

  document
    .getElementById("utf21-demo")
    .replaceWith(
      createFragment(
        crel("h2", { id: "try-it" }, "Try it!"),
        introParagraphEl,
        labelParagraphEl,
        crel("p", {}, inputEl),
        crel("table", {}, theadEl, tbodyEl)
      )
    );
})();
