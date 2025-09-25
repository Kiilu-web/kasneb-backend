import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Card, Button, Text, Container } from '../components/ui';
import { auth } from '../config/firebase';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system/legacy';
import * as WebBrowser from 'expo-web-browser';
import { signOut } from 'firebase/auth';
import theme from '../config/theme';

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
      console.log('🔍 Fetching purchases for user:', user?.uid);
      
      if (user) {
        // Fetch purchases from the purchases collection
        const q = query(collection(db, 'purchases'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const items = [];
        snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
        
        console.log('📦 Found purchases:', items.length, items);
        
        // Sort purchases by date (newest first)
        items.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.purchaseDate);
          const dateB = new Date(b.createdAt || b.purchaseDate);
          return dateB - dateA;
        });
        
        setPurchases(items);
        console.log('✅ Purchases set:', items.length);
      } else {
        console.log('❌ No user found');
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
      <Container style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="h5" color="textSecondary" style={styles.loadingText}>
          Loading Profile...
        </Text>
      </Container>
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
            <Text variant="h2" color="textInverse" style={styles.headerTitle}>
              Profile
            </Text>
            <Text variant="bodyLarge" color="textInverse" style={styles.headerSubtitle}>
              Manage your account
            </Text>
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
        <Card style={styles.profileContainer}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text variant="h3" color="textInverse" style={styles.avatarText}>
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
                  <Text variant="body" color="textSecondary" style={styles.profileEmail}>
                    {userProfile?.email}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={editPhone}
                    onChangeText={setEditPhone}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                  />
                  <Button
                    title={saving ? 'Saving...' : 'Save'}
                    onPress={handleSave}
                    disabled={saving}
                    loading={saving}
                    style={styles.saveButton}
                  />
                </>
              ) : (
                <>
                  <Text variant="h4" color="textPrimary" style={styles.profileName}>
                    {userProfile?.name || 'User'}
                  </Text>
                  <Text variant="body" color="textSecondary" style={styles.profileEmail}>
                    {userProfile?.email}
                  </Text>
                  <Text variant="body" color="textSecondary" style={styles.profilePhone}>
                    {userProfile?.phone}
                  </Text>
                  <Button
                    title="Edit Profile"
                    onPress={handleEdit}
                    variant="outline"
                    style={styles.editButton}
                  />
                </>
              )}
            </View>
          </View>
        </Card>

        {/* User Statistics */}
        <Card style={styles.statsContainer}>
          <Text variant="h4" color="textPrimary" style={styles.sectionTitle}>
            My Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📚</Text>
              <Text variant="h3" color="textPrimary" style={styles.statValue}>
                {purchases.length}
              </Text>
              <Text variant="caption" color="textSecondary" style={styles.statLabel}>
                Total Purchases
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💰</Text>
              <Text variant="h3" color="textPrimary" style={styles.statValue}>
                {formatCurrency(purchases.reduce((sum, purchase) => sum + (purchase.amount || purchase.price || 0), 0))}
              </Text>
              <Text variant="caption" color="textSecondary" style={styles.statLabel}>
                Total Spent
              </Text>
            </View>
          </View>
        </Card>

        {/* Purchased Materials */}
        <Card style={styles.purchasesContainer}>
          <Text variant="h4" color="textPrimary" style={styles.sectionTitle}>
            My Purchased Materials
          </Text>
          {purchases.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📚</Text>
              <Text variant="h5" color="textPrimary" style={styles.emptyStateText}>
                No purchases yet
              </Text>
              <Text variant="body" color="textSecondary" style={styles.emptyStateSubtext}>
                Your purchased materials will appear here
              </Text>
            </View>
          ) : (
            purchases.map((material) => (
              <Card key={material.id} style={styles.purchaseItem}>
                <View style={styles.purchaseInfo}>
                  <Text variant="h6" color="textPrimary" style={styles.purchaseTitle}>
                    {material.materialTitle || material.title || 'Unknown Material'}
                  </Text>
                  <Text variant="caption" color="primary" style={styles.purchaseSubject}>
                    {material.subject && material.level ? `${material.subject} - ${material.level}` : 'Subject not specified'}
                  </Text>
                  {material.year && (
                    <Text variant="caption" color="accent" style={styles.purchaseYear}>
                      Year: {material.year}
                    </Text>
                  )}
                  <Text variant="caption" color="textMuted" style={styles.purchaseDate}>
                    Purchased: {formatDate(material.createdAt || material.purchaseDate)}
                  </Text>
                  {material.fileSize && (
                    <Text variant="caption" color="textMuted" style={styles.purchaseFileSize}>
                      File size: {formatFileSize(material.fileSize)}
                    </Text>
                  )}
                </View>
                <View style={styles.purchaseActions}>
                  <Text variant="price" color="primary" style={styles.purchaseAmount}>
                    {formatCurrency(material.amount || material.price)}
                  </Text>
                  {material.downloadURL && (
                    <Button
                      title={downloading[material.id] ? '📥 Downloading...' : '📥 Download PDF'}
                      onPress={() => downloadMaterial(material)}
                      disabled={downloading[material.id]}
                      loading={downloading[material.id]}
                      size="small"
                      style={styles.downloadButton}
                    />
                  )}
                </View>
              </Card>
            ))
          )}
        </Card>

        {/* Logout Button */}
        <Container style={styles.logoutContainer}>
          <Button
            title="🚪 Logout"
            onPress={handleLogout}
            variant="secondary"
            style={styles.logoutButton}
          />
        </Container>

        {/* App Version */}
        <Container style={styles.versionContainer}>
          <Text variant="caption" color="textMuted" style={styles.versionText}>
            KASNEB Study Materials v1.0.0
          </Text>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.sm,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
    paddingTop: theme.spacing.xxxl + 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: theme.spacing.lg,
  },
  refreshButton: {
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.full,
  },
  refreshButtonText: {
    fontSize: 24,
    color: theme.colors.textInverse,
  },
  profileContainer: {
    marginHorizontal: theme.spacing.lg,
    marginTop: -theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    // Styling handled by Text component
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    marginBottom: theme.spacing.sm,
    fontWeight: '700',
  },
  profileEmail: {
    marginBottom: theme.spacing.sm,
  },
  profilePhone: {
    // Styling handled by Text component
  },
  statsContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 36,
    marginBottom: theme.spacing.md,
  },
  statValue: {
    marginBottom: theme.spacing.sm,
    fontWeight: '700',
  },
  statLabel: {
    textAlign: 'center',
    fontWeight: '500',
  },
  purchasesContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  purchaseItem: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  purchaseInfo: {
    marginBottom: theme.spacing.md,
  },
  purchaseTitle: {
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
    lineHeight: 22,
  },
  purchaseSubject: {
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  purchaseYear: {
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.accent + '15',
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.accent + '30',
  },
  purchaseDate: {
    // Styling handled by Text component
  },
  purchaseFileSize: {
    marginTop: theme.spacing.sm,
  },
  purchaseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  purchaseAmount: {
    // Styling handled by Text component
  },
  downloadButton: {
    // Styling handled by Button component
  },
  logoutContainer: {
    padding: theme.spacing.md,
  },
  logoutButton: {
    // Styling handled by Button component
  },
  versionContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  versionText: {
    // Styling handled by Text component
  },
  input: {
    borderWidth: 2,
    borderColor: theme.colors.lightGray,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    fontSize: 16,
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButton: {
    // Styling handled by Button component
  },
  editButton: {
    // Styling handled by Button component
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xxxl,
    marginTop: theme.spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: theme.spacing.xl,
    opacity: 0.6,
  },
  emptyStateText: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProfileScreen; 