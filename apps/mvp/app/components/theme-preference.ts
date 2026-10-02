export type AppTheme = "dark" | "light";

export const themeStorageKey = "speedrun-irl-theme";
const themeChangeEvent = "speedrun-irl-theme-change";
let currentTheme: AppTheme = "dark";

export function getTheme(): AppTheme {
  try {
    return window.localStorage.getItem(themeStorageKey) === "light" ? "light" : "dark";
  } catch {
    return currentTheme;
  }
}

export function applyTheme(theme: AppTheme, persist = true) {
  currentTheme = theme;
  document.documentElement.dataset.theme = theme;
  if (persist) {
    try {
      window.localStorage.setItem(themeStorageKey, theme);
    } catch {
      // Still apply the theme for this session if storage is unavailable.
    }
  }
  window.dispatchEvent(new Event(themeChangeEvent));
}

export function subscribeTheme(callback: () => void) {
  window.addEventListener(themeChangeEvent, callback);
  return () => window.removeEventListener(themeChangeEvent, callback);
}
