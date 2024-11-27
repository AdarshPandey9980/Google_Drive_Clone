"use client";

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getFile } from '@/lib/actions/file.action';
import { Models } from 'node-appwrite';
import Thumbnail from './Thumbnail';
import FormatedDateAndTime from './FormatedDateAndTime';
import {useDebounce} from 'use-debounce'

const Search = () => {

  const [query, setquery] = useState("")
  const [results, setresults] = useState<Models.Document[]>([])
  const [open, setOpen] = useState(false)
  const searchParam = useSearchParams()
  const searchQuery = searchParam.get("query") || ""
  const router = useRouter()
  const path = usePathname()
  const [debouncedQuery] = useDebounce(query,300)

  useEffect(() => {
    if(!searchQuery) {
      setquery("")
    }
  },[searchQuery])

  const handleClick = (file: Models.Document) => {
    setOpen(false)
    setresults([])
    router.push(`/${(file.type === 'video' || file.type === "audio") ? "media" : file.type + "s"}?query=${query}`)
  }

  useEffect(() => {
   try {
    const fetchFile = async () => {
      if(debouncedQuery.length === 0) {
        setresults([])
        setOpen(false)
        return router.push(path.replace(searchParam.toString(),""))
      }
      const files = await getFile({types: [],searchText: query})
      setresults(files.documents)
      setOpen(true)
    }
    fetchFile()
   } catch (error) {
    console.log(error);
   } finally {
    setOpen(false)
   }
  }, [debouncedQuery])



  return (
    <div className='search'>
      <div className='search-input-wrapper'>
        <Image src={"/assets/icons/search.svg"} alt='search' width={24} height={24}  /> 
        <Input value={query} placeholder='Search...' className='search-input' onChange={e => setquery(e.target.value)}/>
        {
          open && <ul className='search-result'>
            {
              results.length > 0 ?  results.map((file) => (<li className='flex items-center justify-between' key={file.$id} onClick={() => handleClick(file)} >
                <div className='flex cursor-pointer items-center gap-4'>
                  <Thumbnail type={file.type} extension={file.extension}  url={file.url} className='size-9 min-w-9' />
                  <p className='subtitle-2 line-clamp-1 text-light-100'>{file.name}</p>
                </div>
                <FormatedDateAndTime date={file.$createdAt} className='caption line-clamp-1 text-light-200' />
              </li>)) : <p className='empty-result'>No files found</p>
            }
          </ul>
        }
      </div>
    </div>
  )
}

export default Search