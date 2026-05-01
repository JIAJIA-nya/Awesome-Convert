import React from 'react'
import { Archive } from 'lucide-react'
import ConversionPage from '../components/ConversionPage'

const formats = [
  { id: 'zip', label: 'ZIP', ext: 'zip' },
  { id: 'rar', label: 'RAR', ext: 'rar' },
  { id: '7z', label: '7Z', ext: '7z' },
  { id: 'tar', label: 'TAR', ext: 'tar' },
  { id: 'tar.gz', label: 'TAR.GZ', ext: 'tar.gz' },
  { id: 'tar.bz2', label: 'TAR.BZ2', ext: 'tar.bz2' },
]

const accept = [
  { name: '压缩文件', extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'tar.gz', 'tar.bz2'] },
]

export default function ArchivePage() {
  return (
    <ConversionPage
      title="压缩文件转换"
      description="支持 ZIP、RAR、7Z、TAR 等格式互相转换"
      formats={formats}
      accept={accept}
      icon={<Archive size={20} className="text-primary" />}
    />
  )
}
