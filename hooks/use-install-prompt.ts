"use client";

import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "pwa:install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIosDevice() {
  const ua = navigator.userAgent;
  const isIpadOs = /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  return /iphone|ipad|ipod/i.test(ua) || isIpadOs;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

/**
 * tracks whether the app can be installed and whether it is already running as an installed app
 */
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  // assume installed and dismissed until hydration
  const [standalone, setStandalone] = useState<boolean>(true);
  const [dismissed, setDismissed] = useState<boolean>(true);
  const [ios, setIos] = useState<boolean>(false);

  useEffect(() => {
    setStandalone(isStandalone());
    setIos(isIosDevice());
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");

    const displayMode = window.matchMedia("(display-mode: standalone)");
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setPromptEvent(null);
      setStandalone(true);
    };
    const handleDisplayModeChange = () => setStandalone(isStandalone());

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    displayMode.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
      displayMode.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return;

    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;

    if (outcome === "accepted") setPromptEvent(null);
  }, [promptEvent]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    window.localStorage.setItem(DISMISS_KEY, "1");
  }, []);

  return {
    canInstall: Boolean(promptEvent) && !standalone && !dismissed,
    isIos: ios,
    isStandalone: standalone,
    isDismissed: dismissed,
    install,
    dismiss,
  };
}
