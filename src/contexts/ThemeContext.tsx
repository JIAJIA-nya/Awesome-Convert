import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

/* ───── Animation preset definitions ───── */
export interface AnimationPreset {
  id: string
  name: string
  pageEnter: object
  pageExit: object
  pageTransition: object
  cardHover: object
  cardTap: object
  buttonHover: object
  buttonTap: object
  modalOverlay: object
  modalContent: object
}

export const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
  default: {
    id: 'default', name: '默认',
    pageEnter: { opacity: 0, y: 10 },
    pageExit: { opacity: 0, y: -10 },
    pageTransition: { duration: 0.3 },
    cardHover: { y: -2 },
    cardTap: { scale: 0.97 },
    buttonHover: { scale: 1.02 },
    buttonTap: { scale: 0.97 },
    modalOverlay: { opacity: 0 },
    modalContent: { opacity: 0, scale: 0.9, y: 20 },
  },
  fade: {
    id: 'fade', name: '淡入淡出',
    pageEnter: { opacity: 0 },
    pageExit: { opacity: 0 },
    pageTransition: { duration: 0.5 },
    cardHover: { opacity: 0.85 },
    cardTap: { opacity: 0.7 },
    buttonHover: { opacity: 0.9 },
    buttonTap: { opacity: 0.8 },
    modalOverlay: { opacity: 0 },
    modalContent: { opacity: 0 },
  },
  slide: {
    id: 'slide', name: '弹性滑动',
    pageEnter: { x: 80, opacity: 0 },
    pageExit: { x: -80, opacity: 0 },
    pageTransition: { type: 'spring', stiffness: 300, damping: 25 },
    cardHover: { x: 4 },
    cardTap: { x: -2 },
    buttonHover: { x: 2 },
    buttonTap: { x: -1 },
    modalOverlay: { opacity: 0 },
    modalContent: { opacity: 0, y: 100 },
  },
  scale: {
    id: 'scale', name: '缩放弹跳',
    pageEnter: { opacity: 0, scale: 0.85 },
    pageExit: { opacity: 0, scale: 1.1 },
    pageTransition: { type: 'spring', stiffness: 400, damping: 20 },
    cardHover: { scale: 1.04 },
    cardTap: { scale: 0.94 },
    buttonHover: { scale: 1.06 },
    buttonTap: { scale: 0.92 },
    modalOverlay: { opacity: 0 },
    modalContent: { opacity: 0, scale: 0.7 },
  },
  bounce: {
    id: 'bounce', name: '弹跳',
    pageEnter: { opacity: 0, y: 40 },
    pageExit: { opacity: 0, y: -40 },
    pageTransition: { type: 'spring', stiffness: 600, damping: 15 },
    cardHover: { y: -6 },
    cardTap: { y: 2 },
    buttonHover: { y: -3 },
    buttonTap: { y: 1 },
    modalOverlay: { opacity: 0 },
    modalContent: { opacity: 0, y: -60 },
  },
  flip: {
    id: 'flip', name: '翻转',
    pageEnter: { opacity: 0, rotateY: 15 },
    pageExit: { opacity: 0, rotateY: -15 },
    pageTransition: { duration: 0.4 },
    cardHover: { rotateX: 2 },
    cardTap: { rotateX: -1 },
    buttonHover: { rotateZ: 1 },
    buttonTap: { rotateZ: -1 },
    modalOverlay: { opacity: 0 },
    modalContent: { opacity: 0, rotateX: 20 },
  },
}

/* ───── Light / dark colour palettes ───── */
const DARK_COLORS: Record<string, string> = {
  '--color-surface': 'rgba(255, 255, 255, 0.06)',
  '--color-surface-hover': 'rgba(255, 255, 255, 0.10)',
  '--color-surface-active': 'rgba(255, 255, 255, 0.14)',
  '--color-bg': '#0f0f1a',
  '--color-bg-secondary': '#1a1a2e',
  '--color-text': '#e2e8f0',
  '--color-text-secondary': '#94a3b8',
  '--color-text-muted': '#64748b',
  '--slider-track': 'rgba(255, 255, 255, 0.12)',
  '--slider-thumb-border': 'rgba(255,255,255,0.25)',
  '--border-color': 'rgba(255, 255, 255, 0.08)',
}
const LIGHT_COLORS: Record<string, string> = {
  '--color-surface': 'rgba(0, 0, 0, 0.05)',
  '--color-surface-hover': 'rgba(0, 0, 0, 0.08)',
  '--color-surface-active': 'rgba(0, 0, 0, 0.12)',
  '--color-bg': '#f4f6fa',
  '--color-bg-secondary': '#e8ecf2',
  '--color-text': '#1e293b',
  '--color-text-secondary': '#475569',
  '--color-text-muted': '#94a3b8',
  '--slider-track': 'rgba(0, 0, 0, 0.15)',
  '--slider-thumb-border': 'rgba(255,255,255,0.8)',
  '--border-color': 'rgba(0, 0, 0, 0.10)',
}

/* ───── Context shape ───── */
interface ThemeState {
  primaryColor: string
  borderRadius: number
  animationSpeed: number
  fontSize: number
  mode: 'dark' | 'light'
  animationPreset: string
  backgroundGradient: string
  gradientIntensity: number   // 0-100
}

interface ThemeContextType extends ThemeState {
  setPrimaryColor: (c: string) => void
  setBorderRadius: (r: number) => void
  setAnimationSpeed: (s: number) => void
  setFontSize: (s: number) => void
  setMode: (m: 'dark' | 'light') => void
  setAnimationPreset: (id: string) => void
  setBackgroundGradient: (g: string) => void
  setGradientIntensity: (v: number) => void
  getPreset: () => AnimationPreset
  exportSettings: () => string
  importSettings: (json: string) => boolean
}

const defaultTheme: ThemeState = {
  primaryColor: '#06b6d4',   // 新默认：青色系
  borderRadius: 12,
  animationSpeed: 1,
  fontSize: 14,
  mode: 'dark',
  animationPreset: 'default',
  backgroundGradient: 'ocean',
  gradientIntensity: 60,
}

// 强度 0-100 映射到透明度 0-0.35
function gradAlpha(intensity: number) { return (intensity / 100) * 0.35 }

function makeGradients(intensity: number, bg: string, bg2: string): Record<string, string> {
  const a = gradAlpha(intensity).toFixed(2)
  return {
    default: `linear-gradient(135deg, rgba(99,102,241,${a}) 0%, ${bg} 40%, ${bg2} 60%, rgba(168,85,247,${a}) 100%)`,
    none: '',
    ocean: `linear-gradient(135deg, rgba(6,182,212,${a}) 0%, ${bg} 40%, ${bg2} 60%, rgba(59,130,246,${a}) 100%)`,
    sunset: `linear-gradient(135deg, rgba(249,115,22,${a}) 0%, ${bg} 40%, ${bg2} 60%, rgba(236,72,153,${a}) 100%)`,
    forest: `linear-gradient(135deg, rgba(34,197,94,${a}) 0%, ${bg} 40%, ${bg2} 60%, rgba(20,184,166,${a}) 100%)`,
    aurora: `linear-gradient(160deg, rgba(168,85,247,${a}) 0%, ${bg} 30%, rgba(6,182,212,${a}) 70%, ${bg2} 100%)`,
  }
}

const ThemeContext = createContext<ThemeContextType>({
  ...defaultTheme,
  setPrimaryColor: () => {},
  setBorderRadius: () => {},
  setAnimationSpeed: () => {},
  setFontSize: () => {},
  setMode: () => {},
  setAnimationPreset: () => {},
  setBackgroundGradient: () => {},
  setGradientIntensity: () => {},
  getPreset: () => ANIMATION_PRESETS.default,
  exportSettings: () => '',
  importSettings: () => false,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>(defaultTheme)
  const [loaded, setLoaded] = useState(false)

  /* Load saved theme */
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await window.api.getAllStore()
        setTheme({
          primaryColor: saved.primaryColor || defaultTheme.primaryColor,
          borderRadius: saved.borderRadius ?? defaultTheme.borderRadius,
          animationSpeed: saved.animationSpeed ?? defaultTheme.animationSpeed,
          fontSize: saved.fontSize ?? defaultTheme.fontSize,
          mode: (saved.themeMode as 'dark' | 'light') || defaultTheme.mode,
          animationPreset: saved.animationPreset || defaultTheme.animationPreset,
          backgroundGradient: saved.backgroundGradient || defaultTheme.backgroundGradient,
          gradientIntensity: saved.gradientIntensity ?? defaultTheme.gradientIntensity,
        })
      } catch {}
      setLoaded(true)
    }
    load()
  }, [])

  /* Apply CSS variables */
  useEffect(() => {
    if (!loaded) return
    const root = document.documentElement
    const hsl = hexToHSL(theme.primaryColor)

    root.style.setProperty('--color-primary', theme.primaryColor)
    root.style.setProperty('--color-primary-light', hslToHex(hsl.h, Math.min(100, hsl.l + 12), hsl.s))
    root.style.setProperty('--color-primary-dark', hslToHex(hsl.h, Math.max(0, hsl.l - 12), hsl.s))
    root.style.setProperty('--radius', `${theme.borderRadius}px`)
    root.style.setProperty('--anim-speed', String(theme.animationSpeed))
    root.style.setProperty('--font-size-base', `${theme.fontSize}px`)

    const palette = theme.mode === 'light' ? LIGHT_COLORS : DARK_COLORS
    Object.entries(palette).forEach(([k, v]) => root.style.setProperty(k, v))

    const grads = makeGradients(
      theme.gradientIntensity,
      theme.mode === 'light' ? '#f4f6fa' : '#0f0f1a',
      theme.mode === 'light' ? '#e8ecf2' : '#1a1a2e'
    )
    root.style.setProperty('--bg-gradient', grads[theme.backgroundGradient] || grads.default)
  }, [theme, loaded])

  const save = useCallback((key: string, value: any) => window.api.setStore(key, value), [])

  const setPrimaryColor = useCallback((c: string) => { setTheme(t => ({ ...t, primaryColor: c })); save('primaryColor', c) }, [save])
  const setBorderRadius = useCallback((r: number) => { setTheme(t => ({ ...t, borderRadius: r })); save('borderRadius', r) }, [save])
  const setAnimationSpeed = useCallback((s: number) => { setTheme(t => ({ ...t, animationSpeed: s })); save('animationSpeed', s) }, [save])
  const setFontSize = useCallback((s: number) => { setTheme(t => ({ ...t, fontSize: s })); save('fontSize', s) }, [save])
  const setMode = useCallback((m: 'dark' | 'light') => { setTheme(t => ({ ...t, mode: m })); save('themeMode', m) }, [save])
  const setAnimationPreset = useCallback((id: string) => { setTheme(t => ({ ...t, animationPreset: id })); save('animationPreset', id) }, [save])
  const setBackgroundGradient = useCallback((g: string) => { setTheme(t => ({ ...t, backgroundGradient: g })); save('backgroundGradient', g) }, [save])
  const setGradientIntensity = useCallback((v: number) => { setTheme(t => ({ ...t, gradientIntensity: v })); save('gradientIntensity', v) }, [save])

  const getPreset = useCallback(() => ANIMATION_PRESETS[theme.animationPreset] || ANIMATION_PRESETS.default, [theme.animationPreset])

  const exportSettings = useCallback(() => {
    return JSON.stringify(theme, null, 2)
  }, [theme])

  const importSettings = useCallback((json: string) => {
    try {
      const data = JSON.parse(json)
      const merged: ThemeState = { ...defaultTheme }
      if (data.primaryColor) merged.primaryColor = data.primaryColor
      if (data.borderRadius != null) merged.borderRadius = data.borderRadius
      if (data.animationSpeed != null) merged.animationSpeed = data.animationSpeed
      if (data.fontSize != null) merged.fontSize = data.fontSize
      if (data.mode === 'light' || data.mode === 'dark') merged.mode = data.mode
      if (data.animationPreset && ANIMATION_PRESETS[data.animationPreset]) merged.animationPreset = data.animationPreset
      if (data.backgroundGradient) merged.backgroundGradient = data.backgroundGradient
      if (data.gradientIntensity != null) merged.gradientIntensity = data.gradientIntensity
      setTheme(merged)
      Object.entries(merged).forEach(([k, v]) => {
        if (k === 'mode') window.api.setStore('themeMode', v)
        else window.api.setStore(k, v)
      })
      return true
    } catch { return false }
  }, [])

  return (
    <ThemeContext.Provider value={{
      ...theme, setPrimaryColor, setBorderRadius, setAnimationSpeed, setFontSize,
      setMode, setAnimationPreset, setBackgroundGradient, setGradientIntensity, getPreset,
      exportSettings, importSettings,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() { return useContext(ThemeContext) }

/* ─── helpers ─── */
function hexToHSL(hex: string) {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}
function hslToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}
