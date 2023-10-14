export type JsosPrimitive = string | number | boolean | null;
export type JsosObject = { [Key in string]: JsosValue };
export type JsosArray = JsosValue[];
export type JsosValue = JsosPrimitive | JsosObject | JsosArray;

export type DecoderFn = (data: Readonly<Uint8Array>) => {
  result: JsosValue;
  read: number;
};
