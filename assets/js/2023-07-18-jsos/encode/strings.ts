import { concatBytes, containerPrefix } from "./util.ts";

export function encodeString(s: string): Uint8Array {
  const encoded = new TextEncoder().encode(s);
  return concatBytes([
    containerPrefix(encoded.byteLength, 0xd0, 0xc0),
    encoded,
  ]);
}
