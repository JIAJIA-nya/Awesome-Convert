import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'

interface StoreData {
  theme?: string
  primaryColor?: string
  borderRadius?: number
  animationSpeed?: number
  fontSize?: number
  autoLaunch?: boolean
  contextMenuEnabled?: boolean
  contextMenuCategories?: string[]
  announcementEnabled?: boolean
  announcementUrl?: string
  lastAnnouncementHash?: string
  lastAnnouncementDate?: string
  announcementDismissed?: boolean
  autoCheckUpdate?: boolean
  updateCheckFrequency?: string
  defaultVideoBitrate?: string
  defaultVideoResolution?: string
  defaultVideoCodec?: string
  defaultCompressLevel?: number
  defaultOutputDir?: string
  outputDirMode?: string
  animationPreset?: string
  [key: string]: any
}

export class Store {
  private data: StoreData = {}
  private filePath: string

  constructor() {
    const userDataPath = app.getPath('userData')
    this.filePath = join(userDataPath, 'config.json')
    this.load()
  }

  private load() {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8')
        this.data = JSON.parse(raw)
      }
    } catch {
      this.data = {}
    }
  }

  private save() {
    try {
      const dir = join(this.filePath, '..')
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      writeFileSync(this.filePath, JSON.stringify(this.data, null, 2))
    } catch (e) {
      console.error('Failed to save config:', e)
    }
  }

  get(key: string, defaultValue?: any): any {
    return this.data[key] ?? defaultValue
  }

  set(key: string, value: any) {
    this.data[key] = value
    this.save()
  }

  getAll(): StoreData {
    return { ...this.data }
  }

  setAll(data: StoreData) {
    this.data = { ...this.data, ...data }
    this.save()
  }
}
