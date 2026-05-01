import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import DropZone from './DropZone'
import FormatSelector from './FormatSelector'
import ConvertButton from './ConvertButton'
import OutputDirSelector from './OutputDirSelector'
import ConversionLog from './ConversionLog'

interface Format {
  id: string
  label: string
  ext: string
  icon?: string
}

interface LogEntry {
  time: string
  message: string
  type: 'info' | 'success' | 'error'
}

interface ConversionPageProps {
  title: string
  description: string
  formats: Format[]
  accept: { name: string; extensions: string[] }[]
  icon: React.ReactNode
}

export default function ConversionPage({ title, description, formats, accept, icon }: ConversionPageProps) {
  const [files, setFiles] = useState<string[]>([])
  const [selectedFormat, setSelectedFormat] = useState('')
  const [outputDir, setOutputDir] = useState('')
  const [outputMode, setOutputMode] = useState<'source' | 'custom' | 'subdir'>('source')
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<{ success: boolean; outputPath?: string; error?: string } | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setLogs(prev => [...prev, { time, message: msg, type }])
  }, [])

  useEffect(() => {
    const handler = (data: { progress: number; message: string }) => {
      setProgress(data.progress)
      setMessage(data.message)
    }
    window.api.onConvertProgress(handler)
    // Note: Electron IPC doesn't expose removeListener via preload;
    // the component unmounts with the tab switch, handler is harmless.
  }, [])

  const canConvert = files.length > 0 && selectedFormat !== ''

  const handleStart = async () => {
    if (!canConvert) return
    setConverting(true)
    setResult(null)
    setLogs([])
    setProgress(0)

    addLog(`开始转换 ${files.length} 个文件`)
    addLog(`目标格式: ${selectedFormat}`)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      addLog(`[${i + 1}/${files.length}] 正在处理: ${file.split(/[/\\]/).pop()}`)

      const outDir = outputMode === 'source' ? undefined :
                     outputMode === 'subdir' ? undefined :
                     outputDir || undefined

      try {
        const res = await window.api.startConvert({
          inputPath: file,
          outputFormat: selectedFormat,
          outputDir: outDir,
        })

        if (res.success) {
          addLog(`转换成功: ${res.outputPath}`, 'success')
          setResult({ success: true, outputPath: res.outputPath })
        } else {
          addLog(`转换失败: ${res.error}`, 'error')
          setResult({ success: false, error: res.error })
          break
        }
      } catch (e: any) {
        addLog(`转换异常: ${e.message}`, 'error')
        setResult({ success: false, error: e.message })
        break
      }
    }

    if (result?.success !== false) {
      addLog('所有文件转换完成', 'success')
      // System notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Awesome-Convert', { body: '文件转换完成' })
      }
    }

    setConverting(false)
  }

  const handleCancel = () => {
    window.api.cancelConvert()
    setConverting(false)
    addLog('用户取消转换', 'error')
  }

  const handleRetry = () => {
    setResult(null)
    handleStart()
  }

  const handleOpenFolder = (path: string) => {
    window.api.showItemInFolder(path)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          <p className="text-sm text-text-muted">{description}</p>
        </div>
      </div>

      {/* Drop zone */}
      <DropZone
        files={files}
        onFilesChange={(f) => { setFiles(f); setResult(null) }}
        accept={accept}
      />

      {/* Format selector */}
      <FormatSelector
        formats={formats}
        selected={selectedFormat}
        onSelect={(f) => { setSelectedFormat(f); setResult(null) }}
        label="选择目标格式"
      />

      {/* Output directory */}
      <OutputDirSelector
        value={outputDir}
        mode={outputMode}
        onChange={setOutputDir}
        onModeChange={setOutputMode}
      />

      {/* Convert button + progress */}
      <ConvertButton
        converting={converting}
        progress={progress}
        message={message}
        canConvert={canConvert}
        result={result}
        onStart={handleStart}
        onCancel={handleCancel}
        onRetry={handleRetry}
        onOpenFolder={handleOpenFolder}
      />

      {/* Log */}
      <ConversionLog logs={logs} />
    </motion.div>
  )
}
