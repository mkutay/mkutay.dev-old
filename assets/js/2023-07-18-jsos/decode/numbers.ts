export function decodeFixUint(data: Readonly<Uint8Array>): {
  result: number;
  read: number;
} {
  return { result: 0x0f & data[0], read: 1 };
}

function dataViewDecoder(
  method:
    | "getInt8"
    | "getInt16"
    | "getInt32"
    | "getBigInt64"
    | "getFloat32"
    | "getFloat64",
  size: number
): (data: Readonly<Uint8Array>) => { result: number; read: number } {
  return (data) => ({
    result: Number(new DataView(data.buffer)[method](1)),
    read: 1 + size,
  });
}

export const decodeInt8 = dataViewDecoder("getInt8", 1);

export const decodeInt16 = dataViewDecoder("getInt16", 2);

export const decodeInt32 = dataViewDecoder("getInt32", 4);

export const decodeInt64 = dataViewDecoder("getBigInt64", 8);

export const decodeFloat32 = dataViewDecoder("getFloat32", 4);

export const decodeFloat64 = dataViewDecoder("getFloat64", 8);
