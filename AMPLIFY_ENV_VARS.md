# AWS Amplify Environment Variables Template

This document provides the complete environment variables template for deploying to AWS Amplify.

## 🔧 **Required Environment Variables for Amplify**

Copy these variables to your Amplify console under **App settings** → **Environment variables**:

### **Database Configuration**

```
MYSQL_HOST=your_production_db_host
MYSQL_PORT=3306
MYSQL_USER=your_production_db_user
MYSQL_PASSWORD=your_production_db_password
MYSQL_DATABASE=your_production_db_name
```

### **AWS S3 Configuration**

```
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET=jd-complaint-tickets
AWS_S3_FOLDER=CRM_Tickets/
```

### **JWT Authentication**

```
JWT_SECRET=your_strong_jwt_secret_for_production
JWT_EXPIRES_IN=24h
```

### **Twilio WhatsApp (Optional)**

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### **WhatsTool WhatsApp (Optional)**

```
WHATS_TOOL_API_URL=https://api.whatstool.business/developers/v2/messages/917888566904
WHATS_TOOL_API_KEY=your_whats_tool_api_key
```

### **Application Environment**

```
NODE_ENV=production
```

## 📋 **Step-by-Step Setup in Amplify**

1. **Go to AWS Amplify Console**

   - Navigate to your app
   - Click **App settings** → **Environment variables**

2. **Add Each Variable**

   - Click **Manage variables**
   - Add each variable from the list above
   - Set appropriate values for your production environment

3. **Environment-Specific Variables**

   - You can set different values for different environments (dev, staging, prod)
   - Use the **Environment** dropdown when adding variables

4. **Deploy**
   - After adding all variables, trigger a new deployment
   - The app will automatically use the production environment variables

## 🔒 **Security Best Practices**

### **For Production:**

- ✅ Use strong, unique JWT secrets
- ✅ Use production database credentials
- ✅ Consider using IAM roles instead of access keys
- ✅ Rotate AWS credentials regularly
- ✅ Use different credentials for different environments

### **Database Recommendations:**

- Use AWS RDS for production database
- Enable encryption at rest
- Use VPC security groups
- Regular backups

## 🧪 **Testing Your Configuration**

After deployment, test these endpoints:

1. **S3 Connection Test:**

   ```
   GET https://your-app-id.amplifyapp.com/api/upload-pdf
   ```

2. **Ticket Number Generation:**

   ```
   GET https://your-app-id.amplifyapp.com/api/ticket-number
   ```

3. **Database Connection:**
   - Check Amplify build logs for database connection success
   - Look for any connection errors in the logs

## 📊 **Environment Variables by Priority**

### **Critical (Must Have):**

- `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `JWT_SECRET`

### **Important (Should Have):**

- `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_S3_FOLDER`
- `NODE_ENV`

### **Optional (Nice to Have):**

- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`
- `WHATS_TOOL_API_URL`, `WHATS_TOOL_API_KEY`
- `JWT_EXPIRES_IN`

## 🚨 **Common Issues & Solutions**

### **Issue: "Required environment variable not set"**

- **Solution:** Check that all critical variables are added to Amplify
- **Check:** Variable names match exactly (case-sensitive)

### **Issue: "S3 connection failed"**

- **Solution:** Verify AWS credentials and bucket permissions
- **Check:** Bucket exists and is accessible from your region

### **Issue: "Database connection failed"**

- **Solution:** Verify database credentials and network access
- **Check:** Database is accessible from Amplify's IP ranges

### **Issue: "JWT verification failed"**

- **Solution:** Ensure JWT_SECRET is set and consistent
- **Check:** No special characters that need escaping

## 📝 **Local Development (.env.local)**

For local development, create a `.env.local` file with the same variables but with your local values:

```bash
# Local Development Environment
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_local_password
MYSQL_DATABASE=rashtrawadi_jansunavani

AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET=jd-complaint-tickets
AWS_S3_FOLDER=CRM_Tickets/

JWT_SECRET=your_local_jwt_secret
JWT_EXPIRES_IN=24h
NODE_ENV=development

# Optional services
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

WHATS_TOOL_API_URL=https://api.whatstool.business/developers/v2/messages/917888566904
WHATS_TOOL_API_KEY=your_whats_tool_key
```

This configuration system automatically handles both local and production environments!