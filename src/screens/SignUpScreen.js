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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore();
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isLargeDevice = width > 768;

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      console.log('User signed up:', user);
      // Save user info to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: email.trim(),
        phone: phone.trim(),
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Account created successfully!');
      // Navigation will be handled automatically by the App.js auth state listener
    } catch (error) {
      let errorMessage = 'Sign up failed. Please try again.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        default:
          errorMessage = 'Sign up failed. Please try again.';
      }
      Alert.alert('Sign Up Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAccess = () => {
    navigation.navigate('AdminLogin');
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
            <View style={styles.header}>
              {/* Hidden Admin Access Area - Top Right Corner */}
              <TouchableOpacity
                style={styles.hiddenAdminArea}
                onPress={handleAdminAccess}
                activeOpacity={1}
              />
              
              <Text style={styles.logo}>📚</Text>
              <Text style={styles.title}>KASNEB</Text>
              <Text style={styles.subtitle}>Create a new account</Text>
            </View>
            
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Sign Up</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  maxLength={15}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
              
              <TouchableOpacity
                style={[styles.signupButton, loading && styles.signupButtonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>Already have an account? Log In</Text>
              </TouchableOpacity>
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
    backgroundColor: '#f8f9fa' 
  },
  keyboardView: { 
    flex: 1 
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
    position: 'relative',
  },
  // Hidden admin access area - positioned in top right corner of header
  hiddenAdminArea: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  logo: { 
    fontSize: isSmallDevice ? 60 : isLargeDevice ? 100 : 80, 
    marginBottom: isSmallDevice ? 15 : 20 
  },
  title: { 
    fontSize: isSmallDevice ? 24 : isLargeDevice ? 32 : 28, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 5 
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
    textAlign: 'center' 
  },
  inputContainer: { 
    marginBottom: isSmallDevice ? 15 : 20 
  },
  inputLabel: { 
    fontSize: isSmallDevice ? 13 : isLargeDevice ? 15 : 14, 
    fontWeight: '600', 
    color: '#333', 
    marginBottom: 8 
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
  signupButton: { 
    backgroundColor: '#007AFF', 
    padding: isSmallDevice ? 12 : 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 15,
    minHeight: isSmallDevice ? 45 : 50,
    justifyContent: 'center',
  },
  signupButtonDisabled: { 
    backgroundColor: '#ccc' 
  },
  signupButtonText: { 
    color: 'white', 
    fontSize: isSmallDevice ? 15 : isLargeDevice ? 17 : 16, 
    fontWeight: 'bold' 
  },
  loginButton: { 
    padding: isSmallDevice ? 12 : 15, 
    alignItems: 'center' 
  },
  loginButtonText: { 
    color: '#007AFF', 
    fontSize: isSmallDevice ? 13 : isLargeDevice ? 15 : 14, 
    fontWeight: '600' 
  },
});

export default SignUpScreen; 