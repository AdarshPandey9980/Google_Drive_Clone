'use client';

import React, { useCallback, useState } from 'react'
import {useDropzone} from 'react-dropzone'
import { string } from 'zod'
import { Button } from './ui/button';
import { cn, getFileType } from '@/lib/utils';
import Image from 'next/image';

interface Props {
  ownerId: string;
  accountId: string;
  className?: string;
}

const FileUpload = ({ownerId, accountId, className}: Props) => {

  const [files, setfiles] = useState<File[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
   setfiles(acceptedFiles)
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
  return (
    <div {...getRootProps()} className='cursor-pointer '>
      <input {...getInputProps()} />
      <Button className={cn('uploader-button', className)} type='button'>
        <Image src={"/assets/icons/upload.svg"} alt='upload'  width={24} height={24}/>
        <p>Upload</p>
      </Button>
      {
        files.length > 0 && (
          <ul className='uploader-preview-list'>
            <h4 className='h4 text-light-100'>Uploading</h4>
            {files.map((file, index) => {
              const {type, extension} = getFileType(file.name)
              return(
                <li key={`${file.name}-${index}`} className='uploader-preview-item'>

                </li>
              )
            })}
          </ul>
        )
      }
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some files here, or click to select files</p>
      }
    </div>
  )
}

export default FileUpload