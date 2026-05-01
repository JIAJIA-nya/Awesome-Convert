import { BrowserWindow } from 'electron'
import { createHash } from 'crypto'
import { Store } from './store'

interface AnnouncementResult {
  content: string
  hash: string
  isNew: boolean
  title?: string
}

export async function getLatestAnnouncement(url: string): Promise<AnnouncementResult> {
  try {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)/)
    if (!match) throw new Error('公告地址格式不正确')
    const [, owner, repo, branch, path] = match
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
    const response = await fetch(apiUrl, { headers: { 'Accept': 'application/vnd.github.v3+json' } })
    if (!response.ok) throw new Error(`获取公告失败: ${response.status}`)
    const files = await response.json() as any[]
    if (!Array.isArray(files) || files.length === 0) return { content: '', hash: '', isNew: false }
    const mdFile = files.find((f: any) => f.name?.endsWith('.md')) || files[0]
    if (!mdFile?.download_url) return { content: '', hash: '', isNew: false }
    const contentResponse = await fetch(mdFile.download_url)
    if (!contentResponse.ok) throw new Error('获取公告内容失败')
    const content = await contentResponse.text()
    const hash = createHash('md5').update(content).digest('hex')
    return { content, hash, isNew: true, title: mdFile.name }
  } catch (e: any) {
    console.error('Announcement fetch error:', e)
    throw e
  }
}

export async function setupAnnouncements(mainWindow: BrowserWindow, store: Store) {
  const enabled = store.get('announcementEnabled', true)
  if (!enabled) return

  const dismissed = store.get('announcementDismissed', false)
  const lastDate = store.get('lastAnnouncementDate', '')
  const lastHash = store.get('lastAnnouncementHash', '')
  const today = new Date().toISOString().split('T')[0]

  // FIX: 如果用户已经关闭了公告，并且今天是同一天 → 不再显示
  // 只有当 hash 真正改变（内容更新）时才重新展示
  if (dismissed && lastDate === today) return

  try {
    const url = store.get('announcementUrl', 'https://github.com/JIAJIA-nya/Announcement/tree/main/Awesome-Convert')
    const result = await getLatestAnnouncement(url)
    if (!result.content) return

    const contentChanged = result.hash !== lastHash
    const firstTimeToday = lastDate !== today

    // 需要展示的条件：
    // 1. 内容真正改变了（新公告）→ 必须展示
    // 2. 今天第一次打开（不是新内容但新的一天）→ 展示
    // 但已被 dismissed 且 hash 没变 → 不展示
    if (contentChanged || firstTimeToday) {
      // 如果内容没变，只是新一天，检查是否已读
      if (!contentChanged && !firstTimeToday) return

      const send = () => {
        mainWindow.webContents.send('announcement:show', {
          content: result.content,
          title: result.title,
        })
      }

      if (mainWindow.webContents.isLoading()) {
        mainWindow.webContents.once('did-finish-load', send)
      } else {
        send()
      }

      // 只有内容真正变化时才重置 dismissed
      if (contentChanged) {
        store.set('announcementDismissed', false)
      }
      store.set('lastAnnouncementHash', result.hash)
      store.set('lastAnnouncementDate', today)
    }
  } catch (e) {
    console.error('Announcement setup error:', e)
  }
}

export function dismissAnnouncement(store: Store) {
  store.set('announcementDismissed', true)
}
