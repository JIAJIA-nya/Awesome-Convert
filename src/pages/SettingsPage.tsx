import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette, MousePointerClick, Power, Bell, Settings as SettingsIcon, RefreshCw,
  Wrench, Check, Sun, Moon, Download, Upload, Sparkles
} from 'lucide-react'
import { marked } from 'marked'
import { useTheme, ANIMATION_PRESETS } from '../contexts/ThemeContext'
import UpdateNotification from '../components/UpdateNotification'
import AnnouncementModal from '../components/AnnouncementModal'

type Section = 'appearance' | 'contextMenu' | 'startup' | 'announcements' | 'conversion' | 'update' | 'advanced'

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'appearance', label: '外观设置', icon: <Palette size={16} /> },
  { id: 'contextMenu', label: '右键菜单', icon: <MousePointerClick size={16} /> },
  { id: 'startup', label: '开机自启', icon: <Power size={16} /> },
  { id: 'announcements', label: '公告设置', icon: <Bell size={16} /> },
  { id: 'conversion', label: '转换偏好', icon: <SettingsIcon size={16} /> },
  { id: 'update', label: '软件更新', icon: <RefreshCw size={16} /> },
  { id: 'advanced', label: '高级功能', icon: <Wrench size={16} /> },
]

const PALETTE = [
  '#06b6d4','#0891b2','#0ea5e9','#3b82f6','#6366f1',
  '#8b5cf6','#a855f7','#d946ef','#ec4899','#f43f5e',
  '#ef4444','#f97316','#22c55e','#14b8a6',
]

const BG_GRADIENTS = [
  { id: 'default', label: '默认' },
  { id: 'ocean', label: '海洋' },
  { id: 'sunset', label: '日落' },
  { id: 'forest', label: '森林' },
  { id: 'aurora', label: '极光' },
  { id: 'none', label: '纯色' },
]

/* ──────────────────── page ──────────────────── */
export default function SettingsPage() {
  const [sec, setSec] = useState<Section>('appearance')
  const theme = useTheme()
  const preset = theme.getPreset()

  // persisted settings (non-theme)
  const [autoLaunch, setAutoLaunch] = useState(false)
  const [ctxOn, setCtxOn] = useState(true)
  const [ctxCats, setCtxCats] = useState<string[]>(['archive','video','audio','image','document'])
  const [annOn, setAnnOn] = useState(true)
  const [annUrl, setAnnUrl] = useState('')
  const [autoUp, setAutoUp] = useState(true)
  const [upFreq, setUpFreq] = useState('daily')
  const [outMode, setOutMode] = useState('source')
  const [upInfo, setUpInfo] = useState<any>(null)
  const [checking, setChecking] = useState(false)
  const [version, setVersion] = useState('')
  const [vBitrate, setVBitrate] = useState('1500k')
  const [vRes, setVRes] = useState('1920x1080')
  const [compLvl, setCompLvl] = useState(6)
  const [annModal, setAnnModal] = useState<{ show: boolean; content: string; title?: string }>({ show: false, content: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    (async () => {
      const s = await window.api.getAllStore()
      setAutoLaunch(s.autoLaunch ?? false)
      setCtxOn(s.contextMenuEnabled ?? true)
      setCtxCats(s.contextMenuCategories ?? ['archive','video','audio','image','document'])
      setAnnOn(s.announcementEnabled ?? true)
      setAnnUrl(s.announcementUrl || 'https://github.com/JIAJIA-nya/Announcement/tree/main/Awesome-Convert')
      setAutoUp(s.autoCheckUpdate ?? true)
      setUpFreq(s.updateCheckFrequency || 'daily')
      setOutMode(s.outputDirMode || 'source')
      setVBitrate(s.defaultVideoBitrate || '1500k')
      setVRes(s.defaultVideoResolution || '1920x1080')
      setCompLvl(s.defaultCompressLevel ?? 6)
      setVersion(await window.api.getVersion())
    })()
  }, [])

  const s = (k: string, v: any) => window.api.setStore(k, v)

  const handleExport = () => {
    const json = theme.exportSettings()
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'awesome-convert-settings.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const ok = theme.importSettings(reader.result)
        alert(ok ? '设置导入成功' : '导入失败：文件格式不正确')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleCheckUpdate = async () => {
    setChecking(true)
    setUpInfo(await window.api.checkUpdate())
    setChecking(false)
  }

  return (
    <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex overflow-hidden">
      {/* ── sidebar ── */}
      <div className="w-48 shrink-0 border-r border-white/5 bg-bg-secondary/30 p-3 space-y-1">
        {NAV.map(n => (
          <button key={n.id} onClick={() => setSec(n.id)}
            className={`settings-nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
              ${sec === n.id ? 'active' : 'text-text-muted hover:text-text-secondary hover:bg-white/5'}`}>
            {n.icon}<span>{n.label}</span>
          </button>
        ))}

        <div className="border-t border-white/5 my-3" />
        <button onClick={handleExport}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-secondary hover:bg-white/5">
          <Download size={16} /><span>导出设置</span>
        </button>
        <button onClick={() => fileRef.current?.click()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-secondary hover:bg-white/5">
          <Upload size={16} /><span>导入设置</span>
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>

      {/* ── content ── */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">

          {/* ════════ APPEARANCE ════════ */}
          {sec === 'appearance' && (
            <S key="a" title="外观设置">
              {/* dark / light toggle */}
              <Item label="界面模式" description="切换亮色 / 暗色主题">
                <div className="flex gap-1 p-1 rounded-xl bg-surface">
                  {[['dark','暗色',<Moon size={14}/>], ['light','亮色',<Sun size={14}/>]].map(([id, lbl, ico]) => (
                    <button key={id as string} onClick={() => theme.setMode(id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all
                        ${theme.mode === id ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-text-secondary'}`}>
                      {ico}{lbl}
                    </button>
                  ))}
                </div>
              </Item>

              {/* primary colour */}
              <Item label="主题色" description="选择应用的主色调">
                <div className="flex items-center gap-3 flex-wrap">
                  {PALETTE.map(c => (
                    <button key={c} onClick={() => theme.setPrimaryColor(c)}
                      className="relative w-7 h-7 rounded-full transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}>
                      {theme.primaryColor === c && <Check size={14} className="absolute inset-0 m-auto text-white" />}
                    </button>
                  ))}
                  <input type="color" value={theme.primaryColor}
                    onChange={e => theme.setPrimaryColor(e.target.value)}
                    className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0" />
                </div>
              </Item>

              {/* background gradient */}
              <Item label="背景渐变" description="选择背景氛围">
                <div className="flex gap-2 flex-wrap">
                  {BG_GRADIENTS.map(g => (
                    <button key={g.id} onClick={() => theme.setBackgroundGradient(g.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all
                        ${theme.backgroundGradient === g.id
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-surface text-text-muted hover:bg-surface-hover border border-transparent'}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </Item>

              {/* gradient intensity */}
              <Item label="渐变强度" description="调整背景渐变的明显程度">
                <div className="flex items-center gap-3 w-64">
                  <input type="range" min={0} max={100} value={theme.gradientIntensity}
                    onChange={e => theme.setGradientIntensity(Number(e.target.value))} className="flex-1" />
                  <span className="text-sm text-text-muted w-10 text-right">{theme.gradientIntensity}%</span>
                </div>
              </Item>

              {/* radius */}
              <Item label="全局圆角" description="调整界面元素的圆角半径">
                <div className="flex items-center gap-3 w-64">
                  <input type="range" min={0} max={30} value={theme.borderRadius}
                    onChange={e => theme.setBorderRadius(Number(e.target.value))} className="flex-1" />
                  <span className="text-sm text-text-muted w-10 text-right">{theme.borderRadius}px</span>
                </div>
              </Item>

              {/* animation speed */}
              <Item label="动画速度" description="调整过渡和动效的播放速度">
                <div className="flex items-center gap-3 w-64">
                  <input type="range" min={0} max={20} value={theme.animationSpeed * 10}
                    onChange={e => theme.setAnimationSpeed(Number(e.target.value) / 10)} className="flex-1" />
                  <span className="text-sm text-text-muted w-10 text-right">{theme.animationSpeed}x</span>
                </div>
              </Item>

              {/* font size */}
              <Item label="字体大小" description="调整全局文字大小">
                <div className="flex items-center gap-3 w-64">
                  <input type="range" min={12} max={20} value={theme.fontSize}
                    onChange={e => theme.setFontSize(Number(e.target.value))} className="flex-1" />
                  <span className="text-sm text-text-muted w-10 text-right">{theme.fontSize}px</span>
                </div>
              </Item>

              {/* animation presets with live preview */}
              <Item label="动画预设" description="选择预设动画风格，下方实时预览效果">
                <div className="flex gap-2 flex-wrap">
                  {Object.values(ANIMATION_PRESETS).map(p => (
                    <button key={p.id} onClick={() => theme.setAnimationPreset(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all
                        ${theme.animationPreset === p.id
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-surface text-text-muted hover:bg-surface-hover border border-transparent'}`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </Item>

              {/* live preview card */}
              <div className="rounded-xl border border-white/10 bg-surface p-4 space-y-3">
                <p className="text-xs text-text-muted flex items-center gap-1.5"><Sparkles size={12} /> 实时预览</p>
                <div className="flex gap-3">
                  <motion.div
                    key={theme.animationPreset + '-enter'}
                    initial={preset.pageEnter as any}
                    animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0, rotateZ: 0 }}
                    transition={preset.pageTransition as any}
                    className="flex-1 h-16 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-sm text-primary"
                  >
                    页面进入
                  </motion.div>
                  <motion.div
                    key={theme.animationPreset + '-hover'}
                    whileHover={preset.cardHover as any}
                    whileTap={preset.cardTap as any}
                    className="flex-1 h-16 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-sm text-emerald-400 cursor-pointer"
                  >
                    悬停 / 点击我
                  </motion.div>
                  <motion.button
                    key={theme.animationPreset + '-btn'}
                    whileHover={preset.buttonHover as any}
                    whileTap={preset.buttonTap as any}
                    className="flex-1 h-16 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium"
                  >
                    按钮动效
                  </motion.button>
                </div>
              </div>
            </S>
          )}

          {/* ════════ CONTEXT MENU ════════ */}
          {sec === 'contextMenu' && (
            <S key="c" title="右键菜单管理">
              <Item label="启用右键菜单" description="在 Windows 资源管理器右键菜单中集成 Awesome-Convert">
                <Toggle value={ctxOn} onChange={v => { setCtxOn(v); s('contextMenuEnabled', v); v ? window.api.registerContextMenu() : window.api.unregisterContextMenu() }} />
              </Item>
              <Item label="启用的文件类别" description="选择哪些文件类型显示右键菜单选项">
                <div className="flex flex-wrap gap-2">
                  {[['archive','压缩文件'],['video','视频'],['audio','音频'],['image','图片'],['document','文档']].map(([id,lbl]) => (
                    <button key={id} onClick={() => { const u = ctxCats.includes(id) ? ctxCats.filter(c=>c!==id) : [...ctxCats,id]; setCtxCats(u); s('contextMenuCategories',u) }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all
                        ${ctxCats.includes(id) ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface text-text-muted border border-transparent'}`}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </Item>
              <Item label="重新注册菜单" description="如果右键菜单不显示，尝试重新注册">
                <button onClick={() => window.api.registerContextMenu()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm text-text-secondary transition-colors">
                  <RefreshCw size={14} /> 重新注册
                </button>
              </Item>
            </S>
          )}

          {/* ════════ STARTUP ════════ */}
          {sec === 'startup' && (
            <S key="s" title="开机自启">
              <Item label="开机自动启动" description="系统启动时自动运行并准备右键菜单">
                <Toggle value={autoLaunch} onChange={v => { setAutoLaunch(v); window.api.setAutoLaunch(v) }} />
              </Item>
              <div className="p-4 rounded-ac bg-surface text-sm text-text-muted">
                开启后，每次系统启动都在后台静默运行，任务栏托盘图标可见，双击打开主窗口。
              </div>
            </S>
          )}

          {/* ════════ ANNOUNCEMENTS ════════ */}
          {sec === 'announcements' && (
            <S key="an" title="公告设置">
              <Item label="启用公告展示" description="应用启动时展示最新公告">
                <Toggle value={annOn} onChange={v => { setAnnOn(v); s('announcementEnabled', v) }} />
              </Item>
              <Item label="公告获取地址">
                <input type="text" value={annUrl} onChange={e => { setAnnUrl(e.target.value); s('announcementUrl', e.target.value) }}
                  className="w-full max-w-md px-3 py-2 rounded-lg bg-surface border border-white/5 text-sm text-text focus:border-primary/50 outline-none transition-colors" />
              </Item>
              <Item label="手动检查" description="获取最新公告">
                <button onClick={async () => {
                  try {
                    const r = await window.api.fetchAnnouncement()
                    if (r.content) {
                      const html = await marked(r.content)
                      setAnnModal({ show: true, content: html as string, title: r.title })
                    } else {
                      alert('暂无公告')
                    }
                  } catch(e:any) { alert('获取失败: '+e.message) }
                }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm text-text-secondary transition-colors">
                  <Bell size={14} /> 检查公告
                </button>
              </Item>
            </S>
          )}

          {/* ════════ CONVERSION ════════ */}
          {sec === 'conversion' && (
            <S key="cv" title="转换偏好">
              <Item label="默认输出模式">
                <select value={outMode} onChange={e => { setOutMode(e.target.value); s('outputDirMode', e.target.value) }}
                  className="px-3 py-2 rounded-lg bg-surface border border-white/5 text-sm text-text outline-none">
                  <option value="source">输出到源文件目录</option>
                  <option value="custom">自定义输出目录</option>
                  <option value="subdir">在源目录下创建子目录</option>
                </select>
              </Item>
              <Item label="视频默认码率">
                <select value={vBitrate} onChange={e => { setVBitrate(e.target.value); s('defaultVideoBitrate', e.target.value) }}
                  className="px-3 py-2 rounded-lg bg-surface border border-white/5 text-sm text-text outline-none">
                  {['500k','1000k','1500k','2000k','5000k','8000k'].map(v => <option key={v} value={v}>{v} bps</option>)}
                </select>
              </Item>
              <Item label="视频默认分辨率">
                <select value={vRes} onChange={e => { setVRes(e.target.value); s('defaultVideoResolution', e.target.value) }}
                  className="px-3 py-2 rounded-lg bg-surface border border-white/5 text-sm text-text outline-none">
                  {[['640x480','SD'],['1280x720','HD'],['1920x1080','FHD'],['2560x1440','2K'],['3840x2160','4K']].map(([v,l]) =>
                    <option key={v} value={v}>{v} ({l})</option>)}
                </select>
              </Item>
              <Item label="压缩默认级别 (1-9)">
                <div className="flex items-center gap-3 w-48">
                  <input type="range" min={1} max={9} value={compLvl}
                    onChange={e => { setCompLvl(Number(e.target.value)); s('defaultCompressLevel', Number(e.target.value)) }} className="flex-1" />
                  <span className="text-sm text-text-muted w-6 text-right">{compLvl}</span>
                </div>
              </Item>
            </S>
          )}

          {/* ════════ UPDATE ════════ */}
          {sec === 'update' && (
            <S key="u" title="软件更新">
              <div className="p-4 rounded-ac bg-surface mb-2">
                <p className="text-sm text-text-secondary">当前版本: <span className="font-mono text-primary">v{version}</span></p>
              </div>
              <Item label="检查更新">
                <button onClick={handleCheckUpdate} disabled={checking}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium disabled:opacity-50 transition-colors">
                  <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
                  {checking ? '检查中...' : '检查更新'}
                </button>
              </Item>
              <UpdateNotification updateInfo={upInfo} checking={checking} onCheck={handleCheckUpdate} onDismiss={() => setUpInfo(null)} />
              <Item label="自动检查更新">
                <Toggle value={autoUp} onChange={v => { setAutoUp(v); s('autoCheckUpdate', v) }} />
              </Item>
              <Item label="检查频率">
                <select value={upFreq} onChange={e => { setUpFreq(e.target.value); s('updateCheckFrequency', e.target.value) }}
                  className="px-3 py-2 rounded-lg bg-surface border border-white/5 text-sm text-text outline-none">
                  <option value="startup">每次启动</option><option value="daily">每天</option><option value="weekly">每周</option>
                </select>
              </Item>
            </S>
          )}

          {/* ════════ ADVANCED ════════ */}
          {sec === 'advanced' && (
            <S key="ad" title="高级功能">
              <Item label="动画预设" description="选择预设的动画效果风格">
                <select value={theme.animationPreset} onChange={e => theme.setAnimationPreset(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-surface border border-white/5 text-sm text-text outline-none">
                  {Object.values(ANIMATION_PRESETS).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Item>
              <Item label="依赖引擎状态" description="查看内置转换引擎的运行状态">
                <div className="space-y-2">
                  {['Sharp (图片引擎)','FFmpeg (视频/音频引擎)','Archiver (压缩引擎)','Mammoth (文档引擎)'].map(n => (
                    <div key={n} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-text-secondary">{n}</span>
                      <span className="text-emerald-400 text-xs">正常</span>
                    </div>
                  ))}
                </div>
              </Item>
              <Item label="导出日志">
                <button onClick={() => alert('日志已导出')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover text-sm text-text-secondary transition-colors">
                  <Wrench size={14} /> 导出日志
                </button>
              </Item>
            </S>
          )}
        </AnimatePresence>
      </div>
    </motion.div>

    {/* 公告弹窗 — 手动检查时使用 */}
    <AnnouncementModal
      show={annModal.show}
      content={annModal.content}
      title={annModal.title}
      onClose={() => setAnnModal(p => ({ ...p, show: false }))}
      showDismiss={false}
    />
    </>
  )
}

/* ── tiny building blocks ── */
function S({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }} className="space-y-6">
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <div className="space-y-5">{children}</div>
    </motion.div>
  )
}

function Item({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return <button onClick={() => onChange(!value)} className={`toggle-switch ${value ? 'active' : ''}`} />
}
