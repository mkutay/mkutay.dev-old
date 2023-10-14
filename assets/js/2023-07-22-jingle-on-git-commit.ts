import { crel } from "./lib/crel.ts";
import onDomContentLoaded from "./lib/onDomContentLoaded.ts";
import { isDesktopMac } from "./lib/platform.ts";

const MACOS_STYLES = ".js-hidden-on-macos { display: none }";
const NOT_MACOS_STYLES = ".js-hidden-on-not-macos { display: none }";

onDomContentLoaded(() => {
  const isMac = isDesktopMac(navigator);

  document.head.append(
    crel("style", {}, isMac ? MACOS_STYLES : NOT_MACOS_STYLES)
  );

  const jingleScriptTemplate = document.getElementById(
    isMac ? "jingle-script-mac" : "jingle-script-linux"
  ) as HTMLTemplateElement;

  document
    .getElementById("jingle-script-code")
    ?.replaceWith(jingleScriptTemplate.content.cloneNode(true));
});
