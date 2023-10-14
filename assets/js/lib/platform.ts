/// <reference path="./type-extensions.d.ts" />

export const isDesktopMac = (
  navigator: Readonly<Pick<Navigator, "userAgentData" | "platform">>
): boolean =>
  navigator.userAgentData?.platform.toLowerCase() === "macos" ||
  navigator.platform === "MacIntel" ||
  navigator.platform === "MacPPC";
