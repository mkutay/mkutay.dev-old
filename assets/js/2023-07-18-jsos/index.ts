import { createFragment, crel } from "../lib/crel.ts";
import randomId from "../lib/randomId.ts";
import formatBytes from "../lib/formatBytes.ts";
import { encode as jsosEncode } from "./jsos.ts";

const SAMPLE_DATA = {
  people: [
    { name: "Målfrid", favoriteColor: "blue" },
    { name: "Emilia", favoriteColor: "red" },
    { name: "Evan", favoriteColor: "glitter" },
  ],
};

const makeSizeEl = (
  label: string
): [HTMLLIElement, HTMLSpanElement] => {
  const resultEl = crel("span");
  const liEl = crel(
    "li",
    {},
    crel("strong", {}, label + ":"),
    "  ",
    resultEl
  );
  return [liEl, resultEl];
};

const inputEl = crel(
  "textarea",
  {
    id: randomId(),
    className: "mono",
    rows: 7,
    spellcheck: "false",
  },
  JSON.stringify(SAMPLE_DATA, null, 2)
);

const [originalSizeLi, originalSizeResult] =
  makeSizeEl("Original size");
const [minifiedJsonSizeLi, minifiedJsonResult] = makeSizeEl(
  "JSON size (minified)"
);
const [jsosSizeLi, jsosSizeResult] = makeSizeEl("JSOS size");
const jsosPayload = crel("input", {
  id: randomId(),
  className: "mono",
  readonly: true,
});
const jsosPayloadLi = crel(
  "li",
  {},
  crel(
    "label",
    { htmlFor: jsosPayload },
    crel("strong", {}, "JSOS payload (bytes):")
  ),
  " ",
  jsosPayload
);
const successfulResultUl = crel(
  "ul",
  {},
  originalSizeLi,
  minifiedJsonSizeLi,
  jsosSizeLi,
  jsosPayloadLi
);

const unsuccessfulResultMessage = crel("strong");
const unsuccessfulResultUl = crel("p", {}, unsuccessfulResultMessage);

const initialRender = () => {
  inputEl.addEventListener("input", render);

  document
    .getElementById("jsos-demo")!
    .replaceWith(
      createFragment(
        crel("h2", { id: "try-it" }, "Try it!"),
        crel(
          "p",
          {},
          crel(
            "label",
            { htmlFor: inputEl.id },
            "Paste a JSON payload below:"
          )
        ),
        crel("p", {}, inputEl),
        successfulResultUl,
        unsuccessfulResultUl
      )
    );

  render();
};

const render = () => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(inputEl.value);
  } catch (err: unknown) {
    unsuccessfulResultMessage.innerText =
      "Error: could not parse JSON. See browser console for more details.";
    console.error(err);
    successfulResultUl.hidden = true;
    unsuccessfulResultUl.hidden = false;
    return;
  }

  successfulResultUl.hidden = false;
  unsuccessfulResultUl.hidden = true;

  const textEncoder = new TextEncoder();

  const originalSize = textEncoder.encode(inputEl.value).byteLength;
  originalSizeResult.innerText = formatBytes(originalSize);

  const minifiedJson = JSON.stringify(parsed);
  const minifiedSize = textEncoder.encode(minifiedJson).byteLength;
  minifiedJsonResult.innerText = formatBytes(minifiedSize);

  const jsosBytes = jsosEncode(parsed);
  jsosPayload.value = [...jsosBytes]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");

  const jsosSize = jsosBytes.byteLength;
  const jsosSavings = minifiedSize - jsosSize;
  let savingsString: string;
  if (jsosSavings > 0) {
    savingsString = `${Math.round(
      (jsosSavings / minifiedSize) * 100
    )}% smaller than minified JSON`;
  } else if (jsosSavings === 0) {
    savingsString = "No savings with JSOS";
  } else {
    savingsString =
      "Uh oh, JSOS is bigger! Remember, this is a proof-of-concept...";
  }
  jsosSizeResult.innerText = `${formatBytes(
    jsosSize
  )}. ${savingsString}`;
};

initialRender();
