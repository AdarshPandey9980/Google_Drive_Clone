'use server'

import { createAdminClient, createSessionClient } from '../appwrite'
import { InputFile } from 'node-appwrite/file'
import { appwriteConfig } from '../appwrite/config'
import { ID, Models, Query } from 'node-appwrite'
import { constructFileUrl, getFileType, parseStringify } from '../utils'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './user.action'



const createQueries = (currentUser: Models.Document, types: string[], searchText: string, sort: string, limit?: number) => {
    const queries = [
        Query.or([
            Query.equal('owner', [currentUser.$id]),
            Query.contains('users', [currentUser.email])
        ])
    ]


    if (types.length > 0) {
        queries.push(Query.equal('type', types))
    }

    if (searchText) {
        queries.push(Query.contains('name', searchText))
    }

    if (limit) {
        queries.push(Query.limit(limit))
    }

    const [sortBy, orderBy] = sort.split('-')

    queries.push(orderBy === 'asc' ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy))

    return queries
}

const handleError = (error: any, message: string) => {
    console.log(error, message)
    throw error
}

export const uploadFile = async ({ file, ownerId, accountId, path }: UploadFileProps) => {
    const { storage, database } = await createAdminClient()

    try {
        const inputFile = InputFile.fromBuffer(file, file.name)

        const bucketFile = await storage.createFile(appwriteConfig.bucketId, ID.unique(), inputFile)

        if (!bucketFile) {
            console.log('something went wrong')
        }

        const fileDocument = {
            type: getFileType(bucketFile.name).type,
            name: bucketFile.name,
            url: constructFileUrl(bucketFile.$id),
            extension: getFileType(bucketFile.name).extension,
            size: bucketFile.sizeOriginal,
            owner: ownerId,
            accountId,
            users: [],
            bucketFileId: bucketFile.$id
        }

        const newFile = await database.createDocument(appwriteConfig.databaseId, appwriteConfig.fileCollectionId, ID.unique(), fileDocument).catch(async (error: unknown) => {
            await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id)
            handleError(error, 'failed to create file document')
        })

        if (!newFile) {
            console.log('something went wrong')
        }

        revalidatePath(path)
        return parseStringify(newFile)
    } catch (error) {
        handleError(error, 'error occured in uploading the file')
    }
}

export const getFile = async ({ types = [], searchText = '', sort = '$createdAt-desc', limit }: GetFilesProps) => {
    const { database } = await createAdminClient()
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            throw new Error('User not found')
        }

        const queries = createQueries(currentUser, types, searchText, sort, limit)

        const files = await database.listDocuments(appwriteConfig.databaseId, appwriteConfig.fileCollectionId,
            queries)

        if (!files) {
            throw new Error('failed to get the files')
        }

        return parseStringify(files)
    } catch (error) {
        handleError(error, 'failed to get files')
    }
}

export const renameFile = async ({ fileId, name, extension, path }: RenameFileProps) => {
    const { database } = await createAdminClient()

    try {
        const newName = `${name}.${extension}`
        const updatedFile = await database.updateDocument(appwriteConfig.databaseId, appwriteConfig.fileCollectionId, fileId, { name: newName })
        revalidatePath(path)
        return parseStringify(updatedFile)
    } catch (error) {
        handleError(error, 'error in changing the name of the file')
    }
}


export const updateFileUser = async ({ fileId, emails, path }: UpdateFileUsersProps) => {
    const { database } = await createAdminClient()

    try {
        const updatedFile = await database.updateDocument(appwriteConfig.databaseId, appwriteConfig.fileCollectionId, fileId, { users: emails })
        revalidatePath(path)
        return parseStringify(updatedFile)
    } catch (error) {
        handleError(error, 'cannot find the uses')
    }
}

export const deleteFile = async ({ fileId, path, bucketFileId }: DeleteFileProps) => {
    const { database, storage } = await createAdminClient()

    try {
        const deletedFile = await database.deleteDocument(appwriteConfig.databaseId, appwriteConfig.fileCollectionId, fileId)

        if (deletedFile) {
            await storage.deleteFile(appwriteConfig.bucketId, bucketFileId)
        }
        return parseStringify({ status: 'success' })
    } catch (error) {
        handleError(error, 'failed to delete the file')
    }
}

export async function getTotalSpaceUsed() {
    try {
        const { database } = await createSessionClient()
        const currentUser = await getCurrentUser()
        if (!currentUser) throw new Error('User is not authenticated.')

        const files = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.fileCollectionId,
            [Query.equal('owner', [currentUser.$id])],
        )

        const totalSpace = {
            image: { size: 0, latestDate: '' },
            document: { size: 0, latestDate: '' },
            video: { size: 0, latestDate: '' },
            audio: { size: 0, latestDate: '' },
            other: { size: 0, latestDate: '' },
            used: 0,
            all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
        }

        files.documents.forEach((file) => {
            const fileType = file.type as FileType
            totalSpace[fileType].size += file.size
            totalSpace.used += file.size

            if (
                !totalSpace[fileType].latestDate ||
                new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
            ) {
                totalSpace[fileType].latestDate = file.$updatedAt
            }
        })

        return parseStringify(totalSpace)
    } catch (error) {
        handleError(error, 'Error calculating total space used:, ')
    }
}
