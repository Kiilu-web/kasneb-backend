import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '../config/firebase';
import { auth } from '../config/firebase';

const UploadMaterialScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [price, setPrice] = useState('');
  const [year, setYear] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const subjects = ['CPA', 'ATD', 'CS', 'CCP'];
  const levels = ['Foundation', 'Intermediate', 'Advanced'];

  // Check Firebase Storage permissions
  const checkStoragePermissions = async () => {
    try {
      console.log('Checking Firebase Storage permissions...');
      const testRef = ref(storage, 'test-permissions');
      await listAll(testRef);
      console.log('Storage permissions OK');
      return true;
    } catch (error) {
      console.error('Storage permission check failed:', error);
      return false;
    }
  };

  // Test Firebase Storage configuration
  const testStorageConnection = async () => {
    try {
      console.log('Testing Firebase Storage connection...');
      console.log('Storage bucket:', storage.app.options.storageBucket);
      
      // Try to create a simple test file
      const testRef = ref(storage, 'test-connection.txt');
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      
      console.log('Attempting test upload...');
      await uploadBytes(testRef, testBlob);
      console.log('Test upload successful');
      
      // Clean up test file
      // Note: We can't delete in client-side, but that's OK for testing
      
      return true;
    } catch (error) {
      console.error('Storage connection test failed:', error);
      return false;
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select a file smaller than 50MB.');
        return;
      }

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        Alert.alert('Invalid File Type', 'Please select a PDF file.');
        return;
      }

      setSelectedFile(file);
      console.log('File selected:', file.name, 'Size:', file.size);
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const uploadMaterial = async () => {
    // Validate all required fields
    if (!title.trim() || !description.trim() || !subject || !level || !price || !year || !selectedFile) {
      Alert.alert('Missing Information', 'Please fill in all fields and select a PDF file.');
      return;
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }

    setUploading(true);

    try {
      console.log('Starting upload process...');
      console.log('Storage bucket:', storage.app.options.storageBucket);
      console.log('Current user:', auth.currentUser?.email);
      console.log('User authenticated:', !!auth.currentUser);
      
      // Create a unique filename
      const timestamp = Date.now();
      const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedFileName}`;
      
      console.log('Uploading file:', fileName);
      
      // Create storage reference
      const storageRef = ref(storage, `materials/${fileName}`);
      console.log('Storage reference created:', storageRef.fullPath);
      
      // Fetch the file and convert to blob
      console.log('Fetching file from URI:', selectedFile.uri);
      const response = await fetch(selectedFile.uri);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('File blob created, size:', blob.size);
      
      // Upload to Firebase Storage
      console.log('Uploading to Firebase Storage...');
      const uploadResult = await uploadBytes(storageRef, blob, {
        contentType: 'application/pdf',
        cacheControl: 'public, max-age=31536000',
      });
      
      console.log('Upload successful, getting download URL...');
      
      // Get download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('Download URL obtained:', downloadURL);

      // Save material data to Firestore
      console.log('Saving to Firestore...');
      const materialData = {
        title: title.trim(),
        description: description.trim(),
        subject,
        level,
        price: parseFloat(price),
        year: year.trim(),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        filePath: `materials/${fileName}`,
        downloadURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'materials'), materialData);
      console.log('Material saved to Firestore with ID:', docRef.id);

      Alert.alert(
        'Success',
        'Material uploaded successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Upload error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMessage = 'Failed to upload material. Please try again.';
      
      // Handle specific Firebase Storage errors
      if (error.code === 'storage/unauthorized' || error.message === 'storage/unauthorized') {
        errorMessage = 'Upload failed: Unauthorized. Please check your Firebase Storage permissions.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage = 'Upload failed: Storage quota exceeded.';
      } else if (error.code === 'storage/retry-limit-exceeded') {
        errorMessage = 'Upload failed: Network error. Please check your connection and try again.';
      } else if (error.code === 'storage/invalid-checksum') {
        errorMessage = 'Upload failed: File corruption detected. Please try again.';
      } else if (error.message && error.message.includes('fetch')) {
        errorMessage = 'Upload failed: Could not read the selected file. Please try selecting the file again.';
      } else if (error.code === 'storage/unknown') {
        errorMessage = 'Upload failed: Storage rules issue. Please check Firebase Storage security rules.';
      }
      
      Alert.alert('Upload Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setLevel('');
    setPrice('');
    setYear('');
    setSelectedFile(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Upload Material</Text>
          <Text style={styles.headerSubtitle}>Add new KASNEB study materials</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Material Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., CPA Foundation - Financial Accounting"
              value={title}
              onChangeText={setTitle}
              editable={!uploading}
            />
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the material content..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              editable={!uploading}
            />
          </View>

          {/* Subject */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Subject *</Text>
            <View style={styles.pickerContainer}>
              {subjects.map((subj) => (
                <TouchableOpacity
                  key={subj}
                  style={[
                    styles.pickerOption,
                    subject === subj && styles.pickerOptionSelected
                  ]}
                  onPress={() => setSubject(subj)}
                  disabled={uploading}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    subject === subj && styles.pickerOptionTextSelected
                  ]}>
                    {subj}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Level */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Level *</Text>
            <View style={styles.pickerContainer}>
              {levels.map((lev) => (
                <TouchableOpacity
                  key={lev}
                  style={[
                    styles.pickerOption,
                    level === lev && styles.pickerOptionSelected
                  ]}
                  onPress={() => setLevel(lev)}
                  disabled={uploading}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    level === lev && styles.pickerOptionTextSelected
                  ]}>
                    {lev}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price and Year */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Price (KES) *</Text>
              <TextInput
                style={styles.input}
                placeholder="500"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                editable={!uploading}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Year *</Text>
              <TextInput
                style={styles.input}
                placeholder="2023"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                editable={!uploading}
              />
            </View>
          </View>

          {/* File Upload */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>PDF File *</Text>
            <TouchableOpacity
              style={styles.fileUploadButton}
              onPress={pickDocument}
              disabled={uploading}
            >
              <Text style={styles.fileUploadIcon}>📁</Text>
              <Text style={styles.fileUploadText}>
                {selectedFile ? 'Change File' : 'Select PDF File'}
              </Text>
            </TouchableOpacity>
            
            {selectedFile && (
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{selectedFile.name}</Text>
                <Text style={styles.fileSize}>{formatFileSize(selectedFile.size)}</Text>
              </View>
            )}
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={uploadMaterial}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.uploadButtonText}>📤 Upload Material</Text>
            )}
          </TouchableOpacity>

          {/* Reset Button */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetForm}
            disabled={uploading}
          >
            <Text style={styles.resetButtonText}>🔄 Reset Form</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Upload Guidelines:</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1</Text>
            <Text style={styles.instructionText}>
              Ensure the PDF is clear and readable
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2</Text>
            <Text style={styles.instructionText}>
              File size should be less than 50MB
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3</Text>
            <Text style={styles.instructionText}>
              Provide accurate title and description
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4</Text>
            <Text style={styles.instructionText}>
              Set appropriate pricing for the material
            </Text>
          </View>
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
  formContainer: {
    padding: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  pickerOptionSelected: {
    backgroundColor: '#007AFF',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: 'white',
  },
  fileUploadButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fileUploadIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  fileUploadText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  fileInfo: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#1976d2',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
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
});

export default UploadMaterialScreen; 