import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { Store } from './store'

let tray: Tray | null = null

function getIconPath(): string {
  const appPath = app.getAppPath()
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

export function setupTray(mainWindow: BrowserWindow, store: Store) {
  const iconPath = getIconPath()
  const icon = nativeImage.createFromPath(iconPath)
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true)
  }
  tray = new Tray(icon)
  tray.setToolTip('Awesome-Convert')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开主窗口',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      },
    },
    { type: 'separator' },
    {
      label: '右键菜单: ' + (store.get('contextMenuEnabled', true) ? '已启用' : '已禁用'),
      enabled: false,
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    mainWindow.show()
    mainWindow.focus()
  })
}

export function updateTray(hasUpdate: boolean) {
  if (!tray) return
  if (hasUpdate) {
    tray.setToolTip('Awesome-Convert (有新版本)')
  } else {
    tray.setToolTip('Awesome-Convert')
  }
}

export function destroyTray() {
  tray?.destroy()
  tray = null
}
