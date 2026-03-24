import "client-only";

import Bowser from "bowser";

type BrowserName = "firefox" | "chrome" | "safari" | "edge" | "opera" | "ie";

let parser: Bowser.Parser.Parser | null = null;

function getParser() {
  if (typeof window === "undefined") return null;

  if (!parser) {
    parser = Bowser.getParser(window.navigator.userAgent);
  }

  return parser;
}

function isBrowser(name: BrowserName) {
  const p = getParser();
  return p ? p.is(name) : false;
}

export const system = {
  isFirefox: () => isBrowser("firefox"),
  isSafari: () => isBrowser("safari"),
};
