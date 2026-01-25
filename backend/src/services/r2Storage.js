const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Initialize R2 Client
const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET;

/**
 * Uploads a file buffer to R2
 * @param {string} key - The unique file path/name
 * @param {Buffer} buffer - File content
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} - The public URL (or presigned URL logic if private)
 */
async function uploadFile(key, buffer, contentType) {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });

    try {
        await r2Client.send(command);
        // Return a public URL if bucket is public, or handle presigned URLs if private.
        // For now assuming we might want a simple reference logic.
        // If you have a custom domain for R2, use that. Otherwise use the endpoint structure.
        return `${process.env.R2_ENDPOINT}/${BUCKET_NAME}/${key}`;
    } catch (error) {
        console.error("R2 Upload Error:", error);
        throw new Error("Failed to upload file to storage.");
    }
}

/**
 * Generates a presigned URL for uploading (Client-side upload strategy)
 * @param {string} key 
 * @param {string} contentType 
 * @returns {Promise<string>}
 */
async function getUploadUrl(key, contentType) {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });
    return getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

module.exports = {
    r2Client,
    uploadFile,
    getUploadUrl
};
