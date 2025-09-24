# ngrok Setup for M-Pesa Integration

## Current ngrok Status ✅

**ngrok is now running and ready for M-Pesa callbacks!**

### Your ngrok URL:
```
https://9ea40c0cc986.ngrok-free.app
```

### Backend Health Check:
```
https://9ea40c0cc986.ngrok-free.app/api/health
```

## Environment Configuration

Create a `.env` file in the `backend` directory with the following content:

```env
# M-Pesa Configuration (Sandbox)
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_ENVIRONMENT=sandbox

# Current ngrok URL (update this when ngrok restarts)
MPESA_CALLBACK_URL=https://9ea40c0cc986.ngrok-free.app/api/mpesa/callback
MPESA_TIMEOUT_URL=https://9ea40c0cc986.ngrok-free.app/api/mpesa/timeout

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Important Notes

### 1. ngrok URL Changes
- **Free ngrok URLs change every time you restart ngrok**
- **Update your `.env` file** whenever you restart ngrok
- **The current URL is valid until you stop/restart ngrok**

### 2. M-Pesa Credentials
- Replace `your_consumer_key_here` and `your_consumer_secret_here` with your actual M-Pesa credentials
- Get credentials from: https://developer.safaricom.co.ke/

### 3. Testing the Setup
Once you have your M-Pesa credentials:

1. **Test the callback endpoint:**
   ```
   GET https://9ea40c0cc986.ngrok-free.app/api/mpesa/callback
   ```

2. **Test STK Push:**
   ```
   POST https://9ea40c0cc986.ngrok-free.app/api/mpesa/stkpush
   ```

## ngrok Commands

### Start ngrok:
```bash
ngrok http 5000
```

### Check ngrok status:
```bash
# Open ngrok web interface
http://localhost:4040

# Get tunnel info via API
curl http://localhost:4040/api/tunnels
```

### Stop ngrok:
```bash
# Press Ctrl+C in the ngrok terminal
# Or kill the process
```

## Troubleshooting

### 1. ngrok Warning Page
If you see a warning page when accessing the URL, add this header:
```
ngrok-skip-browser-warning: true
```

### 2. URL Not Accessible
- Ensure ngrok is running
- Check that your backend server is running on port 5000
- Verify the ngrok URL hasn't changed

### 3. M-Pesa Callback Issues
- Ensure the callback URL is HTTPS (ngrok provides this)
- Make sure the URL is accessible from the internet
- Check that your backend server is running

## Next Steps

1. **Get M-Pesa credentials** from Safaricom Developer Portal
2. **Create `.env` file** with the configuration above
3. **Update callback URLs** in your `.env` file
4. **Test M-Pesa integration** with sandbox credentials
5. **Deploy to production** with live credentials

## Production Deployment

For production, you'll need:
- A permanent domain with SSL certificate
- Production M-Pesa credentials
- Proper server hosting (not ngrok)
- Environment variables set on your hosting platform

---

**Current Status:** ✅ ngrok is running and ready for M-Pesa integration!
