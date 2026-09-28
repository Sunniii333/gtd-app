/**
 * Device settings (CONTEXT.md › Settings): how this Device shows the app.
 * Kept on the Device only — never synced, never in an Export.
 */

/** Paper = cream sheet, Carbon = dark carbon copy, System = whatever the Device says. */
export type Theme = 'system' | 'paper' | 'carbon'
export type TextSize = 'small' | 'medium' | 'large'

export interface Settings {
  theme: Theme
  textSize: TextSize
  reduceMotion: boolean
}

export const THEMES: Theme[] = ['system', 'paper', 'carbon']
export const TEXT_SIZES: TextSize[] = ['small', 'medium', 'large']

export const DEFAULT_SETTINGS: Settings = { theme: 'system', textSize: 'medium', reduceMotion: false }

const oneOf = <T extends string>(options: T[], v: unknown, fallback: T): T =>
  options.includes(v as T) ? (v as T) : fallback

/** Whatever was stored, as valid settings; unknown values fall back to the default. */
export function parseSettings(raw: unknown): Settings {
  const v = (raw ?? {}) as Record<string, unknown>
  return {
    theme: oneOf(THEMES, v.theme, DEFAULT_SETTINGS.theme),
    textSize: oneOf(TEXT_SIZES, v.textSize, DEFAULT_SETTINGS.textSize),
    reduceMotion: typeof v.reduceMotion === 'boolean' ? v.reduceMotion : DEFAULT_SETTINGS.reduceMotion,
  }
}

/** The sheet actually on screen. */
export function resolveTheme(theme: Theme, deviceIsDark: boolean): 'paper' | 'carbon' {
  if (theme !== 'system') return theme
  return deviceIsDark ? 'carbon' : 'paper'
}

const FONT_SIZE: Record<TextSize, string> = { small: '87.5%', medium: '100%', large: '112.5%' }

/** Root font size; a percentage so it still respects the browser's own text-size setting. */
export const rootFontSize = (size: TextSize) => FONT_SIZE[size]
