export interface ThemeColors {
  bg: string;
  panel: string;
  inset: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  danger: string;
}

let cached: { key: string; colors: ThemeColors } | null = null;

/** Read theme tokens off :root, cached per resolved theme. */
export function themeColors(resolved: 'light' | 'dark'): ThemeColors {
  if (cached?.key !== resolved) {
    const style = getComputedStyle(document.documentElement);
    const v = (name: string) => style.getPropertyValue(name).trim();
    cached = {
      key: resolved,
      colors: {
        bg: v('--bg'),
        panel: v('--bg-panel'),
        inset: v('--bg-inset'),
        border: v('--border'),
        borderStrong: v('--border-strong'),
        text: v('--text'),
        textMuted: v('--text-muted'),
        textFaint: v('--text-faint'),
        accent: v('--accent'),
        danger: v('--danger'),
      },
    };
  }
  return cached.colors;
}
