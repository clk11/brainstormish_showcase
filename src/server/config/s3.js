import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import dotenv from 'dotenv'

dotenv.config()

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey
    }
})

export const savePic = async (uploadParams) => {
    await s3Client.send(new PutObjectCommand({ ...uploadParams, Bucket: bucketName }));
    return;
}

export const retrievePic = async (identifier, profile) => {
    const Key = profile ? `profile_images/${identifier}` : `chatting_images/${identifier}`
    const command = new GetObjectCommand({ Bucket: bucketName, Key });
    const image = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    return image;
}