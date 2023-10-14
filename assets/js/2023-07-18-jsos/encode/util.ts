/**
 * Create a new `Uint8Array`.
 *
 * Shorthand for `new Uint8Array`.
 */
export const b = (bytes: Iterable<number>): Uint8Array =>
  new Uint8Array(bytes);

/**
 * Concatenate several `Uint8Array`s into one.
 */
export function concatBytes(
  uint8arrays: ReadonlyArray<Uint8Array>
): Uint8Array {
  let totalSize = 0;
  for (const uint8array of uint8arrays)
    totalSize += uint8array.byteLength;

  const result = new Uint8Array(totalSize);

  let offset = 0;
  for (const uint8array of uint8arrays) {
    result.set(uint8array, offset);
    offset += uint8array.byteLength;
  }

  return result;
}

export function containerPrefix(
  size: number,
  fixedMask: number,
  sized8: number
): Uint8Array {
  if (size <= 0xf) return b([fixedMask + size]);

  if (size <= 0xff) return b([sized8, size]);

  let result: Uint8Array;

  if (size <= 0xffff) {
    result = new Uint8Array(1 + 2);
    result[0] = sized8 + 1;
    new DataView(result.buffer).setUint16(1, size);
  } else if (size <= 0xffffffff) {
    result = new Uint8Array(1 + 4);
    result[0] = sized8 + 2;
    new DataView(result.buffer).setUint32(1, size);
  } else {
    throw new Error("Container (string, array, object) is too long");
  }

  return result;
}
