import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../config/api';

const PaymentScreen = ({ navigation, route }) => {
  const { cartItems, totalAmount, phoneNumber } = route.params;
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
  const pollingRef = useRef(null);
  const checkoutRequestIdRef = useRef(null);

  const initiatePayment = async () => {
    setLoading(true);
    setPaymentStatus('processing');

    try {
      const response = await fetch(`${API_BASE_URL}/api/mpesa/stkpush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          amount: totalAmount,
          cartItems: cartItems,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }

      const data = await response.json();
      checkoutRequestIdRef.current = data.checkoutRequestID;

      // Start polling transaction status
      startPollingStatus();

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startPollingStatus = () => {
    stopPollingStatus();
    pollingRef.current = setInterval(async () => {
      try {
        if (!checkoutRequestIdRef.current) return;
        const res = await fetch(`${API_BASE_URL}/api/mpesa/transaction/${checkoutRequestIdRef.current}`);
        if (!res.ok) return;
        const json = await res.json();
        const status = json?.transaction?.status;
        if (status === 'completed') {
          stopPollingStatus();
          setPaymentStatus('success');
          navigation.replace('Receipt', {
            transactionId: json.transaction.id,
            amount: json.transaction.amount,
            phoneNumber: json.transaction.phoneNumber,
            cartItems: json.transaction.cartItems,
            timestamp: new Date().toISOString(),
          });
        } else if (status === 'failed') {
          stopPollingStatus();
          setPaymentStatus('failed');
          Alert.alert('Payment Failed', json?.transaction?.failureReason || 'Payment was not successful');
        }
      } catch (e) {
        // swallow errors during polling
      }
    }, 3000);
  };

  const stopPollingStatus = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopPollingStatus();
    };
  }, []);

  const formatPhoneNumber = (phone) => {
    if (phone.startsWith('254')) {
      return phone;
    } else if (phone.startsWith('07') || phone.startsWith('01')) {
      return '254' + phone.substring(1);
    }
    return phone;
  };

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusText}>Processing M-Pesa Payment...</Text>
            <Text style={styles.statusSubtext}>
              Please check your phone for the M-Pesa prompt
            </Text>
          </View>
        );
      case 'success':
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.statusText}>Payment Successful!</Text>
            <Text style={styles.statusSubtext}>
              Redirecting to receipt...
            </Text>
          </View>
        );
      case 'failed':
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.failedIcon}>❌</Text>
            <Text style={styles.statusText}>Payment Failed</Text>
            <Text style={styles.statusSubtext}>
              Please try again or contact support
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>M-Pesa Payment</Text>
          <Text style={styles.headerSubtitle}>Complete your purchase securely</Text>
        </View>

        {paymentStatus === 'pending' && (
          <>
            {/* Order Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              {cartItems.map((item, index) => (
                <View key={index} style={styles.orderItem}>
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemTitle}>{item.title}</Text>
                    <Text style={styles.orderItemMeta}>
                      {item.subject} • {item.level}
                    </Text>
                  </View>
                  <Text style={styles.orderItemPrice}>
                    KES {item.price * item.quantity}
                  </Text>
                </View>
              ))}
              
              <View style={styles.orderDivider} />
              
              <View style={styles.orderTotal}>
                <Text style={styles.orderTotalLabel}>Total Amount:</Text>
                <Text style={styles.orderTotalValue}>KES {totalAmount}</Text>
              </View>
            </View>

            {/* Payment Details */}
            <View style={styles.paymentContainer}>
              <Text style={styles.paymentTitle}>Payment Details</Text>
              
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Phone Number:</Text>
                <Text style={styles.paymentValue}>{formatPhoneNumber(phoneNumber)}</Text>
              </View>
              
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Payment Method:</Text>
                <Text style={styles.paymentValue}>M-Pesa</Text>
              </View>
              
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Processing Fee:</Text>
                <Text style={styles.paymentValue}>KES 0</Text>
              </View>
            </View>

            {/* M-Pesa Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>How it works:</Text>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>1</Text>
                <Text style={styles.instructionText}>
                  Tap "Pay with M-Pesa" below
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>2</Text>
                <Text style={styles.instructionText}>
                  You'll receive an M-Pesa prompt on your phone
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>3</Text>
                <Text style={styles.instructionText}>
                  Enter your M-Pesa PIN to complete payment
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>4</Text>
                <Text style={styles.instructionText}>
                  Download your study materials instantly
                </Text>
              </View>
            </View>

            {/* Pay Button */}
            <View style={styles.payContainer}>
              <TouchableOpacity
                style={[styles.payButton, loading && styles.payButtonDisabled]}
                onPress={initiatePayment}
                disabled={loading}
              >
                <Text style={styles.payButtonText}>
                  {loading ? 'Processing...' : `Pay KES ${totalAmount} with M-Pesa`}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Payment Status */}
        {paymentStatus !== 'pending' && renderPaymentStatus()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  summaryContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  orderItemMeta: {
    fontSize: 12,
    color: '#666',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  orderDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 15,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  paymentContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  instructionsContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  instructionNumber: {
    backgroundColor: '#007AFF',
    color: 'white',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    textAlign: 'center',
    lineHeight: 25,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 15,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  payContainer: {
    padding: 15,
  },
  payButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  statusSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  successIcon: {
    fontSize: 60,
  },
  failedIcon: {
    fontSize: 60,
  },
});

export default PaymentScreen; 