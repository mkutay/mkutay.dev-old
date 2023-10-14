import type { DecoderFn, JsosObject } from "./util.ts";

function decodeObject(
  data: Readonly<Uint8Array>,
  headerByteLength: number,
  objectEntriesLength: number,
  decodeInner: DecoderFn
): { result: JsosObject; read: number } {
  const result: JsosObject = {};

  let read = headerByteLength;

  for (let i = 0; i < objectEntriesLength; i++) {
    const { result: key, read: keyRead } = decodeInner(
      data.subarray(read)
    );
    if (typeof key !== "string")
      throw new Error("Key must be a string");
    read += keyRead;

    const { result: value, read: valueRead } = decodeInner(
      data.slice(read)
    );
    read += valueRead;

    result[key] = value;
  }

  return {
    result,
    read: headerByteLength + read,
  };
}

export function decodeFixObject(
  data: Readonly<Uint8Array>,
  decodeInner: DecoderFn
): { result: JsosObject; read: number } {
  return decodeObject(data, 1, data[0] & 0x0f, decodeInner);
}

export function decodeObject8(
  data: Readonly<Uint8Array>,
  decodeInner: DecoderFn
): { result: JsosObject; read: number } {
  return decodeObject(data, 1 + 1, data[1], decodeInner);
}

export function decodeObject16(
  data: Readonly<Uint8Array>,
  decodeInner: DecoderFn
): { result: JsosObject; read: number } {
  const objectEntriesLength = new DataView(data.buffer).getUint16(
    data.byteOffset + 1
  );
  return decodeObject(data, 1 + 2, objectEntriesLength, decodeInner);
}

export function decodeObject32(
  data: Readonly<Uint8Array>,
  decodeInner: DecoderFn
): { result: JsosObject; read: number } {
  const objectEntriesLength = new DataView(data.buffer).getUint32(
    data.byteOffset + 1
  );
  return decodeObject(data, 1 + 4, objectEntriesLength, decodeInner);
}
