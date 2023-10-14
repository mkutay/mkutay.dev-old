import { createFragment, crel } from "./lib/crel.ts";

const src = "/uploads/js1024-2023";

document
  .getElementById("js1024-2023-iframe")
  .replaceWith(
    createFragment(
      crel(
        "p",
        {},
        "Try it out below, or ",
        crel("a", { href: src }, "click here for a fullscreen version"),
        ". Left click to fill in a tile and right click to place an X. (If you're on mobile, you can tap to fill in a tile.)"
      ),
      crel("iframe", { src, height: 700, scroll: "no" })
    )
  );
