export function createFragment(
  ...children: ReadonlyArray<string | Node>
): DocumentFragment {
  const result = document.createDocumentFragment();
  result.append(...children);
  return result;
}

export function crel<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attributes: Readonly<Record<string, any>> = {},
  ...children: ReadonlyArray<string | Node>
) {
  const result = document.createElement(tagName) as any;

  for (const [key, value] of Object.entries(attributes)) {
    switch (key) {
      case "style":
        for (const [styleKey, styleValue] of Object.entries(value)) {
          result.style[styleKey] = styleValue;
        }
        break;
      case "id":
      case "value":
      case "className":
      case "htmlFor":
        result[key] = value;
        break;
      default:
        result.setAttribute(key, value);
    }
  }

  result.append(...children);

  return result;
}
