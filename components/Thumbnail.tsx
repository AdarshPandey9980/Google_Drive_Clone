import { cn, getFileIcon } from '@/lib/utils'
import Image from 'next/image'
import React from 'react'

interface Props {
  type: string
  extension: string
  url?: string
  className?: string
}

const Thumbnail = ({ type, extension, url = '', className }: Props) => {
  const isImage = type === 'image' && extension !== 'svg'

  return (
    <figure className={cn('thumbnail', className)}>
      <Image src={isImage ? url : getFileIcon(extension, type)} alt='image' width={100} height={100} className={cn('size-8 object-contain', className, isImage && 'thumbnail-image')} />
    </figure>
  )
}

export default Thumbnail
