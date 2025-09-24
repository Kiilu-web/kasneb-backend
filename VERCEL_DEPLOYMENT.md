# 🚀 Vercel Deployment Guide for KASNEB Backend

## Quick Start

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Your Project Directory
```bash
# From the root of your project (kasneb-app)
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: kasneb-backend
# - Directory: ./
# - Override settings? N
```

### 4. Set Environment Variables
After deployment, set your environment variables:

```bash
# Set M-Pesa credentials
vercel env add MPESA_CONSUMER_KEY
# Enter: hyrJI95vFIlz0qetupTZPNAxq7juDj75Y3uZRG1KDvPlQ18b

vercel env add MPESA_CONSUMER_SECRET
# Enter: 7LLRFoaKbp8lNZNUE530HX6TtaFwWufoAGsSPsafStVR8JK6WyucSyWTWgZfNoRj

vercel env add MPESA_BUSINESS_SHORT_CODE
# Enter: 174379

vercel env add MPESA_PASSKEY
# Enter: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

vercel env add MPESA_ENVIRONMENT
# Enter: sandbox

vercel env add NODE_ENV
# Enter: production
```

### 5. Update M-Pesa Callback URLs
After deployment, Vercel will give you a URL like: `https://kasneb-backend-xxx.vercel.app`

Update your M-Pesa configuration:
```bash
vercel env add MPESA_CALLBACK_URL
# Enter: https://kasneb-backend-xxx.vercel.app/api/mpesa/callback

vercel env add MPESA_TIMEOUT_URL
# Enter: https://kasneb-backend-xxx.vercel.app/api/mpesa/timeout
```

### 6. Redeploy with Environment Variables
```bash
vercel --prod
```

## Alternative: Deploy via Vercel Dashboard

### 1. Go to Vercel Dashboard
Visit [https://vercel.com/dashboard](https://vercel.com/dashboard)

### 2. Import Project
- Click "New Project"
- Import your GitHub repository
- Vercel will auto-detect it's a Node.js project

### 3. Configure Build Settings
- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: `npm install`
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### 4. Add Environment Variables
In the Environment Variables section, add:

| Name | Value |
|------|-------|
| `MPESA_CONSUMER_KEY` | `hyrJI95vFIlz0qetupTZPNAxq7juDj75Y3uZRG1KDvPlQ18b` |
| `MPESA_CONSUMER_SECRET` | `7LLRFoaKbp8lNZNUE530HX6TtaFwWufoAGsSPsafStVR8JK6WyucSyWTWgZfNoRj` |
| `MPESA_BUSINESS_SHORT_CODE` | `174379` |
| `MPESA_PASSKEY` | `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919` |
| `MPESA_ENVIRONMENT` | `sandbox` |
| `NODE_ENV` | `production` |

### 5. Deploy
Click "Deploy" and wait for the deployment to complete.

## Post-Deployment Steps

### 1. Test Your API
```bash
# Test health endpoint
curl https://your-app-name.vercel.app/api/health

# Test M-Pesa endpoint
curl -X POST https://your-app-name.vercel.app/api/mpesa/test
```

### 2. Update Frontend Configuration
Update `src/config/api.js`:
```javascript
export const API_BASE_URL = 'https://your-app-name.vercel.app';
```

### 3. Update Backend M-Pesa Configuration
Update `backend/routes/mpesa.js` with your new Vercel URL:
```javascript
const MPESA_CONFIG = {
  // ... other config
  callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://your-app-name.vercel.app/api/mpesa/callback',
  timeoutUrl: process.env.MPESA_TIMEOUT_URL || 'https://your-app-name.vercel.app/api/mpesa/timeout',
};
```

### 4. Redeploy
```bash
vercel --prod
```

## Vercel-Specific Features

### 1. Automatic HTTPS
Vercel provides free SSL certificates automatically.

### 2. Global CDN
Your API will be served from Vercel's global edge network.

### 3. Automatic Deployments
Every push to your main branch will trigger a new deployment.

### 4. Environment Management
Easy environment variable management through dashboard or CLI.

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **Environment Variables**: Ensure all M-Pesa credentials are set
3. **Callback URLs**: Update M-Pesa callback URLs after deployment
4. **CORS Issues**: Make sure your frontend URL is allowed

### Useful Commands:
```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove

# Update environment variables
vercel env pull .env.local
```

## 🎉 You're Live on Vercel!

Once deployed, your KASNEB backend will be:
- ✅ Globally accessible
- ✅ HTTPS enabled
- ✅ Auto-scaling
- ✅ Ready for production M-Pesa payments

## Support
- Vercel Docs: [https://vercel.com/docs](https://vercel.com/docs)
- Vercel CLI: [https://vercel.com/docs/cli](https://vercel.com/docs/cli)
