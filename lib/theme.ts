export const themes = ['light', 'dark', 'system'] as const;

export type Theme = (typeof themes)[number];

export const THEME_STORAGE_KEY = 'dentil:theme';

export function isTheme(value: unknown): value is Theme {
  return themes.includes(value as Theme);
}

/**
 * Runs in <head> before first paint: adds `.dark` to <html> for a stored "dark" choice, or for "system" (the default)
 * when the OS prefers dark.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
