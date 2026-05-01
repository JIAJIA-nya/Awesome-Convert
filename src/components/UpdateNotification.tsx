import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

interface UpdateInfo {
  hasUpdate: boolean
  currentVersion: string
  latestVersion?: string
  releaseNotes?: string
  releaseDate?: string
  releaseUrl?: string
  error?: string
}

interface UpdateNotificationProps {
  updateInfo: UpdateInfo | null
  checking: boolean
  onCheck: () => void
  onDismiss: () => void
}

export default function UpdateNotification({ updateInfo, checking, onCheck, onDismiss }: UpdateNotificationProps) {
  const [showNotes, setShowNotes] = useState(false)

  if (!updateInfo) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {updateInfo.error && !updateInfo.hasUpdate ? (
        <div className="p-4 rounded-ac bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-yellow-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-400">检查更新失败</p>
              <p className="text-xs text-text-muted mt-1">{updateInfo.error}</p>
            </div>
            <button
              onClick={onCheck}
              disabled={checking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
              重试
            </button>
          </div>
          <button
            onClick={() => window.api.openExternal('https://github.com/JIAJIA-nya/Awesome-Convert/releases')}
            className="text-xs text-text-muted hover:text-primary mt-2 transition-colors"
          >
            手动查看更新页面
          </button>
        </div>
      ) : updateInfo.hasUpdate ? (
        <div className="p-4 rounded-ac bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-start gap-3">
            <Download size={18} className="text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-indigo-400">发现新版本 v{updateInfo.latestVersion}</p>
              <p className="text-xs text-text-muted mt-1">当前版本: v{updateInfo.currentVersion} | 发布日期: {updateInfo.releaseDate}</p>
              {updateInfo.releaseNotes && (
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-xs text-primary mt-2 hover:underline"
                >
                  {showNotes ? '收起更新日志' : '查看更新日志'}
                </button>
              )}
              <AnimatePresence>
                {showNotes && updateInfo.releaseNotes && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-3 rounded-lg bg-surface text-xs text-text-secondary whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {updateInfo.releaseNotes}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={onDismiss}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-muted text-sm transition-colors"
              >
                <Clock size={14} />
                稍后
              </button>
              <button
                onClick={() => updateInfo.releaseUrl && window.api.openExternal(updateInfo.releaseUrl)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
              >
                <Download size={14} />
                下载
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-ac bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-emerald-400">你正在使用最新版本</p>
              <p className="text-xs text-text-muted mt-1">v{updateInfo.currentVersion}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
