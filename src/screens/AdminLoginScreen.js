import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isLargeDevice = width > 768;

const AdminLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Navigation will be handled automatically by the App.js auth state listener
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = 'Login failed. Please check your credentials and try again.';
      }
      
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>📚</Text>
              <Text style={styles.title}>KASNEB Admin</Text>
              <Text style={styles.subtitle}>Study Materials Management</Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Admin Login</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter admin email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Secure admin access for KASNEB study materials management
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: height,
  },
  content: {
    flex: 1,
    padding: isSmallDevice ? 15 : isLargeDevice ? 40 : 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: isSmallDevice ? 20 : 40,
    marginBottom: isSmallDevice ? 30 : 40,
  },
  logo: {
    fontSize: isSmallDevice ? 60 : isLargeDevice ? 100 : 80,
    marginBottom: isSmallDevice ? 15 : 20,
  },
  title: {
    fontSize: isSmallDevice ? 24 : isLargeDevice ? 32 : 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : isLargeDevice ? 18 : 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: isSmallDevice ? 20 : isLargeDevice ? 35 : 25,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
    maxWidth: isLargeDevice ? 400 : undefined,
    alignSelf: isLargeDevice ? 'center' : 'stretch',
    width: isLargeDevice ? '100%' : undefined,
  },
  formTitle: {
    fontSize: isSmallDevice ? 18 : isLargeDevice ? 22 : 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: isSmallDevice ? 20 : 25,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: isSmallDevice ? 15 : 20,
  },
  inputLabel: {
    fontSize: isSmallDevice ? 13 : isLargeDevice ? 15 : 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: isSmallDevice ? 12 : 15,
    fontSize: isSmallDevice ? 15 : 16,
    minHeight: isSmallDevice ? 45 : 50,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: isSmallDevice ? 12 : 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    minHeight: isSmallDevice ? 45 : 50,
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: isSmallDevice ? 15 : isLargeDevice ? 17 : 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: isSmallDevice ? 15 : 20,
  },
  footerText: {
    fontSize: isSmallDevice ? 11 : isLargeDevice ? 13 : 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default AdminLoginScreen; 