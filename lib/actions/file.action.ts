"use server";

import { createAdminClient } from "../appwrite";
import {InputFile} from "node-appwrite/file"
import { appwriteConfig } from "../appwrite/config";
import { ID } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";

const handleError = (error: any, message: string) => {
    console.log(error, message);
    throw error;
  };

export const uploadFile =async ({file,ownerId,accountId,path}:UploadFileProps) => {
    const {storage, database} = await createAdminClient()

    try {
        const inputFile = InputFile.fromBuffer(file,file.name)

        const bucketFile = await storage.createFile(appwriteConfig.bucketId,ID.unique(),inputFile)

        if (!bucketFile) {
            console.log("something went wrong");
        }

        const fileDocument = {
            type: getFileType(bucketFile.name).type,
            name: bucketFile.name,
            url: constructFileUrl(bucketFile.$id),
            extension: getFileType(bucketFile.name).extension,
            size: bucketFile.sizeOriginal,
            owner:ownerId,
            accountId,
            users: [],
            bucketFileId:bucketFile.$id
        }

        const newFile = await database.createDocument(appwriteConfig.databaseId,appwriteConfig.fileCollectionId,ID.unique(),fileDocument).catch(async (error:unknown) => {
            await storage.deleteFile(appwriteConfig.bucketId,bucketFile.$id)
            handleError(error,"failed to create file document")
        })

        if (!newFile) {
            console.log("something went wrong"); 
        }
        
        revalidatePath(path)
        return parseStringify(newFile)
    } catch (error) {
        handleError(error,"error occured in uploading the file")
    }
}