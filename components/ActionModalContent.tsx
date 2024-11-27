import { Models } from 'node-appwrite'
import React from 'react'
import Thumbnail from './Thumbnail'
import FormatedDateAndTime from './FormatedDateAndTime'
import { convertFileSize, formatDateTime } from '@/lib/utils'
import { Input } from './ui/input'
import { Button } from './ui/button'
import Image from 'next/image'

const ImageThumbnail = ({file}: {file:Models.Document}) => {
    return(
        <div className='file-details-thumbnail'>
            <Thumbnail  extension={file.extension} type={file.type} url={file.url} />
            <div className='flex flex-col'>
                <p className='subtitle-2 mb-1'>{file.name}</p>
                <FormatedDateAndTime date={file.$createdAt} className='caption' />
            </div>
        </div>
    )
}

const Detail = ({label,value}: {label:string ; value: string}) => {
    return (
        <div className='flex'>
            <p className='file-details-label text-left'>{label}</p>
            <p className='file-details-value text-left'>{value}</p>
        </div>
    )
}

export const FileDetails = ({file}: {file:Models.Document}) => {
  return (
    <>
    <ImageThumbnail file={file}/>
   <div className='space-y-4 px-2 pt-2'>
   <Detail label={"Format: "}  value={file.extension} />
    <Detail label={"Size: "}  value={convertFileSize(file.size)} />
    <Detail label={"Owner: "}  value={file.owner.fullName} />
    <Detail label={"Last edit: "}  value={formatDateTime(file.$updatedAt)} />
   </div>
    </>
  )
}

export const ShareInput = ({file,onInputChange,onRemove}: {file: Models.Document, onInputChange:React.Dispatch<React.SetStateAction<string[]>>, onRemove: (email: string) => void}) => {
    return (
        <>
        <ImageThumbnail file={file} />
        <div className='share-wrapper'>
            <p className='subtitle-2 pl-1 text-light-100'>Share file with other users</p>
            <Input type='email' placeholder='enter email address' onChange={e => onInputChange(e.target.value.trim().split(','))} className='share-input-field'/>
            <div className='pt-4'>
                <div className='flex justify-between'>
                    <p className='subtitle-2 text-light-100'>Shared with</p>
                    <p className='subtitle-2 text-light-200'>{file.users.length} users</p>
                </div>
                <ul className='pt-2 '>
                    {file.users.map((email: string) => (
                        <li className='flex items-center justify-between gap-2' key={email}>
                            <p className='subtitle-2'>{email}</p>
                            <Button onClick={() => onRemove(email)} className='share-remove-user'>
                                <Image src={"/assets/icons/remove.svg"} alt='remove' width={24} height={24} className='remove-icon' />
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        </>
    )
}
