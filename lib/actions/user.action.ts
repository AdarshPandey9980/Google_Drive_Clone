'use server'

import { ID, Query } from 'node-appwrite'
import { createAdminClient, createSessionClient } from '../appwrite'
import { appwriteConfig } from '../appwrite/config'
import { parseStringify } from '../utils'
import { cookies } from 'next/headers'
import { avatarPlaceHolder } from '@/constants'
import { redirect } from 'next/navigation'

const getUserByEmail = async (email: string) => {
  const { database } = await createAdminClient()

  const result = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    [Query.equal('email', [email])]
  )

  return result.total > 0 ? result.documents[0] : null
}

const handleError = (error: any, message: string) => {
  console.log(error, message)
  throw error
}

export const sendEmailOtp = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient()

  try {
    const session = await account.createEmailToken(ID.unique(), email)
    return session.userId
  } catch (error) {
    handleError(error, 'failed to send email otp')
  }
}

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string
  email: string
}) => {
  const existingUser = await getUserByEmail(email)

  const accountId = await sendEmailOtp({ email })

  if (!accountId) {
    throw new Error('failed to send an otp')
  }

  if (!existingUser) {
    const { database } = await createAdminClient()

    await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: avatarPlaceHolder,
        accountId,
      }
    )
  }

  return parseStringify({ accountId })
}

export const verifyOtp = async ({
  accountId,
  password,
}: {
  accountId: string
  password: string
}) => {
  try {
    const { account } = await createAdminClient()
    const session = await account.createSession(accountId, password);
    (await cookies()).set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    })

    return parseStringify({ sessionId: session.$id })
  } catch (error) {
    handleError(error, 'failed to verify otp')
  }
}

export const getCurrentUser = async () => {
  try {
    const { account, database } = await createSessionClient()

    const result = await account.get()

    if (!result) {
      redirect('/sign-in')
    }

    const user = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', [result.$id])]
    )

    if (user.total <= 0) {
      return null
    }

    return parseStringify(user.documents[0])
  } catch (error) {
    console.log(error)
    redirect('/sign-in')

  }
}

export const signOutUser = async () => {
  try {
    const { account } = await createSessionClient()

    const res = await account.deleteSession('current');

    (await cookies()).delete('appwrite-session')

    console.log(res)


  } catch (error) {
    handleError(error, 'failed to sign out user')
  } finally {
    redirect('/sign-in')
  }
}

export const signOut = async () => {
  await signOutUser()
}


export const signInUser = async ({ email }: { email: string }) => {

  try {
    const existingUser = await getUserByEmail(email)

    if (!existingUser) {
      //return parseStringify({accountId: null,error: 'user not found please create account'} )
      redirect('/sign-up')
    }

    if (existingUser) {
      await sendEmailOtp({ email })
      return parseStringify({ accountId: existingUser.accountId })
    }
  } catch (error) {
    console.log(error)

  }

}

export const userss = async () => {
  const currentUser = await getCurrentUser()
  return currentUser.email
}