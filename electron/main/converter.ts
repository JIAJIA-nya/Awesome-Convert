import { join, extname, basename } from 'path'
import { existsSync, mkdirSync } from 'fs'
import sharp from 'sharp'
import archiver from 'archiver'
import { createWriteStream, createReadStream } from 'fs'
import extract from 'extract-zip'

export interface ConvertParams {
  inputPath: string
  outputFormat: string
  outputDir?: string
  options?: Record<string, any>
  onProgress?: (progress: number, message: string) => void
}

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'tiff', 'ico', 'avif']
const ARCHIVE_EXTS = ['zip', 'rar', '7z', 'tar', 'tar.gz', 'tar.bz2', 'gz']
const VIDEO_EXTS = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm']
const AUDIO_EXTS = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a']

function getExt(filePath: string): string {
  const name = basename(filePath)
  if (name.endsWith('.tar.gz')) return 'tar.gz'
  if (name.endsWith('.tar.bz2')) return 'tar.bz2'
  return extname(filePath).slice(1).toLowerCase()
}

function getCategory(ext: string): string {
  if (IMAGE_EXTS.includes(ext)) return 'image'
  if (ARCHIVE_EXTS.includes(ext)) return 'archive'
  if (VIDEO_EXTS.includes(ext)) return 'video'
  if (AUDIO_EXTS.includes(ext)) return 'audio'
  return 'document'
}

function getOutputPath(inputPath: string, outputFormat: string, outputDir?: string): string {
  const dir = outputDir || join(inputPath, '..')
  const name = basename(inputPath, extname(inputPath))
  const ext = outputFormat.startsWith('.') ? outputFormat : `.${outputFormat}`
  let outPath = join(dir, `${name}${ext}`)
  let i = 1
  while (existsSync(outPath)) {
    outPath = join(dir, `${name} (${i})${ext}`)
    i++
  }
  return outPath
}

async function convertImage(inputPath: string, outputFormat: string, outputPath: string, onProgress?: (p: number, m: string) => void) {
  onProgress?.(10, '正在读取图片...')
  let pipeline = sharp(inputPath)

  onProgress?.(30, '正在转换格式...')
  const fmt = outputFormat.toLowerCase()
  switch (fmt) {
    case 'jpg':
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality: 90 })
      break
    case 'png':
      pipeline = pipeline.png()
      break
    case 'webp':
      pipeline = pipeline.webp({ quality: 90 })
      break
    case 'bmp':
      pipeline = pipeline.png()
      break
    case 'gif':
      pipeline = pipeline.gif()
      break
    case 'tiff':
      pipeline = pipeline.tiff()
      break
    case 'avif':
      pipeline = pipeline.avif({ quality: 80 })
      break
    case 'ico':
      pipeline = pipeline.resize(256, 256).png()
      break
    default:
      throw new Error(`不支持的图片格式: ${outputFormat}`)
  }

  onProgress?.(70, '正在保存文件...')
  await pipeline.toFile(outputPath)
  onProgress?.(100, '转换完成')
}

async function convertArchive(inputPath: string, outputFormat: string, outputPath: string, onProgress?: (p: number, m: string) => void) {
  const srcExt = getExt(inputPath)
  onProgress?.(10, '正在准备压缩转换...')

  // For archive to archive, we need to extract first then re-compress
  // Extract to temp dir
  const os = require('os')
  const { mkdtempSync, rmSync } = require('fs')
  const tempDir = mkdtempSync(join(os.tmpdir(), 'ac-'))

  try {
    onProgress?.(20, '正在解压源文件...')
    if (srcExt === 'zip' || srcExt === 'tar.gz' || srcExt === 'tar.bz2') {
      await extract(inputPath, { dir: tempDir })
    } else {
      // For other formats, try using 7z-like extraction
      throw new Error(`暂不支持 .${srcExt} 格式的解压，请先手动解压后重新打包`)
    }

    onProgress?.(50, '正在打包为目标格式...')
    const fmt = outputFormat.toLowerCase()

    if (fmt === 'zip' || fmt === 'tar' || fmt === 'tar.gz' || fmt === 'tar.bz2') {
      await new Promise<void>((resolve, reject) => {
        const output = createWriteStream(outputPath)
        let archiveFormat: string = 'zip'
        let archiveOptions: any = {}

        if (fmt === 'tar') archiveFormat = 'tar'
        else if (fmt === 'tar.gz') { archiveFormat = 'tar'; archiveOptions = { gzip: true, gzipOptions: { level: 9 } } }
        else if (fmt === 'tar.bz2') { archiveFormat = 'tar'; archiveOptions = { gzip: true } }

        const archive = archiver(archiveFormat as any, archiveOptions)
        output.on('close', () => resolve())
        archive.on('error', reject)
        archive.pipe(output)
        archive.directory(tempDir, false)
        archive.finalize()
      })
    } else {
      throw new Error(`暂不支持打包为 .${fmt} 格式`)
    }

    onProgress?.(100, '转换完成')
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

async function convertVideoAudio(
  inputPath: string,
  outputFormat: string,
  outputPath: string,
  options: Record<string, any> = {},
  onProgress?: (p: number, m: string) => void
) {
  // Check if ffmpeg is available
  let ffmpegPath: string
  try {
    ffmpegPath = require('ffmpeg-static')
  } catch {
    throw new Error('FFmpeg 引擎不可用，请确认已正确安装')
  }

  const ffmpeg = require('fluent-ffmpeg')
  ffmpeg.setFfmpegPath(ffmpegPath)

  onProgress?.(5, '正在初始化转换引擎...')

  return new Promise<string>((resolve, reject) => {
    let command = ffmpeg(inputPath)

    // Apply options
    if (options.bitrate) command = command.audioBitrate(options.bitrate)
    if (options.videoBitrate) command = command.videoBitrate(options.videoBitrate)
    if (options.resolution) command = command.size(options.resolution)
    if (options.codec) command = command.videoCodec(options.codec)
    if (options.audioCodec) command = command.audioCodec(options.audioCodec)
    if (options.fps) command = command.fps(options.fps)

    command
      .toFormat(outputFormat)
      .on('progress', (progress: any) => {
        const pct = Math.min(95, Math.round(progress.percent || 0))
        onProgress?.(pct, `正在转换... ${pct}%`)
      })
      .on('end', () => {
        onProgress?.(100, '转换完成')
        resolve(outputPath)
      })
      .on('error', (err: Error) => {
        reject(new Error(`转换失败: ${err.message}`))
      })
      .save(outputPath)
  })
}

async function convertDocument(inputPath: string, outputFormat: string, outputPath: string, onProgress?: (p: number, m: string) => void) {
  const srcExt = getExt(inputPath)
  const fmt = outputFormat.toLowerCase()

  onProgress?.(10, '正在读取文档...')

  if (srcExt === 'txt' && (fmt === 'html' || fmt === 'md')) {
    const { readFileSync, writeFileSync } = require('fs')
    const content = readFileSync(inputPath, 'utf-8')
    onProgress?.(50, '正在转换...')
    if (fmt === 'html') {
      writeFileSync(outputPath, `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title></head><body><pre>${content}</pre></body></html>`)
    } else {
      writeFileSync(outputPath, content)
    }
    onProgress?.(100, '转换完成')
    return outputPath
  }

  if (srcExt === 'docx' && fmt === 'txt') {
    const mammoth = require('mammoth')
    onProgress?.(30, '正在解析 Word 文档...')
    const result = await mammoth.extractRawText({ path: inputPath })
    const { writeFileSync } = require('fs')
    writeFileSync(outputPath, result.value)
    onProgress?.(100, '转换完成')
    return outputPath
  }

  if (srcExt === 'csv' && fmt === 'json') {
    const { readFileSync, writeFileSync } = require('fs')
    const { parse } = require('csv-parse/sync')
    onProgress?.(30, '正在解析 CSV...')
    const content = readFileSync(inputPath, 'utf-8')
    const records = parse(content, { columns: true })
    writeFileSync(outputPath, JSON.stringify(records, null, 2))
    onProgress?.(100, '转换完成')
    return outputPath
  }

  if (srcExt === 'csv' && fmt === 'xlsx') {
    const XLSX = require('xlsx')
    onProgress?.(30, '正在转换...')
    const wb = XLSX.readFile(inputPath)
    XLSX.writeFile(wb, outputPath)
    onProgress?.(100, '转换完成')
    return outputPath
  }

  if (srcExt === 'xlsx' && fmt === 'csv') {
    const XLSX = require('xlsx')
    onProgress?.(30, '正在转换...')
    const wb = XLSX.readFile(inputPath)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const csv = XLSX.utils.sheet_to_csv(ws)
    const { writeFileSync } = require('fs')
    writeFileSync(outputPath, csv)
    onProgress?.(100, '转换完成')
    return outputPath
  }

  if (srcExt === 'xlsx' && fmt === 'json') {
    const XLSX = require('xlsx')
    onProgress?.(30, '正在转换...')
    const wb = XLSX.readFile(inputPath)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(ws)
    const { writeFileSync } = require('fs')
    writeFileSync(outputPath, JSON.stringify(data, null, 2))
    onProgress?.(100, '转换完成')
    return outputPath
  }

  if (srcExt === 'md' && fmt === 'html') {
    const { readFileSync, writeFileSync } = require('fs')
    const { marked } = require('marked')
    onProgress?.(30, '正在渲染 Markdown...')
    const content = readFileSync(inputPath, 'utf-8')
    const html = marked(content)
    writeFileSync(outputPath, `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title><style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:20px}</style></head><body>${html}</body></html>`)
    onProgress?.(100, '转换完成')
    return outputPath
  }

  if (srcExt === 'html' && fmt === 'txt') {
    const { readFileSync, writeFileSync } = require('fs')
    onProgress?.(30, '正在提取文本...')
    const content = readFileSync(inputPath, 'utf-8')
    const text = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
    writeFileSync(outputPath, text)
    onProgress?.(100, '转换完成')
    return outputPath
  }

  if (srcExt === 'html' && fmt === 'md') {
    const { readFileSync, writeFileSync } = require('fs')
    onProgress?.(30, '正在转换...')
    const content = readFileSync(inputPath, 'utf-8')
    // Simple HTML to markdown
    let md = content
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    writeFileSync(outputPath, md)
    onProgress?.(100, '转换完成')
    return outputPath
  }

  throw new Error(`暂不支持从 .${srcExt} 转换为 .${fmt}`)
}

export async function convertFile(params: ConvertParams): Promise<string> {
  const { inputPath, outputFormat, outputDir, options, onProgress } = params
  const srcExt = getExt(inputPath)
  const category = getCategory(srcExt)
  const outputPath = getOutputPath(inputPath, outputFormat, outputDir)

  // Ensure output directory exists
  const outDir = join(outputPath, '..')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  switch (category) {
    case 'image':
      await convertImage(inputPath, outputFormat, outputPath, onProgress)
      break
    case 'archive':
      await convertArchive(inputPath, outputFormat, outputPath, onProgress)
      break
    case 'video':
    case 'audio':
      await convertVideoAudio(inputPath, outputFormat, outputPath, options || {}, onProgress)
      break
    default:
      await convertDocument(inputPath, outputFormat, outputPath, onProgress)
      break
  }

  return outputPath
}
