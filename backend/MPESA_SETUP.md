# M-Pesa STK Push Setup Guide

## Overview
This guide will help you set up M-Pesa STK Push integration for the KASNEB Study Materials App.

## Prerequisites
1. M-Pesa Developer Account (https://developer.safaricom.co.ke/)
2. Valid M-Pesa API credentials
3. ngrok or similar tunneling service for callbacks

## Setup Steps

### 1. Create Environment File
Create a `.env` file in the `backend` directory with the following content:

```env
# M-Pesa Configuration (Sandbox)
MPESA_CONSUMER_KEY=your_actual_consumer_key_here
MPESA_CONSUMER_SECRET=your_actual_consumer_secret_here
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/api/mpesa/callback
MPESA_TIMEOUT_URL=https://your-ngrok-url.ngrok-free.app/api/mpesa/timeout

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 2. Get M-Pesa Credentials

#### For Sandbox Testing:
1. Go to https://developer.safaricom.co.ke/
2. Create an account and log in
3. Go to "My Apps" and create a new app
4. Copy the Consumer Key and Consumer Secret
5. Use the default sandbox credentials:
   - Business Short Code: `174379`
   - Passkey: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`

#### For Production:
1. Complete the M-Pesa API onboarding process
2. Get your production credentials from Safaricom
3. Update the environment variables accordingly
4. Change `MPESA_ENVIRONMENT=production`

### 3. Set Up Callback URLs

#### Using ngrok:
1. Install ngrok: `npm install -g ngrok`
2. Start your backend server: `npm start`
3. In another terminal, run: `ngrok http 5000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
5. Update the callback URLs in your `.env` file

#### Using other tunneling services:
- Use any tunneling service that provides HTTPS URLs
- Update the callback URLs in your `.env` file

### 4. Test the Integration

1. Start the backend server: `npm start`
2. Test the health endpoint: `GET http://localhost:5000/api/health`
3. Test M-Pesa STK Push with a valid phone number

## Testing Phone Numbers (Sandbox)

For sandbox testing, use these test phone numbers:
- `254708374149` - Success
- `254708374150` - Insufficient funds
- `254708374151` - User cancelled

## Common Issues

### 1. "M-Pesa configuration missing" Error
- Ensure your `.env` file exists in the `backend` directory
- Check that all required environment variables are set
- Verify the file is not in `.gitignore`

### 2. "Failed to generate access token" Error
- Verify your Consumer Key and Consumer Secret are correct
- Check your internet connection
- Ensure the M-Pesa API is accessible

### 3. "Callback URL not accessible" Error
- Ensure your ngrok tunnel is running
- Verify the callback URL is accessible from the internet
- Check that the URL uses HTTPS (required by M-Pesa)

### 4. "Transaction failed" Error
- Use valid test phone numbers for sandbox
- Ensure the phone number is registered with M-Pesa
- Check that the amount is valid (minimum 1 KES)

## Security Notes

1. **Never commit your `.env` file to version control**
2. **Use environment variables for production**
3. **Implement proper authentication for production**
4. **Validate all input data**
5. **Use HTTPS for all callbacks**

## Production Deployment

For production deployment:

1. Set up proper environment variables on your hosting platform
2. Use production M-Pesa credentials
3. Set up proper SSL certificates
4. Implement proper logging and monitoring
5. Set up proper error handling and notifications

## Support

For M-Pesa API support:
- Documentation: https://developer.safaricom.co.ke/docs
- Support: https://developer.safaricom.co.ke/support
- Community: https://developer.safaricom.co.ke/community
