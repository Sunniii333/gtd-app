import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, parseSettings, resolveTheme, rootFontSize } from './settings'

describe('parseSettings', () => {
  it('falls back to defaults for anything missing or unknown', () => {
    expect(parseSettings(undefined)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings({ theme: 'neon', textSize: 42, reduceMotion: 'yes' })).toEqual(DEFAULT_SETTINGS)
  })

  it('keeps valid values', () => {
    const s = { theme: 'carbon', textSize: 'large', reduceMotion: true }
    expect(parseSettings(s)).toEqual(s)
  })

  it('defaults to following the Device', () => {
    expect(DEFAULT_SETTINGS).toEqual({ theme: 'system', textSize: 'medium', reduceMotion: false })
  })
})

describe('resolveTheme', () => {
  it('follows the Device when set to system', () => {
    expect(resolveTheme('system', true)).toBe('carbon')
    expect(resolveTheme('system', false)).toBe('paper')
  })

  it('ignores the Device when a theme is chosen', () => {
    expect(resolveTheme('paper', true)).toBe('paper')
    expect(resolveTheme('carbon', false)).toBe('carbon')
  })
})

describe('rootFontSize', () => {
  it('scales from the browser default', () => {
    expect(rootFontSize('small')).toBe('87.5%')
    expect(rootFontSize('medium')).toBe('100%')
    expect(rootFontSize('large')).toBe('112.5%')
  })
})
