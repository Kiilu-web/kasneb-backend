import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Text, Container } from '../components/ui';
import { API_BASE_URL } from '../config/api';
import { auth } from '../config/firebase';
import theme from '../config/theme';

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
          userId: auth.currentUser?.uid,
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
          <Container style={styles.statusContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="h4" color="textPrimary" style={styles.statusText}>
              Processing M-Pesa Payment...
            </Text>
            <Text variant="body" color="textSecondary" style={styles.statusSubtext}>
              Please check your phone for the M-Pesa prompt
            </Text>
          </Container>
        );
      case 'success':
        return (
          <Container style={styles.statusContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text variant="h4" color="textPrimary" style={styles.statusText}>
              Payment Successful!
            </Text>
            <Text variant="body" color="textSecondary" style={styles.statusSubtext}>
              Redirecting to receipt...
            </Text>
          </Container>
        );
      case 'failed':
        return (
          <Container style={styles.statusContainer}>
            <Text style={styles.failedIcon}>❌</Text>
            <Text variant="h4" color="textPrimary" style={styles.statusText}>
              Payment Failed
            </Text>
            <Text variant="body" color="textSecondary" style={styles.statusSubtext}>
              Please try again or contact support
            </Text>
          </Container>
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
          <Text variant="h2" color="textInverse" style={styles.headerTitle}>
            M-Pesa Payment
          </Text>
          <Text variant="bodyLarge" color="textInverse" style={styles.headerSubtitle}>
            Complete your purchase securely
          </Text>
        </View>

        {paymentStatus === 'pending' && (
          <>
            {/* Order Summary */}
            <Card style={styles.summaryContainer}>
              <Text variant="h4" color="textPrimary" style={styles.summaryTitle}>
                Order Summary
              </Text>
              {cartItems.map((item, index) => (
                <View key={index} style={styles.orderItem}>
                  <View style={styles.orderItemInfo}>
                    <Text variant="h6" color="textPrimary" style={styles.orderItemTitle}>
                      {item.title}
                    </Text>
                    <Text variant="caption" color="textSecondary" style={styles.orderItemMeta}>
                      {item.subject} • {item.level}
                    </Text>
                  </View>
                  <Text variant="price" color="primary" style={styles.orderItemPrice}>
                    KES {item.price * item.quantity}
                  </Text>
                </View>
              ))}
              
              <View style={styles.orderDivider} />
              
              <View style={styles.orderTotal}>
                <Text variant="h5" color="textPrimary" style={styles.orderTotalLabel}>
                  Total Amount:
                </Text>
                <Text variant="priceLarge" color="primary" style={styles.orderTotalValue}>
                  KES {totalAmount}
                </Text>
              </View>
            </Card>

            {/* Payment Details */}
            <Card style={styles.paymentContainer}>
              <Text variant="h4" color="textPrimary" style={styles.paymentTitle}>
                Payment Details
              </Text>
              
              <View style={styles.paymentRow}>
                <Text variant="body" color="textSecondary" style={styles.paymentLabel}>
                  Phone Number:
                </Text>
                <Text variant="body" color="textPrimary" style={styles.paymentValue}>
                  {formatPhoneNumber(phoneNumber)}
                </Text>
              </View>
              
              <View style={styles.paymentRow}>
                <Text variant="body" color="textSecondary" style={styles.paymentLabel}>
                  Payment Method:
                </Text>
                <Text variant="body" color="textPrimary" style={styles.paymentValue}>
                  M-Pesa
                </Text>
              </View>
              
              <View style={styles.paymentRow}>
                <Text variant="body" color="textSecondary" style={styles.paymentLabel}>
                  Processing Fee:
                </Text>
                <Text variant="body" color="textPrimary" style={styles.paymentValue}>
                  KES 0
                </Text>
              </View>
            </Card>

            {/* M-Pesa Instructions */}
            <Card style={styles.instructionsContainer}>
              <Text variant="h4" color="textPrimary" style={styles.instructionsTitle}>
                How it works:
              </Text>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text variant="button" color="textInverse">1</Text>
                </View>
                <Text variant="body" color="textPrimary" style={styles.instructionText}>
                  Tap "Pay with M-Pesa" below
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text variant="button" color="textInverse">2</Text>
                </View>
                <Text variant="body" color="textPrimary" style={styles.instructionText}>
                  You'll receive an M-Pesa prompt on your phone
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text variant="button" color="textInverse">3</Text>
                </View>
                <Text variant="body" color="textPrimary" style={styles.instructionText}>
                  Enter your M-Pesa PIN to complete payment
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text variant="button" color="textInverse">4</Text>
                </View>
                <Text variant="body" color="textPrimary" style={styles.instructionText}>
                  Download your study materials instantly
                </Text>
              </View>
            </Card>

            {/* Pay Button */}
            <Container style={styles.payContainer}>
              <Button
                title={loading ? 'Processing...' : `Pay KES ${totalAmount} with M-Pesa`}
                onPress={initiatePayment}
                disabled={loading}
                loading={loading}
                style={styles.payButton}
                size="large"
              />
              
              <Button
                title="Cancel"
                onPress={() => navigation.goBack()}
                disabled={loading}
                variant="outline"
                style={styles.cancelButton}
              />
            </Container>
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
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxxl,
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    textAlign: 'center',
    opacity: 0.9,
  },
  summaryContainer: {
    margin: theme.spacing.md,
  },
  summaryTitle: {
    marginBottom: theme.spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemTitle: {
    marginBottom: theme.spacing.xs,
  },
  orderItemMeta: {
    // Styling handled by Text component
  },
  orderItemPrice: {
    // Styling handled by Text component
  },
  orderDivider: {
    height: 1,
    backgroundColor: theme.colors.gray,
    marginVertical: theme.spacing.md,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalLabel: {
    // Styling handled by Text component
  },
  orderTotalValue: {
    // Styling handled by Text component
  },
  paymentContainer: {
    margin: theme.spacing.md,
  },
  paymentTitle: {
    marginBottom: theme.spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  paymentLabel: {
    // Styling handled by Text component
  },
  paymentValue: {
    // Styling handled by Text component
  },
  instructionsContainer: {
    margin: theme.spacing.md,
  },
  instructionsTitle: {
    marginBottom: theme.spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  instructionNumber: {
    backgroundColor: theme.colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  instructionText: {
    flex: 1,
  },
  payContainer: {
    padding: theme.spacing.md,
  },
  payButton: {
    marginBottom: theme.spacing.sm,
  },
  cancelButton: {
    // Styling handled by Button component
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxxl,
  },
  statusText: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  statusSubtext: {
    textAlign: 'center',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  failedIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
});

export default PaymentScreen; 