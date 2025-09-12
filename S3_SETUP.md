# S3 PDF Storage Setup

This document explains how to set up Amazon S3 for PDF storage in the Rashtrawadi Jansunavani system.

## S3 Bucket Configuration

- **Bucket Name**: `jd-complaint-tickets`
- **Folder**: `CRM_Tickets/`
- **ARN**: `arn:aws:s3:::jd-complaint-tickets/CRM_Tickets/`

## Required Environment Variables

Create a `.env.local` file in your project root and add the following environment variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rashtrawadi_jansunavani

# AWS S3 Configuration for PDF Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# S3 Bucket Details
# Bucket: jd-complaint-tickets
# Folder: CRM_Tickets/
# ARN: arn:aws:s3:::jd-complaint-tickets/CRM_Tickets/

# JWT Secret for Authentication
JWT_SECRET=your_jwt_secret_key

# Twilio Configuration (if using Twilio for WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# WhatsTool Configuration (if using WhatsTool for WhatsApp)
WHATS_TOOL_API_KEY=your_whats_tool_api_key
```

**Note**: Replace all `your_*` placeholders with your actual values.

## AWS IAM Permissions

The AWS credentials need the following permissions for the S3 bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::jd-complaint-tickets/CRM_Tickets/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::jd-complaint-tickets"
    }
  ]
}
```

## How It Works

1. **Registration Flow**:

   - User fills out the registration form
   - System generates a ticket number
   - PDF is generated with ticket details
   - PDF is uploaded to S3 bucket under `CRM_Tickets/` folder
   - S3 URL is stored in the `pdf_link` field of the complaint record
   - Registration continues with local PDF download and WhatsApp notification

2. **File Naming Convention**:

   - Format: `ticket_{ticketNumber}_registration.pdf`
   - Example: `ticket_JDW000001AP_registration.pdf`

3. **URL Generation**:
   - Presigned URLs are generated with 7-day expiration
   - URLs provide direct access to the PDF files

## Testing S3 Connection

You can test the S3 connection by making a GET request to:

```
GET /api/upload-pdf
```

This will return:

- `200` with success message if S3 is accessible
- `500` with error message if S3 connection fails

## Error Handling

The system is designed to be resilient:

- If S3 upload fails, registration still continues
- User gets a warning toast but the process completes
- PDF is still generated locally for download
- Only the `pdf_link` field will be empty in the database

## File Structure

```
lib/
├── s3.ts                 # S3 service functions
app/api/upload-pdf/
└── route.ts             # PDF upload API endpoint
```

## Dependencies

The following packages are required:

- `@aws-sdk/client-s3`
- `@aws-sdk/s3-request-presigner`

These are automatically installed when you run `npm install`.
