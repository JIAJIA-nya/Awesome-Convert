import { execSync } from 'child_process'
import { app } from 'electron'
import { Store } from './store'

const MENU_LABEL = 'Awesome-Convert'
const MENU_ID = 'AwesomeConvert'

// 每个源格式最多展示的转换目标数
const MAX_TARGETS = 5

const FORMAT_MAP: Record<string, Record<string, string[]>> = {
  archive: {
    zip: ['rar', '7z', 'tar', 'tar.gz'],
    rar: ['zip', '7z', 'tar', 'tar.gz'],
    '7z': ['zip', 'rar', 'tar', 'tar.gz'],
    tar: ['zip', 'rar', '7z', 'tar.gz'],
    'tar.gz': ['zip', 'rar', '7z', 'tar'],
  },
  video: {
    mp4: ['mkv', 'avi', 'mov', 'wmv', 'webm'],
    mkv: ['mp4', 'avi', 'mov', 'wmv', 'webm'],
    avi: ['mp4', 'mkv', 'mov', 'wmv', 'webm'],
    mov: ['mp4', 'mkv', 'avi', 'wmv', 'webm'],
    wmv: ['mp4', 'mkv', 'avi', 'mov', 'webm'],
    flv: ['mp4', 'mkv', 'avi', 'mov', 'webm'],
    webm: ['mp4', 'mkv', 'avi', 'mov', 'wmv'],
  },
  audio: {
    mp3: ['wav', 'flac', 'aac', 'ogg', 'm4a'],
    wav: ['mp3', 'flac', 'aac', 'ogg', 'm4a'],
    flac: ['mp3', 'wav', 'aac', 'ogg', 'm4a'],
    aac: ['mp3', 'wav', 'flac', 'ogg', 'm4a'],
    ogg: ['mp3', 'wav', 'flac', 'aac', 'm4a'],
    m4a: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
  },
  image: {
    jpg: ['png', 'webp', 'bmp', 'gif', 'ico'],
    jpeg: ['png', 'webp', 'bmp', 'gif', 'ico'],
    png: ['jpg', 'webp', 'bmp', 'gif', 'ico'],
    webp: ['jpg', 'png', 'bmp', 'gif', 'ico'],
    bmp: ['jpg', 'png', 'webp', 'gif', 'ico'],
    gif: ['jpg', 'png', 'webp', 'bmp', 'ico'],
    ico: ['jpg', 'png', 'webp', 'bmp', 'gif'],
  },
  document: {
    pdf: ['docx', 'txt', 'html'],
    docx: ['pdf', 'txt', 'html'],
    txt: ['pdf', 'docx', 'html'],
    html: ['pdf', 'txt', 'md'],
    md: ['html', 'txt', 'pdf'],
    csv: ['xlsx', 'txt', 'json'],
    xlsx: ['csv', 'json', 'txt'],
  },
}

function reg(path: string, valueName: string, value: string, type = 'REG_SZ') {
  try {
    execSync(`reg add "${path}" /v "${valueName}" /t ${type} /d "${value}" /f`, { stdio: 'ignore' })
  } catch {}
}

function regDelete(path: string) {
  try {
    execSync(`reg delete "${path}" /f`, { stdio: 'ignore' })
  } catch {}
}

export function registerContextMenu(store: Store) {
  // 先清除旧的
  unregisterContextMenu()

  const enabledCategories: string[] = store.get('contextMenuCategories',
    ['archive', 'video', 'audio', 'image', 'document'])
  const appPath = app.getPath('exe')
  const baseKey = `HKCU\\Software\\Classes\\*\\shell\\${MENU_ID}`

  // 主菜单项：显示名称，SubCommands 为空表示有子菜单
  reg(baseKey, 'MUIVerb', MENU_LABEL)
  reg(baseKey, 'Icon', `"${appPath}",0`)
  reg(baseKey, 'SubCommands', '', 'REG_SZ')

  // 每个扩展名 + 目标格式 → 子菜单项
  for (const category of enabledCategories) {
    const formats = FORMAT_MAP[category]
    if (!formats) continue

    for (const [srcExt, allTargets] of Object.entries(formats)) {
      const targets = allTargets.slice(0, MAX_TARGETS)
      for (const targetExt of targets) {
        // 用下划线替换点，确保注册表键名合法
        const safeSrc = srcExt.replace(/\./g, '_')
        const safeTarget = targetExt.replace(/\./g, '_')
        const subId = `${category}_${safeSrc}_to_${safeTarget}`
        const subKey = `${baseKey}\\shell\\${subId}`
        const cmdKey = `${subKey}\\command`

        const command = `"${appPath}" --cli --input "%1" --to ${targetExt}`

        reg(subKey, '', `转为 .${targetExt}`, 'REG_SZ')
        reg(cmdKey, '', command, 'REG_SZ')
      }
    }
  }
}

export function unregisterContextMenu() {
  regDelete(`HKCU\\Software\\Classes\\*\\shell\\${MENU_ID}`)
}
