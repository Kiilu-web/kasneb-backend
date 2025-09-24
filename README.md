# KASNEB Study Materials App

A comprehensive React Native Expo app for selling KASNEB past papers and study materials with M-Pesa payment integration.

## 🚀 Features

### User Features
- 📚 Browse KASNEB study materials by subject and level
- 🔍 Search and filter materials
- 🛒 Shopping cart functionality
- 💳 Secure M-Pesa payment integration
- 📥 Instant download after payment
- 👤 User profile management
- 📱 Offline access to purchased materials

### Admin Features
- 🔐 Secure admin authentication
- 📤 Upload PDF study materials
- 💰 View sales reports and analytics
- 👥 Manage user access
- 📊 Dashboard with key metrics

### Technical Features
- 🔥 Firebase Authentication & Firestore
- 💾 Firebase Storage for PDF files
- 🌐 Node.js/Express backend
- 💳 M-Pesa Daraja API integration
- 📱 React Native with Expo
- 🎨 Modern, responsive UI

## 📱 Screenshots

### User App
- **Home Screen**: Featured materials and quick actions
- **Materials Screen**: Browse and filter study materials
- **Cart Screen**: Shopping cart with M-Pesa integration
- **Payment Screen**: Secure M-Pesa payment flow
- **Receipt Screen**: Payment confirmation and downloads
- **Profile Screen**: User account management

### Admin App
- **Login Screen**: Secure admin authentication
- **Dashboard**: Sales overview and quick actions
- **Upload Screen**: Material upload with metadata
- **Sales Report**: Detailed sales analytics

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **React Navigation** - Navigation between screens
- **Firebase** - Authentication and database
- **Expo FileSystem** - File handling
- **React Native WebView** - PDF viewing

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Firebase Admin** - Server-side Firebase integration
- **M-Pesa Daraja API** - Payment processing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v14 or higher)
- Expo CLI
- Firebase Project
- M-Pesa Daraja API Account
- Android Studio / Xcode (for mobile development)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kasneb-app
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start Expo development server
npm start
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Configure environment variables
# Edit .env file with your Firebase and M-Pesa credentials

# Start development server
npm run dev
```

### 4. Firebase Configuration

1. Create a Firebase project
2. Enable Authentication, Firestore, and Storage
3. Download service account key
4. Update Firebase config in `src/config/firebase.js`
5. Update backend Firebase config

### 5. M-Pesa Setup

1. Register for M-Pesa Daraja API
2. Get Consumer Key and Secret
3. Set up Business Short Code
4. Configure callback URLs
5. Update backend environment variables

## 📁 Project Structure

```
kasneb-app/
├── src/
│   ├── config/
│   │   └── firebase.js
│   └── screens/
│       ├── HomeScreen.js
│       ├── MaterialsScreen.js
│       ├── CartScreen.js
│       ├── PaymentScreen.js
│       ├── ReceiptScreen.js
│       ├── ProfileScreen.js
│       ├── AdminLoginScreen.js
│       ├── AdminDashboardScreen.js
│       ├── UploadMaterialScreen.js
│       └── SalesReportScreen.js
├── backend/
│   ├── routes/
│   │   ├── mpesa.js
│   │   ├── materials.js
│   │   └── sales.js
│   ├── config/
│   │   └── firebase-service-account.json
│   ├── server.js
│   └── package.json
├── App.js
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### Backend (.env)
```env
PORT=5000
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_SHORT_CODE=your_business_shortcode
MPESA_PASSKEY=your_passkey
MPESA_ENVIRONMENT=sandbox
```

## 🧪 Testing

### Frontend Testing
```bash
# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Backend Testing
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test M-Pesa integration (sandbox)
curl -X POST http://localhost:5000/api/mpesa/stkpush \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"254700000000","amount":100,"cartItems":[]}'
```

## 📊 API Endpoints

### M-Pesa Integration
- `POST /api/mpesa/stkpush` - Initiate payment
- `POST /api/mpesa/callback` - Payment confirmation
- `GET /api/mpesa/transaction/:id` - Transaction status

### Materials Management
- `GET /api/materials` - List materials
- `POST /api/materials` - Upload material
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material

### Sales Management
- `GET /api/sales` - List sales
- `GET /api/sales/stats` - Sales statistics
- `GET /api/sales/export/report` - Export report

## 🔒 Security Features

- Firebase Authentication for user management
- Secure M-Pesa integration with callbacks
- Input validation and sanitization
- CORS configuration
- Environment variable protection
- File upload security

## 📈 Deployment

### Frontend Deployment
1. Build the app: `expo build`
2. Deploy to app stores or web
3. Configure production Firebase project

### Backend Deployment
1. Set up production environment variables
2. Deploy to cloud platform (Heroku, AWS, etc.)
3. Configure SSL certificates
4. Set up M-Pesa production credentials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@kasneb.com
- 📞 Phone: +254 700 000 000
- 📖 Documentation: [Wiki](link-to-wiki)

## 🙏 Acknowledgments

- KASNEB for study materials
- Safaricom for M-Pesa API
- Firebase for backend services
- Expo team for development platform

---

**Built with ❤️ for KASNEB students** 