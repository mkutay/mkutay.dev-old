export function decodeFixString(data: Readonly<Uint8Array>): {
  result: string;
  read: number;
} {
  const size = 0x0f & data[0];
  return {
    result: new TextDecoder().decode(data.slice(1, 1 + size)),
    read: 1 + size,
  };
}

export function decoder(
  method: "getUint8" | "getUint16" | "getUint32",
  sizeByteLength: number
): (data: Readonly<Uint8Array>) => { result: string; read: number } {
  return (data) => {
    const stringByteLength = new DataView(data.buffer)[method](1);
    return {
      result: new TextDecoder().decode(
        data.subarray(
          1 + sizeByteLength,
          1 + sizeByteLength + stringByteLength
        )
      ),
      read: 1 + sizeByteLength + stringByteLength,
    };
  };
}

export const decodeString8 = decoder("getUint8", 1);

export const decodeString16 = decoder("getUint16", 2);

export const decodeString32 = decoder("getUint32", 4);
