import { app, BrowserWindow, shell, ipcMain, nativeTheme } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'

const is = { dev: !app.isPackaged }
const appPath = app.getAppPath()
const preloadPath = join(__dirname, '../preload/index.js')
import { setupTray } from './tray'
import { setupAutoLaunch } from './auto-launch'
import { registerContextMenu, unregisterContextMenu } from './context-menu'
import { setupIpcHandlers } from './ipc-handlers'
import { setupUpdateChecker } from './updater'
import { setupAnnouncements } from './announcements'
import { Store } from './store'
import { parseArgs } from './cli'

let mainWindow: BrowserWindow | null = null
let progressWindow: BrowserWindow | null = null
let isQuitting = false
const store = new Store()

function getIconPath(): string {
  const candidates = [
    join(appPath, 'build/icon.png'),
    join(__dirname, '../../build/icon.png'),
    join(__dirname, '../../../build/icon.png'),
    join(appPath, 'resources/icon.png'),
  ]
  for (const p of candidates) {
    if (existsSync(p)) return p
  }
  return candidates[0]
}

export function getMainWindow() { return mainWindow }
export function getProgressWindow() { return progressWindow }
export function getStore() { return store }

function createMainWindow(): BrowserWindow {
  const iconPath = getIconPath()
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0f1a',
    icon: iconPath,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.on('ready-to-show', () => {
    win.show()
    win.focus()
  })

  // Close → hide to tray instead of quitting
  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      win.hide()
    }
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(appPath, 'dist/index.html'))
  }

  return win
}

function createProgressWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 320,
    height: 120,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    icon: getIconPath(),
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.setAlwaysOnTop(true, 'screen-saver')

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/progress.html`)
  } else {
    win.loadFile(join(appPath, 'dist/progress.html'))
  }

  return win
}

app.whenReady().then(async () => {
  // Check if CLI mode
  const cliArgs = parseArgs(process.argv)
  if (cliArgs.cliMode) {
    progressWindow = createProgressWindow()
    setupIpcHandlers(store)
    // Trigger conversion from CLI
    progressWindow.webContents.on('did-finish-load', () => {
      progressWindow?.webContents.send('start-cli-conversion', cliArgs)
    })
    return
  }

  mainWindow = createMainWindow()
  setupIpcHandlers(store)
  setupTray(mainWindow, store)

  // Auto launch
  const autoLaunchEnabled = store.get('autoLaunch', false)
  setupAutoLaunch(autoLaunchEnabled)

  // Context menu
  const contextMenuEnabled = store.get('contextMenuEnabled', true)
  if (contextMenuEnabled) {
    registerContextMenu(store)
  }

  // Update checker
  setupUpdateChecker(mainWindow, store)

  // Announcements
  setupAnnouncements(mainWindow, store)

})

app.on('window-all-closed', () => {
  // Don't quit — app stays in tray
})

app.on('before-quit', () => {
  isQuitting = true
  unregisterContextMenu()
})
