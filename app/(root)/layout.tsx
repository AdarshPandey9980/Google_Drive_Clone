import Header from '@/components/Header'
import MobileNav from '@/components/MobileNav'
import SideBar from '@/components/SideBar'
import { getCurrentUser } from '@/lib/actions/user.action'
import { redirect } from 'next/navigation'
import React from 'react'
import { Toaster } from "@/components/ui/toaster"

export const dynamic = 'force-dynamic'

const layout = async ({ children }: { children: React.ReactNode }) => {

  const currentUser = await getCurrentUser()

  return (
    currentUser ? (<main className='flex h-screen'>
      <SideBar {...currentUser} />
      <section className='flex h-full flex-col flex-1'>
        <MobileNav {...currentUser} />
        <Header userId={currentUser.$id} accountId={currentUser.accountId} />

        <div className='main-content'>{children}</div>
      </section>
      <Toaster />
    </main>) : (redirect('/sign-in')))
}

export default layout
