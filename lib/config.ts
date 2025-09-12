/**
 * Environment Configuration
 * Handles both local (.env.local) and production (Amplify) environments
 */

interface Config {
  // Database Configuration
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };

  // AWS S3 Configuration
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    folderPrefix: string;
  };

  // JWT Configuration
  jwt: {
    secret: string;
    expiresIn: string;
  };

  // Twilio Configuration
  twilio: {
    accountSid: string;
    authToken: string;
    whatsappNumber: string;
  };

  // WhatsTool Configuration
  whatstool: {
    apiUrl: string;
    apiKey: string;
  };

  // Application Configuration
  app: {
    nodeEnv: string;
    isProduction: boolean;
    isDevelopment: boolean;
  };
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string = ""): string {
  return process.env[key] || fallback;
}

/**
 * Get required environment variable (throws error if missing)
 */
function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Application Configuration
 */
export const config: Config = {
  database: {
    host: getEnvVar("MYSQL_HOST", "localhost"),
    port: parseInt(getEnvVar("MYSQL_PORT", "3306")),
    user: getEnvVar("MYSQL_USER", "root"),
    password: getEnvVar("MYSQL_PASSWORD", ""),
    name: getEnvVar("MYSQL_DATABASE", "rashtrawadi_jansunavani"),
  },

  aws: {
    region: getEnvVar("AWS_REGION", "ap-south-1"),
    accessKeyId: getEnvVar("AWS_ACCESS_KEY_ID", ""),
    secretAccessKey: getEnvVar("AWS_SECRET_ACCESS_KEY", ""),
    bucketName: getEnvVar("AWS_S3_BUCKET", "jd-complaint-tickets"),
    folderPrefix: getEnvVar("AWS_S3_FOLDER", "CRM_Tickets/"),
  },

  jwt: {
    secret: getEnvVar("JWT_SECRET", "your-secret-key-change-in-production"),
    expiresIn: getEnvVar("JWT_EXPIRES_IN", "24h"),
  },

  twilio: {
    accountSid: getEnvVar("TWILIO_ACCOUNT_SID", ""),
    authToken: getEnvVar("TWILIO_AUTH_TOKEN", ""),
    whatsappNumber: getEnvVar(
      "TWILIO_WHATSAPP_NUMBER",
      "whatsapp:+14155238886"
    ),
  },

  whatstool: {
    apiUrl: getEnvVar(
      "WHATS_TOOL_API_URL",
      "https://api.whatstool.business/developers/v2/messages/917888566904"
    ),
    apiKey: getEnvVar("WHATS_TOOL_API_KEY", ""),
  },

  app: {
    nodeEnv: getEnvVar("NODE_ENV", "development"),
    isProduction: getEnvVar("NODE_ENV", "development") === "production",
    isDevelopment: getEnvVar("NODE_ENV", "development") === "development",
  },
};

/**
 * Validate required configuration for production
 */
export function validateConfig(): void {
  if (config.app.isProduction) {
    const requiredVars = [
      "MYSQL_HOST",
      "MYSQL_USER",
      "MYSQL_PASSWORD",
      "MYSQL_DATABASE",
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
      "JWT_SECRET",
    ];

    const missing = requiredVars.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }

    // Validate JWT secret strength in production
    if (config.jwt.secret === "your-secret-key-change-in-production") {
      throw new Error(
        "JWT_SECRET must be changed from default value in production"
      );
    }
  }
}

/**
 * Get database connection string for logging (without password)
 */
export function getDatabaseInfo(): string {
  return `${config.database.user}@${config.database.host}:${config.database.port}/${config.database.name}`;
}

/**
 * Get AWS S3 info for logging (without credentials)
 */
export function getS3Info(): string {
  return `${config.aws.bucketName}/${config.aws.folderPrefix} (${config.aws.region})`;
}

export default config;
