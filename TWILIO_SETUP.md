# Twilio WhatsApp Integration Setup

This application now includes Twilio WhatsApp integration to send registration confirmations with PDF attachments.

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Twilio Configuration for WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## Twilio Setup Steps

1. **Create a Twilio Account**

   - Go to [twilio.com](https://www.twilio.com)
   - Sign up for a free account
   - Verify your phone number

2. **Get Your Credentials**

   - Go to the Twilio Console Dashboard
   - Copy your Account SID and Auth Token
   - Add them to your environment variables

3. **Set Up WhatsApp Sandbox**

   - Go to Messaging > Try it out > Send a WhatsApp message
   - Follow the instructions to set up the WhatsApp sandbox
   - Use the sandbox number provided (usually +14155238886)

4. **For Production (Optional)**
   - Apply for WhatsApp Business API access
   - Get your own WhatsApp Business number
   - Update `TWILIO_WHATSAPP_NUMBER` with your business number

## Features

- **Automatic WhatsApp Messages**: Sent after successful registration
- **PDF Attachments**: Registration details attached as PDF
- **Professional Formatting**: Clean, branded message format
- **Error Handling**: Registration continues even if WhatsApp fails
- **Phone Number Validation**: Automatic formatting for Indian numbers

## Message Format

The WhatsApp message includes:

- Registration confirmation
- Ticket number
- Status information
- Registration date
- PDF attachment with full details

## Testing

1. Set up your environment variables
2. Register a new complaint
3. Check the WhatsApp number for the message
4. Verify the PDF attachment is received

## Troubleshooting

- **"Twilio not configured"**: Check your environment variables
- **"Invalid phone number"**: Ensure phone number is in correct format
- **Message not received**: Check Twilio sandbox setup
- **PDF not attached**: Verify Twilio account has media permissions
