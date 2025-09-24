# KASNEB Backend API

Backend API for the KASNEB Study Materials App with M-Pesa integration.

## Features

- 🔐 Firebase Authentication & Firestore
- 💳 M-Pesa STK Push Integration
- 📚 Study Materials Management
- 📊 Sales Reports & Analytics
- 📁 File Upload to Firebase Storage
- 🔄 Payment Callback Handling

## Prerequisites

- Node.js (v14 or higher)
- Firebase Project
- M-Pesa Daraja API Account

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment example file and configure your variables:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# M-Pesa Daraja API Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_SHORT_CODE=your_business_shortcode
MPESA_PASSKEY=your_passkey
MPESA_ENVIRONMENT=sandbox

# Callback URLs
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
MPESA_TIMEOUT_URL=https://your-domain.com/api/mpesa/timeout

# Security
JWT_SECRET=your_jwt_secret_key
```

### 3. Firebase Setup

1. Go to your Firebase Console
2. Navigate to Project Settings > Service Accounts
3. Generate a new private key
4. Download the JSON file
5. Replace the content in `config/firebase-service-account.json` with your actual service account details

### 4. M-Pesa Daraja API Setup

1. Register for M-Pesa Daraja API at https://developer.safaricom.co.ke/
2. Get your Consumer Key and Consumer Secret
3. Set up your Business Short Code and Passkey
4. Configure callback URLs

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### M-Pesa Integration
- `POST /api/mpesa/stkpush` - Initiate STK Push
- `POST /api/mpesa/callback` - M-Pesa callback handler
- `GET /api/mpesa/transaction/:checkoutRequestID` - Get transaction status

### Materials Management
- `GET /api/materials` - Get all materials
- `GET /api/materials/:id` - Get material by ID
- `POST /api/materials` - Create new material
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material
- `GET /api/materials/subject/:subject` - Get materials by subject
- `GET /api/materials/level/:level` - Get materials by level

### Sales Management
- `GET /api/sales` - Get all sales
- `GET /api/sales/stats` - Get sales statistics
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales` - Create new sale
- `PATCH /api/sales/:id/status` - Update sale status
- `GET /api/sales/customer/:phone` - Get sales by customer
- `GET /api/sales/export/report` - Export sales report

## M-Pesa Integration Flow

1. **STK Push Request**: Client sends payment request with phone number and amount
2. **M-Pesa Prompt**: User receives M-Pesa prompt on their phone
3. **Payment Processing**: User enters PIN to complete payment
4. **Callback**: M-Pesa sends confirmation to callback URL
5. **Transaction Update**: Backend updates transaction status and creates sale record
6. **Access Grant**: User gets access to purchased materials

## File Structure

```
backend/
├── config/
│   └── firebase-service-account.json
├── routes/
│   ├── mpesa.js
│   ├── materials.js
│   └── sales.js
├── server.js
├── package.json
├── env.example
└── README.md
```

## Error Handling

The API includes comprehensive error handling for:
- Invalid requests
- M-Pesa API errors
- Firebase connection issues
- File upload errors
- Database operation failures

## Security Considerations

- All sensitive data is stored in environment variables
- Firebase service account credentials are secured
- M-Pesa credentials are encrypted
- Input validation on all endpoints
- CORS configuration for frontend access

## Testing

To test the M-Pesa integration:

1. Use sandbox environment for development
2. Test with M-Pesa sandbox phone numbers
3. Monitor callback logs for payment confirmations
4. Verify transaction status updates

## Deployment

1. Set up environment variables on your hosting platform
2. Upload Firebase service account credentials
3. Configure M-Pesa callback URLs for production
4. Set up SSL certificates for secure communication
5. Configure proper CORS settings for your domain

## Support

For issues and questions:
- Check the logs for error details
- Verify environment variable configuration
- Ensure Firebase and M-Pesa credentials are correct
- Test with sandbox environment first

## License

MIT License - see LICENSE file for details 