import React from 'react'
import { Image } from 'lucide-react'
import ConversionPage from '../components/ConversionPage'

const formats = [
  { id: 'jpg', label: 'JPG', ext: 'jpg' },
  { id: 'png', label: 'PNG', ext: 'png' },
  { id: 'webp', label: 'WebP', ext: 'webp' },
  { id: 'bmp', label: 'BMP', ext: 'bmp' },
  { id: 'gif', label: 'GIF', ext: 'gif' },
  { id: 'tiff', label: 'TIFF', ext: 'tiff' },
  { id: 'ico', label: 'ICO', ext: 'ico' },
  { id: 'avif', label: 'AVIF', ext: 'avif' },
]

const accept = [
  { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'tiff', 'ico', 'avif', 'svg'] },
]

export default function ImagePage() {
  return (
    <ConversionPage
      title="图片文件转换"
      description="支持 JPG、PNG、WebP、BMP、GIF 等格式互相转换"
      formats={formats}
      accept={accept}
      icon={<Image size={20} className="text-primary" />}
    />
  )
}
