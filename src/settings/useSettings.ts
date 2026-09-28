import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_SETTINGS, parseSettings, resolveTheme, rootFontSize, type Settings } from './settings'

interface SettingsState extends Settings {
  update: (patch: Partial<Settings>) => void
}

/** Device settings live in their own localStorage key, apart from the GTD data that syncs. */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      update: (patch) => set(patch),
    }),
    {
      name: 'gtd-settings',
      version: 1,
      partialize: ({ theme, textSize, reduceMotion }): Settings => ({ theme, textSize, reduceMotion }),
      merge: (stored, current) => ({ ...current, ...parseSettings(stored) }),
    },
  ),
)

/** Status-bar colour for each sheet; matches --color-canvas in index.css. */
const CANVAS = { paper: '#f3efe4', carbon: '#16181c' }

/** Puts the Device settings onto <html>, where index.css picks them up. */
export function useApplySettings() {
  const { theme, textSize, reduceMotion } = useSettings()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
    root.style.fontSize = rootFontSize(textSize)
    root.toggleAttribute('data-reduce-motion', reduceMotion)

    // The status bar follows the sheet, including when "system" flips at sunset.
    const dark = matchMedia('(prefers-color-scheme: dark)')
    const paintStatusBar = () => {
      const color = CANVAS[resolveTheme(theme, dark.matches)]
      document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', color))
    }
    paintStatusBar()
    dark.addEventListener('change', paintStatusBar)
    return () => dark.removeEventListener('change', paintStatusBar)
  }, [theme, textSize, reduceMotion])
}
