import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { auth } from '../config/firebase';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system/legacy';
import * as WebBrowser from 'expo-web-browser';
import { signOut } from 'firebase/auth';

const db = getFirestore();

const ProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [downloading, setDownloading] = useState({});

  const fetchUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
          setEditName(userDoc.data().name || '');
          setEditPhone(userDoc.data().phone || '');
        } else {
          setUserProfile({ email: user.email, phone: '', name: '' });
          setEditName('');
          setEditPhone('');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchases = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Fetch purchases from the purchases collection
        const q = query(collection(db, 'purchases'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const items = [];
        snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
        
        // Sort purchases by date (newest first)
        items.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.purchaseDate);
          const dateB = new Date(b.createdAt || b.purchaseDate);
          return dateB - dateA;
        });
        
        setPurchases(items);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      // Don't show alert for purchases error as it's not critical
    }
  };

  const refreshProfile = async () => {
    setRefreshing(true);
    await Promise.all([fetchUserProfile(), fetchPurchases()]);
    setRefreshing(false);
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      Alert.alert('Error', 'Name and phone cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          name: editName.trim(),
          phone: editPhone.trim(),
        });
        setUserProfile(prev => ({ ...prev, name: editName.trim(), phone: editPhone.trim() }));
        setEditing(false);
        Alert.alert('Success', 'Profile updated!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const downloadMaterial = async (material) => {
    setDownloading(prev => ({ ...prev, [material.id]: true }));
    try {
      // Open PDF directly from downloadURL to avoid file URI issues
      if (material.downloadURL) {
        await WebBrowser.openBrowserAsync(material.downloadURL);
      } else {
        Alert.alert('Download Failed', 'No download URL available for this material.');
      }
    } catch (error) {
      Alert.alert('Download Failed', 'There was an error opening the file.');
    } finally {
      setDownloading(prev => ({ ...prev, [material.id]: false }));
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              // Let the auth state change handle navigation automatically
              // The App.js useEffect will detect the signOut and redirect to auth screens
            } catch (error) {
              Alert.alert('Error', 'Failed to log out.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshProfile}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your account</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshProfile}
            disabled={refreshing}
          >
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileContainer}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile?.email?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              {editing ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Name"
                  />
                  <Text style={styles.profileEmail}>{userProfile?.email}</Text>
                  <TextInput
                    style={styles.input}
                    value={editPhone}
                    onChangeText={setEditPhone}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                  />
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.profileName}>{userProfile?.name || 'User'}</Text>
                  <Text style={styles.profileEmail}>{userProfile?.email}</Text>
                  <Text style={styles.profilePhone}>{userProfile?.phone}</Text>
                  <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {/* User Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>My Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📚</Text>
              <Text style={styles.statValue}>{purchases.length}</Text>
              <Text style={styles.statLabel}>Total Purchases</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statValue}>
                {formatCurrency(purchases.reduce((sum, purchase) => sum + (purchase.amount || purchase.price || 0), 0))}
              </Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>
        </View>

        {/* Purchased Materials */}
        <View style={styles.purchasesContainer}>
          <Text style={styles.sectionTitle}>My Purchased Materials</Text>
          {purchases.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📚</Text>
              <Text style={styles.emptyStateText}>No purchases yet</Text>
              <Text style={styles.emptyStateSubtext}>Your purchased materials will appear here</Text>
            </View>
          ) : (
            purchases.map((material) => (
              <View key={material.id} style={styles.purchaseItem}>
                <View style={styles.purchaseInfo}>
                  <Text style={styles.purchaseTitle}>
                    {material.materialTitle || material.title || 'Unknown Material'}
                  </Text>
                  <Text style={styles.purchaseSubject}>
                    {material.subject && material.level ? `${material.subject} - ${material.level}` : 'Subject not specified'}
                  </Text>
                  {material.year && (
                    <Text style={styles.purchaseYear}>Year: {material.year}</Text>
                  )}
                  <Text style={styles.purchaseDate}>
                    Purchased: {formatDate(material.createdAt || material.purchaseDate)}
                  </Text>
                  {material.fileSize && (
                    <Text style={styles.purchaseFileSize}>
                      File size: {formatFileSize(material.fileSize)}
                    </Text>
                  )}
                </View>
                <View style={styles.purchaseActions}>
                  <Text style={styles.purchaseAmount}>
                    {formatCurrency(material.amount || material.price)}
                  </Text>
                  {material.downloadURL && (
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => downloadMaterial(material)}
                      disabled={downloading[material.id]}
                    >
                      <Text style={styles.downloadButtonText}>
                        {downloading[material.id] ? '📥 Downloading...' : '📥 Download PDF'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>KASNEB Study Materials v1.0.0</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
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
  refreshButton: {
    padding: 10,
  },
  refreshButtonText: {
    fontSize: 24,
    color: 'white',
  },
  profileContainer: {
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    padding: 15,
  },
  statIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  purchasesContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  purchaseItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 15,
  },
  purchaseInfo: {
    marginBottom: 10,
  },
  purchaseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  purchaseSubject: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  purchaseYear: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  purchaseDate: {
    fontSize: 12,
    color: '#666',
  },
  purchaseFileSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  purchaseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  purchaseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuTitle: {
    fontSize: 16,
    color: '#333',
  },
  menuArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  logoutContainer: {
    padding: 15,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  emptyStateIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProfileScreen; 