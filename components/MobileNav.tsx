'use client'
import React, { useState } from 'react'

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Separator } from './ui/separator'
import { navItems } from '@/constants'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import FileUpload from './FileUpload'
import { signOutUser } from '@/lib/actions/user.action'

interface Props {
  fullName: string
  email: string
  avatar: string
  $id: string
  accountId: string
}

const MobileNav = ({ fullName, email, avatar, accountId, $id: ownerId }: Props) => {

  const [open, setopen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  return (
    <header className='mobile-header sm:hidden'>
      <Image
        src={'/assets/icons/logo-full-brand.svg'}
        alt='logo'
        width={120}
        height={52}
        className='h-auto'
      />
      <Sheet open={open} onOpenChange={setopen} >
        <SheetTrigger>
          <Image src={'/assets/icons/menu.svg'} alt='menu' width={30} height={30} className='' />
        </SheetTrigger>
        <SheetContent className='shad-sheet h-screen px-3'>

          <SheetTitle>
            <div className='header-user'>
              <Image src={avatar} width={44} height={44} alt='logo' className='header-logo-avatar' />
              <div className='sm:hidden lg:block'>
                <p className='subtitle-2 capitalize'>{fullName}</p>
                <p className='caption'>{email}</p>
              </div>
            </div>
            <Separator className='mb-4 bg-light-200/20' />
          </SheetTitle>

          <nav className='mobile-nav'>
            <ul className='mobile-nav-list'>
              {
                navItems.map((item) => {
                  const active = pathname === item.url
                  return (
                    <Link key={item.name} href={item.url} className='lg:w-full'>
                      <li className={cn('mobile-nav-item', active && ('shad-active'))}>
                        <Image alt={item.name} src={item.icon} width={24} height={24} className={cn('nav-icon', active && ('nav-icon-active'))} />
                        <p>{item.name}</p>
                      </li>
                    </Link>
                  )
                })
              }
            </ul>

          </nav>

          <Separator className='my-5 bg-light-200/20' />
          <div className='flex flex-col justify-between gap-5 pb-5'>
            <FileUpload ownerId={ownerId} accountId={accountId} />
            <form action={async () => {

              await signOutUser()

            }}>
              <Button type='submit' className='mobile-sign-out-button' >
                <Image src='/assets/icons/logout.svg' alt='logo' width={24} height={24} />
                <p>Log Out</p>
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

export default MobileNav 
