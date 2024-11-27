import React from 'react'
import { Button } from './ui/button'
import Image from 'next/image'
import Search from './Search'
import FileUpload from './FileUpload'
import { signOutUser } from '@/lib/actions/user.action'

const Header = ({ userId, accountId }: { userId: string, accountId: string }) => {

  // const router = useRouter()

  return (
    <header className='header'>
      <Search />

      <div className='header-wrapper'>
        <FileUpload ownerId={userId} accountId={accountId} />

        <form action={async () => {
          'use server'
          await signOutUser()
        }}>
          <Button type='submit' className='sign-out-button' >
            <Image src='/assets/icons/logout.svg' alt='logo' width={24} height={24} className='w-6' />
          </Button>
        </form>
      </div>
    </header>
  )
}

export default Header
