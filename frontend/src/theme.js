export const THEMES = {
  "elegant-dark": {
    label: "Elegant Dark",
    description: "Professional, data-first surfaces with purple accents.",
    colors: ["#8170F5", "#292C35", "#30343E", "#72C69A"],
  },
  "ruby-leaf": {
    label: "Ruby Leaf",
    description: "Warm, botanical accents with rich contrast and depth.",
    colors: ["#852E47", "#0D244D", "#4A5A2B", "#C2441C"],
  },
  "deep-forest": {
    label: "Rose Bloom",
    description: "A soft rose palette with rich plum surfaces and petal-pink highlights.",
    colors: ["#D95794", "#F5A6C8", "#B67EAE", "#EF9B79"],
  },
};

export const THEME_KEY = "acadex-theme";
export const DEFAULT_THEME = "elegant-dark";
export const VALID_THEMES = Object.keys(THEMES);

export function getStoredTheme() {
  try {
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    return VALID_THEMES.includes(storedTheme) ? storedTheme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(themeName) {
  const nextTheme = VALID_THEMES.includes(themeName)
    ? themeName
    : DEFAULT_THEME;

  document.documentElement.setAttribute("data-theme", nextTheme);
  document.body.classList.toggle("dark-theme", true);

  try {
    window.localStorage.setItem(THEME_KEY, nextTheme);
  } catch {
    // Ignore localStorage access failures and keep the application usable.
  }

  return nextTheme;
}
