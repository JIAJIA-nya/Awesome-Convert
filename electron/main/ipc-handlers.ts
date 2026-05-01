import { ipcMain, dialog, BrowserWindow, shell, app } from 'electron'
import { Store } from './store'
import { setupAutoLaunch, isAutoLaunchEnabled } from './auto-launch'
import { registerContextMenu, unregisterContextMenu } from './context-menu'
import { getLatestAnnouncement } from './announcements'
import { checkForUpdates } from './updater'
import { convertFile } from './converter'

export function setupIpcHandlers(store: Store) {
  // Window controls
  ipcMain.on('window:minimize', () => {
    BrowserWindow.getFocusedWindow()?.minimize()
  })

  ipcMain.on('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      win.isMaximized() ? win.unmaximize() : win.maximize()
    }
  })

  ipcMain.on('window:close', () => {
    BrowserWindow.getFocusedWindow()?.close()
  })

  ipcMain.handle('window:isMaximized', () => {
    return BrowserWindow.getFocusedWindow()?.isMaximized() ?? false
  })

  // File dialog
  ipcMain.handle('dialog:openFiles', async (_, options?: { filters?: { name: string; extensions: string[] }[] }) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: options?.filters,
    })
    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // Store
  ipcMain.handle('store:get', (_, key: string, defaultValue?: any) => {
    return store.get(key, defaultValue)
  })

  ipcMain.on('store:set', (_, key: string, value: any) => {
    store.set(key, value)
  })

  ipcMain.handle('store:getAll', () => {
    return store.getAll()
  })

  ipcMain.on('store:setAll', (_, data: Record<string, any>) => {
    store.setAll(data)
  })

  // Auto launch
  ipcMain.handle('autoLaunch:isEnabled', async () => {
    return isAutoLaunchEnabled()
  })

  ipcMain.on('autoLaunch:set', async (_, enable: boolean) => {
    store.set('autoLaunch', enable)
    await setupAutoLaunch(enable)
  })

  // Context menu
  ipcMain.on('contextMenu:register', () => {
    registerContextMenu(store)
  })

  ipcMain.on('contextMenu:unregister', () => {
    unregisterContextMenu()
  })

  // Open folder
  ipcMain.on('shell:openPath', (_, path: string) => {
    shell.openPath(path)
  })

  ipcMain.on('shell:showItemInFolder', (_, path: string) => {
    shell.showItemInFolder(path)
  })

  // Announcement
  ipcMain.handle('announcement:fetch', async () => {
    const url = store.get('announcementUrl', 'https://github.com/JIAJIA-nya/Announcement/tree/main/Awesome-Convert')
    return getLatestAnnouncement(url)
  })

  // Updates
  ipcMain.handle('update:check', async () => {
    return checkForUpdates()
  })

  // Conversion
  ipcMain.handle('convert:start', async (event, params) => {
    const { inputPath, outputFormat, outputDir, options } = params
    const win = BrowserWindow.fromWebContents(event.sender)

    try {
      const result = await convertFile({
        inputPath,
        outputFormat,
        outputDir,
        options,
        onProgress: (progress: number, message: string) => {
          win?.webContents.send('convert:progress', { progress, message })
        },
      })
      return { success: true, outputPath: result }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.on('convert:cancel', () => {
    // Signal cancellation to converter
  })

  // App info
  ipcMain.handle('app:version', () => app.getVersion())
  ipcMain.handle('app:name', () => app.getName())

  // Open external URL
  ipcMain.on('shell:openExternal', (_, url: string) => {
    shell.openExternal(url)
  })
}
