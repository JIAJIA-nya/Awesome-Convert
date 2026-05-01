import { contextBridge, ipcRenderer, webUtils } from 'electron'

const api = {
  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

  // File dialog
  openFiles: (filters?: { name: string; extensions: string[] }[]) =>
    ipcRenderer.invoke('dialog:openFiles', filters ? { filters } : undefined),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),

  // File path helper — 解决 contextIsolation 下 f.path 为空的问题
  getPathForFile: (file: File) => webUtils.getPathForFile(file),

  // Store
  getStore: (key: string, defaultValue?: any) => ipcRenderer.invoke('store:get', key, defaultValue),
  setStore: (key: string, value: any) => ipcRenderer.send('store:set', key, value),
  getAllStore: () => ipcRenderer.invoke('store:getAll'),
  setAllStore: (data: Record<string, any>) => ipcRenderer.send('store:setAll', data),

  // Auto launch
  isAutoLaunchEnabled: () => ipcRenderer.invoke('autoLaunch:isEnabled'),
  setAutoLaunch: (enable: boolean) => ipcRenderer.send('autoLaunch:set', enable),

  // Context menu
  registerContextMenu: () => ipcRenderer.send('contextMenu:register'),
  unregisterContextMenu: () => ipcRenderer.send('contextMenu:unregister'),

  // Shell
  openPath: (path: string) => ipcRenderer.send('shell:openPath', path),
  showItemInFolder: (path: string) => ipcRenderer.send('shell:showItemInFolder', path),
  openExternal: (url: string) => ipcRenderer.send('shell:openExternal', url),

  // Announcements
  fetchAnnouncement: () => ipcRenderer.invoke('announcement:fetch'),
  onAnnouncement: (callback: (data: any) => void) => {
    ipcRenderer.on('announcement:show', (_, data) => callback(data))
  },

  // Updates
  checkUpdate: () => ipcRenderer.invoke('update:check'),
  onUpdateAvailable: (callback: (data: any) => void) => {
    ipcRenderer.on('update:available', (_, data) => callback(data))
  },

  // Conversion
  startConvert: (params: {
    inputPath: string
    outputFormat: string
    outputDir?: string
    options?: Record<string, any>
  }) => ipcRenderer.invoke('convert:start', params),
  onConvertProgress: (callback: (data: { progress: number; message: string }) => void) => {
    ipcRenderer.on('convert:progress', (_, data) => callback(data))
  },
  cancelConvert: () => ipcRenderer.send('convert:cancel'),

  // App info
  getVersion: () => ipcRenderer.invoke('app:version'),
  getAppName: () => ipcRenderer.invoke('app:name'),

  // CLI mode
  onStartCliConversion: (callback: (args: any) => void) => {
    ipcRenderer.on('start-cli-conversion', (_, args) => callback(args))
  },
}

contextBridge.exposeInMainWorld('api', api)

export type ElectronAPI = typeof api
