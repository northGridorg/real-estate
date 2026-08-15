export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "qy.settings.v1";

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("light", resolved === "light");
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function loadStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return "dark";
    const parsed = JSON.parse(raw);
    if (parsed?.theme === "light" || parsed?.theme === "dark" || parsed?.theme === "system") {
      return parsed.theme;
    }
    return "dark";
  } catch {
    return "dark";
  }
}

export function initTheme() {
  const theme = loadStoredTheme();
  applyTheme(theme);
  if (theme === "system" && typeof window !== "undefined") {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }
  return () => {};
}

import { useEffect, useState } from "react";

function currentResolved(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

/**
 * Subscribes to theme class changes on <html> so consumers (e.g. charts)
 * can re-render when light/dark toggles.
 */
export function useThemeMode(): "light" | "dark" {
  const [mode, setMode] = useState<"light" | "dark">(() => currentResolved());

  useEffect(() => {
    const update = () => setMode(currentResolved());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  return mode;
}