# 🚀 KASNEB Backend Deployment Guide

## Quick Start - Railway (Recommended)

### 1. Prepare Your Repository
```bash
# Make sure your code is committed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Railway
1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `kasneb-app` repository
5. Railway will automatically detect it's a Node.js app

### 3. Configure Environment Variables
In Railway dashboard, go to Variables tab and add:

```
MPESA_CONSUMER_KEY=hyrJI95vFIlz0qetupTZPNAxq7juDj75Y3uZRG1KDvPlQ18b
MPESA_CONSUMER_SECRET=7LLRFoaKbp8lNZNUE530HX6TtaFwWufoAGsSPsafStVR8JK6WyucSyWTWgZfNoRj
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_ENVIRONMENT=sandbox
PORT=5000
NODE_ENV=production
```

### 4. Update M-Pesa Callback URLs
After deployment, Railway will give you a URL like: `https://your-app-name.railway.app`

Update your M-Pesa configuration:
```
MPESA_CALLBACK_URL=https://your-app-name.railway.app/api/mpesa/callback
MPESA_TIMEOUT_URL=https://your-app-name.railway.app/api/mpesa/timeout
```

### 5. Update Frontend
Update `src/config/api.js`:
```javascript
export const API_BASE_URL = 'https://your-app-name.railway.app';
```

## Alternative: Heroku Deployment

### 1. Install Heroku CLI
Download from [https://devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)

### 2. Deploy
```bash
# Login to Heroku
heroku login

# Create app
heroku create kasneb-backend

# Set environment variables
heroku config:set MPESA_CONSUMER_KEY=hyrJI95vFIlz0qetupTZPNAxq7juDj75Y3uZRG1KDvPlQ18b
heroku config:set MPESA_CONSUMER_SECRET=7LLRFoaKbp8lNZNUE530HX6TtaFwWufoAGsSPsafStVR8JK6WyucSyWTWgZfNoRj
heroku config:set MPESA_BUSINESS_SHORT_CODE=174379
heroku config:set MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
heroku config:set MPESA_ENVIRONMENT=sandbox
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

## Alternative: Render Deployment

### 1. Go to Render
Visit [https://render.com](https://render.com) and connect your GitHub account

### 2. Create Web Service
- Click "New" → "Web Service"
- Connect your GitHub repository
- Configure:
  - **Build Command**: `cd backend && npm install`
  - **Start Command**: `cd backend && npm start`
  - **Environment**: Node

### 3. Add Environment Variables
In the Render dashboard, add all the M-Pesa environment variables listed above.

## Post-Deployment Steps

### 1. Test Your API
```bash
# Test health endpoint
curl https://your-app-url.railway.app/api/health

# Test M-Pesa endpoint
curl -X POST https://your-app-url.railway.app/api/mpesa/test
```

### 2. Update Frontend
Update your React Native app's API configuration to use the new live URL.

### 3. Test M-Pesa Integration
Make a test payment to ensure everything works with the live backend.

## Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `MPESA_CONSUMER_KEY` | `hyrJI95vFIlz0qetupTZPNAxq7juDj75Y3uZRG1KDvPlQ18b` | M-Pesa API Consumer Key |
| `MPESA_CONSUMER_SECRET` | `7LLRFoaKbp8lNZNUE530HX6TtaFwWufoAGsSPsafStVR8JK6WyucSyWTWgZfNoRj` | M-Pesa API Consumer Secret |
| `MPESA_BUSINESS_SHORT_CODE` | `174379` | M-Pesa Business Short Code |
| `MPESA_PASSKEY` | `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919` | M-Pesa Passkey |
| `MPESA_ENVIRONMENT` | `sandbox` | M-Pesa Environment (sandbox/production) |
| `PORT` | `5000` | Server Port |
| `NODE_ENV` | `production` | Node Environment |

## Troubleshooting

### Common Issues:
1. **Build Fails**: Check that all dependencies are in `package.json`
2. **Environment Variables**: Ensure all M-Pesa credentials are set
3. **Callback URLs**: Update M-Pesa callback URLs after deployment
4. **CORS Issues**: Make sure your frontend URL is allowed

### Support:
- Railway: [https://docs.railway.app](https://docs.railway.app)
- Heroku: [https://devcenter.heroku.com](https://devcenter.heroku.com)
- Render: [https://render.com/docs](https://render.com/docs)

## 🎉 You're Live!

Once deployed, your KASNEB backend will be accessible worldwide and ready to handle real M-Pesa payments!
