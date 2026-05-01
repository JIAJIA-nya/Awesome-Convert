import { BrowserWindow } from 'electron'
import { createHash } from 'crypto'
import { Store } from './store'

interface AnnouncementResult {
  content: string
  hash: string
  title?: string
}

export async function getLatestAnnouncement(url: string): Promise<AnnouncementResult> {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)/)
  if (!match) throw new Error('公告地址格式不正确')
  const [, owner, repo, branch, path] = match
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
  const response = await fetch(apiUrl, { headers: { 'Accept': 'application/vnd.github.v3+json' } })
  if (!response.ok) throw new Error(`获取公告失败: ${response.status}`)
  const files = await response.json() as any[]
  if (!Array.isArray(files) || files.length === 0) throw new Error('公告仓库为空')
  const mdFile = files.find((f: any) => f.name?.endsWith('.md')) || files[0]
  if (!mdFile?.download_url) throw new Error('找不到公告文件')
  const contentResponse = await fetch(mdFile.download_url)
  if (!contentResponse.ok) throw new Error('获取公告内容失败')
  const content = await contentResponse.text()
  const hash = createHash('md5').update(content).digest('hex')
  return { content, hash, title: mdFile.name }
}

/** 向渲染进程发送公告 */
function sendAnnouncement(win: BrowserWindow, data: { content: string; title?: string }) {
  const send = () => win.webContents.send('announcement:show', data)
  if (win.webContents.isLoading()) {
    win.webContents.once('did-finish-load', send)
  } else {
    send()
  }
}

/** 每次启动都展示公告 */
export async function setupAnnouncements(mainWindow: BrowserWindow, store: Store) {
  const enabled = store.get('announcementEnabled', true)
  if (!enabled) return

  try {
    const url = store.get('announcementUrl',
      'https://github.com/JIAJIA-nya/Announcement/tree/main/Awesome-Convert')
    const result = await getLatestAnnouncement(url)
    if (!result.content) return

    sendAnnouncement(mainWindow, { content: result.content, title: result.title })
    store.set('lastAnnouncementHash', result.hash)
  } catch (e) {
    // 网络失败时静默，不打扰用户
    console.error('Announcement fetch error:', e)
  }
}
