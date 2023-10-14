import { encodeNumber } from "./numbers.ts";
import { encodeString } from "./strings.ts";
import { FALSE, NULL, TRUE } from "./literals.ts";
import { concatBytes, containerPrefix } from "./util.ts";

function encodeArray(arr: ReadonlyArray<unknown>): Uint8Array {
  return concatBytes([
    containerPrefix(arr.length, 0xb0, 0xa0),
    ...arr.map((item) => encode(item)),
  ]);
}

function encodeObject(obj: Readonly<object>): Uint8Array {
  // TODO: Filter object for values that won't be encoded

  const entries = Object.entries(obj);

  return concatBytes([
    containerPrefix(entries.length, 0x90, 0x80),
    ...entries.map(([key, value]) =>
      concatBytes([encodeString(key), encode(value)])
    ),
  ]);
}

/**
 * Encode a value as JSOS.
 */
export function encode(value: unknown): Uint8Array {
  if (value === true) return TRUE;
  if (value === false) return FALSE;
  if (value === null) return NULL;

  if (typeof value === "number") {
    return encodeNumber(value);
  }

  if (typeof value === "string") {
    return encodeString(value);
  }

  if (Array.isArray(value)) {
    return encodeArray(value);
  }

  if (typeof value === "object") {
    return encodeObject(value);
  }

  throw new TypeError(
    `Value of type ${typeof value} can't be serialized in JSOS`
  );
}
