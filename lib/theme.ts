export type Theme = "light" | "dark";

const KEY = "theme";

/**
 * Runs before first paint (inlined in <head>) so a returning dark-mode
 * visitor never sees a white flash. Falls back to the OS preference.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`;

export function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Private mode etc.: the toggle still works for this visit.
  }
  window.dispatchEvent(new CustomEvent("buddy:theme", { detail: next }));
  return next;
}
