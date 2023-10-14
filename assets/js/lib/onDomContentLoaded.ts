export default function onDomContentLoaded(fn: () => unknown): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      fn();
    });
  } else {
    fn();
  }
}
