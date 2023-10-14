import { NULL } from "./literals.ts";
import { b } from "./util.ts";

function encodeSafeInteger(n: number): Uint8Array {
  if (n >= 0 && n <= 0xf) return b([0xf0 + (0xf & n)]);

  let result: Uint8Array;

  if (n >= -128 && n <= 127) {
    result = new Uint8Array(1 + 1);
    result[0] = 0xe0;
    new DataView(result.buffer).setInt8(1, n);
  } else if (n >= -32768 && n <= 32767) {
    result = new Uint8Array(1 + 2);
    result[0] = 0xe1;
    new DataView(result.buffer).setInt16(1, n);
  } else if (n >= -2147483648 && n <= 2147483647) {
    result = new Uint8Array(1 + 4);
    result[0] = 0xe2;
    new DataView(result.buffer).setInt32(1, n);
  } else {
    result = new Uint8Array(1 + 8);
    result[0] = 0xe3;
    new DataView(result.buffer).setBigInt64(1, BigInt(n));
  }

  return result;
}

function encodeFloat(n: number): Uint8Array {
  const result = new Uint8Array(1 + 8);
  result[0] = 0xe9;
  new DataView(result.buffer).setFloat64(1, n);
  return result;
}

export function encodeNumber(n: number): Uint8Array {
  if (!Number.isFinite(n)) return NULL;

  if (Number.isSafeInteger(n)) return encodeSafeInteger(n);

  return encodeFloat(n);
}
