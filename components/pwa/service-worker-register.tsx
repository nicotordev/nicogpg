"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.location.protocol.startsWith("http")
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.onupdatefound = () => {
            const installing = registration.installing;
            if (installing) {
              installing.onstatechange = () => {
                if (
                  installing.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available; it will be used on next page visit
                }
              };
            }
          };
        })
        .catch((error) => {
          console.debug("Service Worker registration skipped or failed:", error);
        });
    }
  }, []);

  return null;
}
