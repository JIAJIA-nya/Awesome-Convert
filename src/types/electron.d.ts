interface ElectronAPI {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  openFiles: (filters?: { name: string; extensions: string[] }[]) => Promise<string[]>
  openDirectory: () => Promise<string | null>
  getPathForFile: (file: File) => string
  getStore: (key: string, defaultValue?: any) => Promise<any>
  setStore: (key: string, value: any) => void
  getAllStore: () => Promise<Record<string, any>>
  setAllStore: (data: Record<string, any>) => void
  isAutoLaunchEnabled: () => Promise<boolean>
  setAutoLaunch: (enable: boolean) => void
  registerContextMenu: () => void
  unregisterContextMenu: () => void
  openPath: (path: string) => void
  showItemInFolder: (path: string) => void
  openExternal: (url: string) => void
  fetchAnnouncement: () => Promise<{ content: string; hash: string; isNew: boolean; title?: string }>
  onAnnouncement: (callback: (data: { content: string; title?: string }) => void) => void
  checkUpdate: () => Promise<{
    hasUpdate: boolean
    currentVersion: string
    latestVersion?: string
    releaseNotes?: string
    releaseDate?: string
    releaseUrl?: string
    error?: string
  }>
  onUpdateAvailable: (callback: (data: any) => void) => void
  startConvert: (params: {
    inputPath: string
    outputFormat: string
    outputDir?: string
    options?: Record<string, any>
  }) => Promise<{ success: boolean; outputPath?: string; error?: string }>
  onConvertProgress: (callback: (data: { progress: number; message: string }) => void) => void
  cancelConvert: () => void
  getVersion: () => Promise<string>
  getAppName: () => Promise<string>
  onStartCliConversion: (callback: (args: any) => void) => void
}

declare interface Window {
  api: ElectronAPI
}
