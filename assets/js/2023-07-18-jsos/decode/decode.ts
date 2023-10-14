import type { JsosArray, JsosValue } from "./util.ts";
import {
  decodeFixUint,
  decodeFloat32,
  decodeFloat64,
  decodeInt16,
  decodeInt32,
  decodeInt64,
  decodeInt8,
} from "./numbers.ts";
import {
  decodeFixString,
  decodeString16,
  decodeString32,
  decodeString8,
} from "./strings.ts";
import {
  decodeFixObject,
  decodeObject16,
  decodeObject32,
  decodeObject8,
} from "./objects.ts";

// TODO: Move this, and other array stuff, into `arrays.ts`
function decodeArray(
  data: Readonly<Uint8Array>,
  headerByteLength: number,
  arrayLength: number
): { result: JsosArray; read: number } {
  const result = [];
  let read = headerByteLength;

  for (let i = 0; i < arrayLength; i++) {
    const { result: item, read: itemRead } = decodeInner(
      data.subarray(read)
    );
    result.push(item);
    read += itemRead;
  }

  return { result, read };
}

export function decodeFixArray(data: Readonly<Uint8Array>): {
  result: JsosArray;
  read: number;
} {
  return decodeArray(data, 1, data[0] & 0x0f);
}

export function decodeArray8(data: Readonly<Uint8Array>): {
  result: JsosArray;
  read: number;
} {
  return decodeArray(data, 1 + 1, data[1]);
}

export function decodeArray16(data: Readonly<Uint8Array>): {
  result: JsosArray;
  read: number;
} {
  const arrayLength = new DataView(data.buffer).getUint16(
    data.byteOffset + 1
  );
  return decodeArray(data, 1 + 2, arrayLength);
}

export function decodeArray32(data: Readonly<Uint8Array>): {
  result: JsosArray;
  read: number;
} {
  const arrayLength = new DataView(data.buffer).getUint32(
    data.byteOffset + 1
  );
  return decodeArray(data, 1 + 4, arrayLength);
}

function decodeInner(data: Readonly<Uint8Array>): {
  result: JsosValue;
  read: number;
} {
  if (data[0] === 0x3a) return { result: true, read: 1 };
  if (data[0] === 0x3b) return { result: false, read: 1 };
  if (data[0] === 0x3c) return { result: null, read: 1 };

  if ((data[0] & 0xf0) === 0xf0) return decodeFixUint(data);
  if (data[0] === 0xe0) return decodeInt8(data);
  if (data[0] === 0xe1) return decodeInt16(data);
  if (data[0] === 0xe2) return decodeInt32(data);
  if (data[0] === 0xe3) return decodeInt64(data);
  if (data[0] === 0xe8) return decodeFloat32(data);
  if (data[0] === 0xe9) return decodeFloat64(data);
  if (data[0] === 0xef) throw new Error("Not implemented");

  if ((data[0] & 0xd0) === 0xd0) return decodeFixString(data);
  if (data[0] === 0xc0) return decodeString8(data);
  if (data[0] === 0xc1) return decodeString16(data);
  if (data[0] === 0xc2) return decodeString32(data);

  if ((data[0] & 0xb0) === 0xb0) return decodeFixArray(data);
  if (data[0] === 0xa0) return decodeArray8(data);
  if (data[0] === 0xa1) return decodeArray16(data);
  if (data[0] === 0xa2) return decodeArray32(data);

  if ((data[0] & 0x90) === 0x90)
    return decodeFixObject(data, decodeInner);
  if (data[0] === 0x80) return decodeObject8(data, decodeInner);
  if (data[0] === 0x81) return decodeObject16(data, decodeInner);
  if (data[0] === 0x82) return decodeObject32(data, decodeInner);

  return { result: -1, read: 0 };
}

export function decode(data: Readonly<Uint8Array>): JsosValue {
  const { result } = decodeInner(data);

  // TODO
  // if (read !== data.byteLength) throw new Error("Unexpected end of input");

  return result;
}
