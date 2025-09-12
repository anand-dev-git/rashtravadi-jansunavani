import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "./config";

// Initialize S3 client
const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const BUCKET_NAME = config.aws.bucketName;
const FOLDER_PREFIX = config.aws.folderPrefix;

export interface S3UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Upload PDF to S3 bucket
 * @param pdfBuffer - PDF file as buffer
 * @param ticketNumber - Ticket number for file naming
 * @returns S3UploadResult with success status and URL
 */
export async function uploadPDFToS3(
  pdfBuffer: Buffer,
  ticketNumber: string
): Promise<S3UploadResult> {
  try {
    const fileName = `ticket_${ticketNumber}_registration.pdf`;
    const key = `${FOLDER_PREFIX}${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
      ContentDisposition: `attachment; filename="${fileName}"`,
      Metadata: {
        ticketNumber: ticketNumber,
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    // Generate a presigned URL for the uploaded file
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 3600 * 24 * 7,
    }); // 7 days

    return {
      success: true,
      url: url,
      key: key,
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown S3 error",
    };
  }
}

/**
 * Generate a presigned URL for an existing S3 object
 * @param key - S3 object key
 * @param expiresIn - URL expiration time in seconds (default: 7 days)
 * @returns Presigned URL or null if error
 */
export async function getPresignedURL(
  key: string,
  expiresIn: number = 3600 * 24 * 7
): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("S3 presigned URL error:", error);
    return null;
  }
}

/**
 * Test S3 connection and permissions
 * @returns Promise<boolean> - true if connection successful
 */
export async function testS3Connection(): Promise<boolean> {
  try {
    const testKey = `${FOLDER_PREFIX}test_connection.txt`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: "Test connection",
      ContentType: "text/plain",
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("S3 connection test failed:", error);
    return false;
  }
}
