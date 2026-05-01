import { BrowserWindow } from 'electron'
import { app } from 'electron'
import { Store } from './store'
import { updateTray } from './tray'

const GITHUB_REPO = 'JIAJIA-nya/Awesome-Convert'

interface UpdateInfo {
  hasUpdate: boolean
  currentVersion: string
  latestVersion?: string
  releaseNotes?: string
  releaseDate?: string
  releaseUrl?: string
  error?: string
}

export async function checkForUpdates(): Promise<UpdateInfo> {
  const currentVersion = app.getVersion()

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { hasUpdate: false, currentVersion, error: '暂无发布版本' }
      }
      throw new Error(`GitHub API 返回 ${response.status}`)
    }

    const data = await response.json() as any
    const latestVersion = (data.tag_name || '').replace(/^v/, '')
    const releaseNotes = data.body || '暂无更新日志'
    const releaseDate = data.published_at ? new Date(data.published_at).toLocaleDateString('zh-CN') : '未知'
    const releaseUrl = data.html_url

    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0

    return {
      hasUpdate,
      currentVersion,
      latestVersion,
      releaseNotes,
      releaseDate,
      releaseUrl,
    }
  } catch (e: any) {
    return { hasUpdate: false, currentVersion, error: e.message }
  }
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0
    const nb = pb[i] || 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

export async function setupUpdateChecker(mainWindow: BrowserWindow, store: Store) {
  const autoCheck = store.get('autoCheckUpdate', true)
  if (!autoCheck) return

  const frequency = store.get('updateCheckFrequency', 'daily')
  const lastCheck = store.get('lastUpdateCheck', 0)
  const now = Date.now()
  const day = 86400000

  let shouldCheck = false
  if (frequency === 'startup') shouldCheck = true
  else if (frequency === 'daily' && now - lastCheck > day) shouldCheck = true
  else if (frequency === 'weekly' && now - lastCheck > day * 7) shouldCheck = true

  if (shouldCheck) {
    const result = await checkForUpdates()
    store.set('lastUpdateCheck', now)

    if (result.hasUpdate) {
      updateTray(true)
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('update:available', result)
      })
      if (!mainWindow.webContents.isLoading()) {
        mainWindow.webContents.send('update:available', result)
      }
    }
  }
}
