# WhatsApp PDF Attachment Setup

## Current Issue

Twilio WhatsApp doesn't support data URLs for media attachments. The current implementation sends text-only messages.

## Solution Options

### Option 1: Cloud Storage Integration (Recommended)

#### AWS S3 Setup

1. Create an S3 bucket for PDF storage
2. Set up IAM user with S3 permissions
3. Configure CORS for public access
4. Update `lib/pdf-upload.ts`:

```typescript
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function uploadPDFToCloud(
  pdfBase64: string,
  fileName: string
): Promise<UploadResult> {
  try {
    const buffer = Buffer.from(pdfBase64, "base64");

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `pdfs/${fileName}`,
      Body: buffer,
      ContentType: "application/pdf",
      ACL: "public-read",
    };

    const result = await s3.upload(params).promise();

    return {
      success: true,
      url: result.Location,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
```

#### Environment Variables

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### Option 2: Cloudinary Integration

#### Setup

1. Create Cloudinary account
2. Get API credentials
3. Install: `npm install cloudinary`

```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadPDFToCloud(
  pdfBase64: string,
  fileName: string
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(
      `data:application/pdf;base64,${pdfBase64}`,
      {
        resource_type: "raw",
        public_id: `pdfs/${fileName}`,
        folder: "whatsapp-pdfs",
      }
    );

    return {
      success: true,
      url: result.secure_url,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### Option 3: Temporary File Hosting

#### Using File.io or Similar Service

```typescript
export async function uploadToTempHosting(
  pdfBase64: string,
  fileName: string
): Promise<UploadResult> {
  try {
    const buffer = Buffer.from(pdfBase64, "base64");

    const formData = new FormData();
    formData.append("file", new Blob([buffer]), fileName);

    const response = await fetch("https://file.io", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        url: result.link,
      };
    } else {
      return {
        success: false,
        error: "Upload failed",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
```

## Current Behavior

### Without Cloud Storage

- ✅ WhatsApp message sent successfully
- ✅ PDF downloaded to user's device
- ❌ PDF not attached to WhatsApp message
- ✅ User informed about PDF download

### With Cloud Storage (After Implementation)

- ✅ WhatsApp message sent successfully
- ✅ PDF uploaded to cloud storage
- ✅ PDF attached to WhatsApp message
- ✅ PDF downloaded to user's device
- ✅ User gets PDF via both methods

## Testing

### Test Current Implementation

1. Register a new complaint
2. Check WhatsApp for text message
3. Verify PDF download in browser

### Test With Cloud Storage

1. Implement one of the cloud storage options
2. Set up environment variables
3. Register a new complaint
4. Check WhatsApp for message with PDF attachment
5. Verify PDF download still works

## Production Considerations

### Security

- Use signed URLs for temporary access
- Set appropriate CORS policies
- Implement file cleanup after 24-48 hours

### Performance

- Consider async upload to avoid blocking
- Implement retry logic for failed uploads
- Cache upload results

### Cost

- Monitor cloud storage costs
- Implement file cleanup policies
- Consider compression for large PDFs

## Fallback Strategy

The current implementation gracefully handles upload failures:

1. Attempts to upload PDF to cloud storage
2. If upload fails, sends text-only WhatsApp message
3. PDF is still downloaded to user's device
4. User is informed about both methods

This ensures the system works even if cloud storage is unavailable.
