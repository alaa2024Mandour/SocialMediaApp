import { file } from 'zod';
import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as configService from '../../config/config.service';
import { StorageEnum } from '../enum/multer.enum';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { AppError } from '../utils/global.error.handeller';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { throws } from 'node:assert';

export class S3Service {
    private client: S3Client

    constructor() {
        this.client = new S3Client({
            region: configService.AWS_REGION!,
            credentials: {
                accessKeyId: configService.AWS_ACCESS_KEY_ID!,
                secretAccessKey: configService.AWS_SECRET_ACCESS_KEY!
            }
        })
    }


    async uploadFile({
        file,
        store_type = StorageEnum.memory,
        path = "General",
        ACL = ObjectCannedACL.private
    }:
        {
            file: Express.Multer.File,
            store_type?: StorageEnum,
            path?: string,
            ACL?: ObjectCannedACL
        }): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: configService.AWS_S3_BUCKET_NAME!,
            Key: `social_media_app/${path}/${randomUUID()}__${file.originalname}`,
            Body: store_type === StorageEnum.memory ? file.buffer : fs.createReadStream(file.path),
            ContentType: file.mimetype,
            ACL,
        })

        if (!command.input.Key) {
            throw new AppError("fail to upload file")
        }

        await this.client.send(command)
        return command.input.Key
    }

    async uploadLargeFile({
        file,
        store_type = StorageEnum.disk,
        path = "General",
        ACL = ObjectCannedACL.private
    }:
        {
            file: Express.Multer.File,
            store_type?: StorageEnum,
            path?: string,
            ACL?: ObjectCannedACL
        }): Promise<string> {
        const command = new Upload({
            client: this.client,
            params: {
                Bucket: configService.AWS_S3_BUCKET_NAME!,
                Key: `social_media_app/${path}/${randomUUID()}__${file.originalname}`,
                Body: store_type === StorageEnum.memory ? file.buffer : fs.createReadStream(file.path),
                ContentType: file.mimetype,
                ACL,
            }
        })
        command.on("httpUploadProgress", (progress) => {
            console.log(progress);
        });
        const result = await command.done()
        return result.Key!
    }

    async uploadFiles({
        files,
        store_type = StorageEnum.disk,
        path = "General",
        ACL = ObjectCannedACL.private,
        isLarge = false
    }:
        {
            files: Express.Multer.File[],
            store_type?: StorageEnum,
            path?: string,
            ACL?: ObjectCannedACL,
            isLarge?: boolean
        }) {

        let urls: string[] = []
        if (isLarge) {
            urls = await Promise.all(
                files.map(
                    (file) => {
                        return this.uploadLargeFile({ file, store_type, path, ACL })
                    }
                )
            )
        }
        else {
            urls = await Promise.all(
                files.map(
                    (file) => {
                        return this.uploadFile({ file, store_type, path, ACL })
                    }
                )
            )
        }
        return urls;
    }

    async createPreSignedUrl({
        fileName,
        contentType,
        path ,
        expiresIn=60,
    }:
        {
            fileName: string,
            contentType: string,
            path?: string,
            expiresIn?: number
        }) {

            const Key = `social_media_app/${path}/${randomUUID()}__${fileName}`;
        const command = new PutObjectCommand({
            Bucket: configService.AWS_S3_BUCKET_NAME!,
            Key,
            ContentType: contentType,
        })

        const url = await getSignedUrl(this.client, command, { expiresIn })
        return { url, key: Key };
    }

    async getFile({ key }: { key: string }) {
        const command = new GetObjectCommand({
            Bucket: configService.AWS_S3_BUCKET_NAME!,
            Key: key
        });
        return await this.client.send(command);
    }

    async getPreAssignedUrl({ 
        key, 
        expiresIn = 60 ,
        download
    }: 
    { 
        key: string, 
        expiresIn?: number
        download?: string|undefined 
    }) {
        const command = new GetObjectCommand({
            Bucket: configService.AWS_S3_BUCKET_NAME!,
            Key: key,
            ResponseContentDisposition: download ? `attachment; filename="${key.split("/").pop()}"` : undefined
        });
        const url = await getSignedUrl(this.client, command, { expiresIn })
        return url;
    }

    async getFiles(folderName:string){
        const command =new ListObjectsV2Command({
            Bucket: configService.AWS_S3_BUCKET_NAME,
            Prefix:`social_media_app/${folderName}`
        })

        return await this.client.send(command)
    }

    async checkFileExists(Key: string) {
    try {
        const command = new HeadObjectCommand({
            Bucket: configService.AWS_S3_BUCKET_NAME,
            Key,
        });
        await this.client.send(command);
        return true;
    } catch (error: any) {
        if (error.name === "NotFound") {
            return false;
        }
        throw error;
    }
    }

    async deleteFile(Key:string){
        /**
         * Note: S3 DeleteObject is idempotent, meaning it returns a success response (204) 
         * even if the file does not exist. We use HeadObject here to manually verify 
         * existence so we can return a 404 error to the client if the file is missing.
         */
        const isExist = await this.checkFileExists(Key)
        console.log(isExist);
        
        if(!isExist) throw new AppError("file not exist or already deleted");
        
        const command =new DeleteObjectCommand({
            Bucket: configService.AWS_S3_BUCKET_NAME,
            Key,
        })

        return await this.client.send(command)
    }

    async deleteFiles(Keys:string[]) {
        const keyMapped = Keys.map((key) => ({ Key: key }))

        const command = new DeleteObjectsCommand({
            Bucket: configService.AWS_S3_BUCKET_NAME,
            Delete: {
                Objects: keyMapped
            }
        })

        return await this.client.send(command)
    }

    async deleteFolder(folderName:string){
        const folderData = await this.getFiles(folderName);
        const data = folderData.Contents?.map((key)=>{
            return key.Key
        }) 

        return await this.deleteFiles(data as string[])
    }
}