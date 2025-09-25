const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const admin = require('firebase-admin');

// Test endpoint to verify ngrok is working
router.get('/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({
    success: true,
    message: 'M-Pesa routes are working!',
    timestamp: new Date().toISOString(),
    ngrok: 'Active'
  });
});

// M-Pesa configuration
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || 'hyrJI95vFIlz0qetupTZPNAxq7juDj75Y3uZRG1KDvPlQ18b',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || '7LLRFoaKbp8lNZNUE530HX6TtaFwWufoAGsSPsafStVR8JK6WyucSyWTWgZfNoRj',
  businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE || '174379',
  passkey: process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
  callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://kasneb-app.vercel.app/api/mpesa/callback',
  timeoutUrl: process.env.MPESA_TIMEOUT_URL || 'https://kasneb-app.vercel.app/api/mpesa/timeout',
};

// Test credentials (from successful request)
const TEST_CREDENTIALS = {
  consumerKey: 'hyrJI95vFIlz0qetupTZPNAxq7juDj75Y3uZRG1KDvPlQ18b', // Replace with your actual key
  consumerSecret: '7LLRFoaKbp8lNZNUE530HX6TtaFwWufoAGsSPsafStVR8JK6WyucSyWTWgZfNoRj', // Replace with your actual secret
  businessShortCode: '174379',
  passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  environment: 'sandbox',
  callbackUrl: 'https://kasneb-app.vercel.app/api/mpesa/callback',
  timeoutUrl: 'https://kasneb-app.vercel.app/api/mpesa/timeout',
};

// Validate M-Pesa configuration
const validateMpesaConfig = () => {
  const requiredFields = ['consumerKey', 'consumerSecret', 'businessShortCode', 'passkey'];
  const missingFields = requiredFields.filter(field => 
    !MPESA_CONFIG[field] || MPESA_CONFIG[field].includes('your_')
  );
  
  if (missingFields.length > 0) {
    throw new Error(`M-Pesa configuration missing: ${missingFields.join(', ')}. Please set up your M-Pesa credentials in the .env file.`);
  }
};

// Get M-Pesa API base URL based on environment
const getMpesaBaseUrl = () => {
  return MPESA_CONFIG.environment === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
};

// Generate access token
const generateAccessToken = async () => {
  try {
    console.log('🔑 Starting access token generation...');
    console.log('🔑 Consumer Key:', MPESA_CONFIG.consumerKey);
    console.log('🔑 Consumer Secret:', MPESA_CONFIG.consumerSecret ? '***' + MPESA_CONFIG.consumerSecret.slice(-4) : 'NOT SET');
    
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    console.log('🔑 Auth string generated');
    
    const tokenUrl = `${getMpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`;
    console.log('🔑 Token URL:', tokenUrl);
    
    const response = await axios.get(tokenUrl, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    
    console.log('✅ Access token response received');
    console.log('🔑 Access token:', response.data.access_token ? response.data.access_token.substring(0, 20) + '...' : 'NOT RECEIVED');
    
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Error generating access token:', error.message);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    }
    throw new Error('Failed to generate access token');
  }
};

// Generate password
const generatePassword = () => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64');
  return password;
};

// STK Push endpoint
router.post('/stkpush', async (req, res) => {
  console.log('🚀 STK Push Request Received');
  console.log('📱 Request Body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Validate M-Pesa configuration first
    console.log('🔧 Validating M-Pesa configuration...');
    validateMpesaConfig();
    console.log('✅ M-Pesa configuration validated');

    const { phoneNumber, amount, cartItems, userId } = req.body;
    console.log('📋 Extracted data:', { phoneNumber, amount, cartItemsCount: cartItems?.length, userId });

    // Validate input
    if (!phoneNumber || !amount || !cartItems || !userId) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Phone number, amount, cart items, and user ID are required'
      });
    }
    console.log('✅ Input validation passed');

    // Format phone number
    console.log('📞 Formatting phone number...');
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      formattedPhone = '254' + phoneNumber.substring(1);
    } else if (phoneNumber.startsWith('+')) {
      formattedPhone = phoneNumber.substring(1);
    }
    console.log(`📞 Phone formatted: ${phoneNumber} → ${formattedPhone}`);

    // Generate access token
    console.log('🔑 Generating access token...');
    const accessToken = await generateAccessToken();
    console.log('✅ Access token generated:', accessToken.substring(0, 20) + '...');
    
    console.log('🔐 Generating password...');
    const password = generatePassword();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    console.log('✅ Password generated, timestamp:', timestamp);

    // Prepare STK Push request
    console.log('📝 Preparing STK Push request...');
    const stkPushData = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callbackUrl,
      AccountReference: 'KASNEB Materials',
      TransactionDesc: `Purchase of ${cartItems.length} study material(s)`,
    };
    console.log('📝 STK Push data prepared:', JSON.stringify(stkPushData, null, 2));

    // Make STK Push request
    console.log('🌐 Making STK Push request to M-Pesa API...');
    console.log('🔗 API URL:', `${getMpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`);
    console.log('🔗 Callback URL:', MPESA_CONFIG.callbackUrl);
    
    const response = await axios.post(
      `${getMpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`,
      stkPushData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ M-Pesa API response received:', JSON.stringify(response.data, null, 2));

    // Save transaction to Firestore
    console.log('💾 Saving transaction to Firestore...');
    const transactionData = {
      checkoutRequestID: response.data.CheckoutRequestID,
      merchantRequestID: response.data.MerchantRequestID,
      phoneNumber: formattedPhone,
      amount: amount,
      cartItems: cartItems,
      userId: userId,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    console.log('💾 Transaction data to save:', JSON.stringify(transactionData, null, 2));

    const transactionRef = await admin.firestore().collection('transactions').add(transactionData);
    console.log('✅ Transaction saved to Firestore with ID:', transactionRef.id);

    console.log('🎉 STK Push initiated successfully!');
    const successResponse = {
      success: true,
      message: 'STK Push initiated successfully',
      checkoutRequestID: response.data.CheckoutRequestID,
      merchantRequestID: response.data.MerchantRequestID,
    };
    console.log('📤 Sending response:', JSON.stringify(successResponse, null, 2));
    
    res.json(successResponse);

  } catch (error) {
    console.error('STK Push error:', error);
    
    // Handle specific error types
    if (error.message.includes('M-Pesa configuration missing')) {
      return res.status(500).json({
        error: 'M-Pesa Configuration Error',
        message: error.message,
        details: 'Please contact the administrator to set up M-Pesa credentials.'
      });
    }
    
    if (error.response) {
      // M-Pesa API error
      return res.status(500).json({
        error: 'M-Pesa API Error',
        message: error.response.data?.errorMessage || 'M-Pesa service is currently unavailable',
        details: 'Please try again later or contact support.'
      });
    }
    
    res.status(500).json({
      error: 'STK Push failed',
      message: error.message,
      details: 'An unexpected error occurred. Please try again.'
    });
  }
});

// M-Pesa callback endpoint
router.post('/callback', async (req, res) => {
  console.log('📞 M-Pesa Callback Received');
  console.log('📱 Callback Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { Body } = req.body;
    
    if (!Body) {
      console.log('❌ Invalid callback data: No Body found');
      return res.status(400).json({ error: 'Invalid callback data' });
    }
    console.log('✅ Callback data validated');

    const stkCallback = Body.stkCallback;
    const checkoutRequestID = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    console.log('📊 M-Pesa Callback Details:', {
      checkoutRequestID,
      resultCode,
      resultDesc,
    });

    // Find transaction in Firestore
    const transactionsRef = admin.firestore().collection('transactions');
    const querySnapshot = await transactionsRef
      .where('checkoutRequestID', '==', checkoutRequestID)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      console.error('Transaction not found:', checkoutRequestID);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transactionDoc = querySnapshot.docs[0];
    const transactionData = transactionDoc.data();

    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata;
      const item = callbackMetadata.Item;

      const mpesaReceiptNumber = item.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = item.find(i => i.Name === 'TransactionDate')?.Value;
      const amount = item.find(i => i.Name === 'Amount')?.Value;

      // Update transaction status
      await transactionDoc.ref.update({
        status: 'completed',
        mpesaReceiptNumber,
        transactionDate,
        actualAmount: amount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create sales record
      const salesData = {
        transactionId: transactionDoc.id,
        mpesaReceiptNumber,
        customerPhone: transactionData.phoneNumber,
        amount: transactionData.amount,
        cartItems: transactionData.cartItems,
        transactionDate: new Date(parseInt(transactionDate)),
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await admin.firestore().collection('sales').add(salesData);

      // Save individual purchases for user profile
      const cartItems = transactionData.cartItems || [];
      console.log('✅ Purchase completed for materials:', cartItems.map(item => item.title));

      // Save each material as a separate purchase record
      for (const item of cartItems) {
        const purchaseData = {
          userId: transactionData.userId,
          materialId: item.id,
          materialTitle: item.title,
          subject: item.subject,
          level: item.level,
          year: item.year,
          price: item.price,
          amount: item.price,
          downloadURL: item.downloadURL,
          fileSize: item.fileSize,
          pages: item.pages,
          transactionId: transactionDoc.id,
          mpesaReceiptNumber,
          purchaseDate: new Date(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await admin.firestore().collection('purchases').add(purchaseData);
        console.log('📝 Saved purchase record for:', item.title);
      }

      console.log('Payment completed successfully:', mpesaReceiptNumber);

    } else {
      // Payment failed
      await transactionDoc.ref.update({
        status: 'failed',
        failureReason: resultDesc,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('Payment failed:', resultDesc);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

// Test endpoint to check purchases
router.get('/test-purchases', async (req, res) => {
  try {
    console.log('🔍 Testing purchases collection...');
    
    // Get all purchases
    const purchasesRef = admin.firestore().collection('purchases');
    const snapshot = await purchasesRef.get();
    
    const purchases = [];
    snapshot.forEach(doc => {
      purchases.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('📦 Found purchases:', purchases.length);
    console.log('📋 Purchase details:', purchases);
    
    res.json({
      success: true,
      count: purchases.length,
      purchases: purchases
    });
  } catch (error) {
    console.error('Error testing purchases:', error);
    res.status(500).json({ error: 'Failed to test purchases', details: error.message });
  }
});

// Test endpoint to create a sample purchase
router.post('/test-create-purchase', async (req, res) => {
  try {
    console.log('🧪 Creating test purchase...');
    const { userId } = req.body;
    
    const testPurchase = {
      userId: userId || 'test-user-123',
      materialId: 'test-material-123',
      materialTitle: 'Test CPA Foundation Material',
      subject: 'CPA Foundation',
      level: 'Foundation',
      year: '2024',
      price: 500,
      amount: 500,
      downloadURL: 'https://example.com/test-material.pdf',
      fileSize: '2.5 MB',
      pages: 150,
      transactionId: 'test-transaction-123',
      mpesaReceiptNumber: 'TEST123456',
      purchaseDate: new Date(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    const docRef = await admin.firestore().collection('purchases').add(testPurchase);
    console.log('✅ Test purchase created with ID:', docRef.id);
    console.log('👤 For user ID:', testPurchase.userId);
    
    res.json({
      success: true,
      message: 'Test purchase created successfully',
      purchaseId: docRef.id,
      purchase: testPurchase
    });
  } catch (error) {
    console.error('Error creating test purchase:', error);
    res.status(500).json({ error: 'Failed to create test purchase', details: error.message });
  }
});

// Get transaction status
router.get('/transaction/:checkoutRequestID', async (req, res) => {
  try {
    const { checkoutRequestID } = req.params;

    const transactionsRef = admin.firestore().collection('transactions');
    const querySnapshot = await transactionsRef
      .where('checkoutRequestID', '==', checkoutRequestID)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transactionData = querySnapshot.docs[0].data();
    res.json({
      success: true,
      transaction: {
        id: querySnapshot.docs[0].id,
        ...transactionData,
      },
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
});

module.exports = router; 