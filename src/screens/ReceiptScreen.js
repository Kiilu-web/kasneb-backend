import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as WebBrowser from 'expo-web-browser';
import { storage } from '../config/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

const ReceiptScreen = ({ navigation, route }) => {
  const { transactionId, amount, phoneNumber, cartItems, timestamp } = route.params;
  const [downloading, setDownloading] = useState({});

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPhoneNumber = (phone) => {
    if (phone.startsWith('254')) {
      return phone;
    } else if (phone.startsWith('07') || phone.startsWith('01')) {
      return '254' + phone.substring(1);
    }
    return phone;
  };

  const downloadMaterial = async (material) => {
    setDownloading(prev => ({ ...prev, [material.id]: true }));

    try {
      // In a real app, this would download from Firebase Storage
      const downloadUrl = await getDownloadURL(ref(storage, material.filePath));
      const response = await FileSystem.downloadAsync(downloadUrl, FileSystem.documentDirectory + material.title + '.pdf');
      
      // For demo purposes, simulate download
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Download Complete',
        `${material.title} has been downloaded successfully!`,
        [
          {
            text: 'Open PDF',
            onPress: () => openPDF(material),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', 'There was an error downloading the file. Please try again.');
    } finally {
      setDownloading(prev => ({ ...prev, [material.id]: false }));
    }
  };

  const openPDF = async (material) => {
    try {
      // Use the downloadURL directly instead of local file
      if (material.downloadURL) {
        await WebBrowser.openBrowserAsync(material.downloadURL);
      } else {
        Alert.alert('PDF Viewer', 'PDF viewer functionality would open here in a real app.');
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert('Error', 'Could not open the PDF file.');
    }
  };

  const shareReceipt = async () => {
    try {
      const receiptText = `KASNEB Study Materials Purchase Receipt\n\nTransaction ID: ${transactionId}\nAmount: KES ${amount}\nDate: ${formatDate(timestamp)}\n\nThank you for your purchase!`;
      
      await Share.share({
        message: receiptText,
        title: 'KASNEB Purchase Receipt',
      });
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payment Successful!</Text>
          <Text style={styles.headerSubtitle}>Thank you for your purchase</Text>
        </View>

        {/* Success Message */}
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Payment Completed</Text>
          <Text style={styles.successMessage}>
            Your payment has been processed successfully. You can now download your study materials.
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.transactionContainer}>
          <Text style={styles.transactionTitle}>Transaction Details</Text>
          
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>Transaction ID:</Text>
            <Text style={styles.transactionValue}>{transactionId}</Text>
          </View>
          
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>Amount Paid:</Text>
            <Text style={styles.transactionValue}>KES {amount}</Text>
          </View>
          
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>Phone Number:</Text>
            <Text style={styles.transactionValue}>{formatPhoneNumber(phoneNumber)}</Text>
          </View>
          
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>Date & Time:</Text>
            <Text style={styles.transactionValue}>{formatDate(timestamp)}</Text>
          </View>
          
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>Payment Method:</Text>
            <Text style={styles.transactionValue}>M-Pesa</Text>
          </View>
        </View>

        {/* Purchased Materials */}
        <View style={styles.materialsContainer}>
          <Text style={styles.materialsTitle}>Your Study Materials</Text>
          
          {cartItems.map((item, index) => (
            <View key={index} style={styles.materialItem}>
              <View style={styles.materialInfo}>
                <Text style={styles.materialTitle}>{item.title}</Text>
                <Text style={styles.materialMeta}>
                  {item.subject} • {item.level} • KES {item.price}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.downloadButton,
                  downloading[item.id] && styles.downloadButtonDisabled
                ]}
                onPress={() => downloadMaterial(item)}
                disabled={downloading[item.id]}
              >
                <Text style={styles.downloadButtonText}>
                  {downloading[item.id] ? '📥 Downloading...' : '📥 Download PDF'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Download Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Download Instructions:</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1</Text>
            <Text style={styles.instructionText}>
              Tap "Download PDF" for each material
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2</Text>
            <Text style={styles.instructionText}>
              Files will be saved to your device
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3</Text>
            <Text style={styles.instructionText}>
              Open with any PDF reader app
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4</Text>
            <Text style={styles.instructionText}>
              Access your materials offline anytime
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={shareReceipt}
          >
            <Text style={styles.shareButtonText}>📤 Share Receipt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeButtonText}>🏠 Back to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Support Info */}
        <View style={styles.supportContainer}>
          <Text style={styles.supportTitle}>Need Help?</Text>
          <Text style={styles.supportText}>
            If you have any issues with your downloads or need assistance, please contact our support team.
          </Text>
          <Text style={styles.supportContact}>
            📧 support@kasneb.com | 📞 +254 700 000 000
          </Text>
        </View>
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
    backgroundColor: '#4caf50',
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
  successContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  successIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  transactionContainer: {
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
  transactionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  transactionLabel: {
    fontSize: 14,
    color: '#666',
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  materialsContainer: {
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
  materialsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  materialItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 15,
  },
  materialInfo: {
    marginBottom: 10,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  materialMeta: {
    fontSize: 14,
    color: '#666',
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  actionsContainer: {
    padding: 15,
  },
  shareButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  supportContainer: {
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
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  supportContact: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default ReceiptScreen; 