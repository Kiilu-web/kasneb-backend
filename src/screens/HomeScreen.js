import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import theme from '../config/theme';

const db = getFirestore();
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isLargeDevice = width > 768;

const HomeScreen = ({ navigation }) => {
  const [featuredMaterials, setFeaturedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured materials (latest 6 materials)
      const materialsQuery = query(
        collection(db, 'materials'), 
        orderBy('createdAt', 'desc'), 
        limit(6)
      );
      const materialsSnapshot = await getDocs(materialsQuery);
      const materials = [];
      materialsSnapshot.forEach(doc => {
        materials.push({ id: doc.id, ...doc.data() });
      });
      setFeaturedMaterials(materials);

      // Get unique subjects from materials
      const uniqueSubjects = [...new Set(materials.map(m => m.subject))];
      setSubjects(uniqueSubjects.length > 0 ? uniqueSubjects : ['CPA', 'ATD', 'CS', 'CCP']);

    } catch (error) {
      console.error('Error fetching home data:', error);
      // Fallback to demo data if fetch fails
      setFeaturedMaterials([
        {
          id: '1',
          title: 'CPA Foundation Level',
          description: 'Complete past papers and study materials',
          price: 500,
          subject: 'CPA',
          level: 'Foundation',
        },
        {
          id: '2',
          title: 'ATD Intermediate Level',
          description: 'Accounting Technicians Diploma materials',
          price: 750,
          subject: 'ATD',
          level: 'Intermediate',
        },
        {
          id: '3',
          title: 'CS Advanced Level',
          description: 'Certified Secretaries study materials',
          price: 1000,
          subject: 'CS',
          level: 'Advanced',
        },
      ]);
      setSubjects(['CPA', 'ATD', 'CS', 'CCP']);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount || 0);
  };

  const getSubjectDescription = (subject) => {
    const descriptions = {
      'CPA': 'Certified Public Accountants',
      'ATD': 'Accounting Technicians Diploma',
      'CS': 'Certified Secretaries',
      'CCP': 'Certified Credit Professionals',
    };
    return descriptions[subject] || `${subject} Study Materials`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>KASNEB MATERIALS</Text>
          <Text style={styles.headerSubtitle}>Your gateway to professional success</Text>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{featuredMaterials.length}</Text>
              <Text style={styles.statLabel}>Materials</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{subjects.length}</Text>
              <Text style={styles.statLabel}>Programs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Access</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Materials')}
          >
            <Text style={styles.actionIcon}>📚</Text>
            <Text style={styles.actionText}>Browse Materials</Text>
            <Text style={styles.actionSubtext}>Find study materials</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.actionIcon}>🛒</Text>
            <Text style={styles.actionText}>View Cart</Text>
            <Text style={styles.actionSubtext}>Checkout items</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming Soon', 'Study planner feature will be available soon!')}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>Study Planner</Text>
            <Text style={styles.actionSubtext}>Plan your studies</Text>
          </TouchableOpacity>
        </View>

        {/* Subjects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Programs</Text>
          <View style={styles.subjectsContainer}>
            {subjects.map((subject, index) => (
              <TouchableOpacity
                key={index}
                style={styles.subjectCard}
                onPress={() => navigation.navigate('Materials', { subject })}
              >
                <Text style={styles.subjectTitle}>{subject}</Text>
                <Text style={styles.subjectDescription}>
                  {getSubjectDescription(subject)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Materials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Materials</Text>
          {featuredMaterials.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📚</Text>
              <Text style={styles.emptyStateText}>No materials available yet</Text>
              <Text style={styles.emptyStateSubtext}>Check back soon for new study materials</Text>
            </View>
          ) : (
            featuredMaterials.map((material) => (
              <TouchableOpacity
                key={material.id}
                style={styles.materialCard}
                onPress={() => navigation.navigate('Materials', { material })}
              >
                <View style={styles.materialInfo}>
                  <Text style={styles.materialTitle} numberOfLines={2}>
                    {material.title}
                  </Text>
                  <Text style={styles.materialDescription} numberOfLines={2}>
                    {material.description}
                  </Text>
                  <View style={styles.materialMeta}>
                    <Text style={styles.materialSubject}>
                      {material.subject} - {material.level}
                    </Text>
                    {material.year && (
                      <Text style={styles.materialYear}>Year: {material.year}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.materialPrice}>
                  <Text style={styles.priceText}>{formatCurrency(material.price)}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Our Materials?</Text>
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Official KASNEB Past Papers</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Instant Download After Payment</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Secure M-Pesa Payment</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>24/7 Access to Materials</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Mobile-Friendly Interface</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Regular Updates & New Content</Text>
            </View>
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <View style={styles.supportCard}>
            <Text style={styles.supportTitle}>Need Help?</Text>
            <Text style={styles.supportText}>Our support team is here to help you succeed</Text>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => Alert.alert('Contact Support', 'Email: support@kasneb.com\nPhone: +254 794483321')}
            >
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    padding: isSmallDevice ? 15 : isLargeDevice ? 30 : 20,
    paddingTop: isSmallDevice ? 30 : isLargeDevice ? 50 : 40,
  },
  headerTitle: {
    fontSize: isSmallDevice ? 26 : isLargeDevice ? 36 : 30,
    fontWeight: '900',
    color: theme.colors.textInverse,
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: isSmallDevice ? 16 : isLargeDevice ? 20 : 18,
    fontWeight: '600',
    color: theme.colors.textInverse,
    textAlign: 'center',
    opacity: 0.9,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: isSmallDevice ? 24 : isLargeDevice ? 28 : 26,
    fontWeight: '800',
    color: theme.colors.textInverse,
  },
  statLabel: {
    fontSize: isSmallDevice ? 14 : isLargeDevice ? 16 : 15,
    fontWeight: '600',
    color: theme.colors.textInverse,
    opacity: 0.8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: isSmallDevice ? 15 : isLargeDevice ? 25 : 20,
    backgroundColor: theme.colors.surface,
    margin: isSmallDevice ? 10 : isLargeDevice ? 20 : 15,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    padding: isSmallDevice ? 15 : isLargeDevice ? 20 : 18,
  },
  actionIcon: {
    fontSize: isSmallDevice ? 30 : isLargeDevice ? 40 : 35,
    marginBottom: isSmallDevice ? 8 : isLargeDevice ? 12 : 10,
  },
  actionText: {
    fontSize: isSmallDevice ? 16 : isLargeDevice ? 18 : 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  actionSubtext: {
    fontSize: isSmallDevice ? 13 : isLargeDevice ? 14 : 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
    padding: isSmallDevice ? 15 : isLargeDevice ? 25 : 20,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 22 : isLargeDevice ? 28 : 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: isSmallDevice ? 15 : isLargeDevice ? 20 : 18,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subjectCard: {
    backgroundColor: theme.colors.surface,
    padding: isSmallDevice ? 15 : isLargeDevice ? 20 : 18,
    borderRadius: theme.borderRadius.lg,
    width: isSmallDevice ? '48%' : isLargeDevice ? '23%' : '48%',
    marginBottom: isSmallDevice ? 10 : isLargeDevice ? 15 : 12,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  subjectTitle: {
    fontSize: isSmallDevice ? 18 : isLargeDevice ? 20 : 19,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: isSmallDevice ? 5 : isLargeDevice ? 8 : 6,
    textAlign: 'center',
  },
  subjectDescription: {
    fontSize: isSmallDevice ? 13 : isLargeDevice ? 15 : 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 16 : isLargeDevice ? 18 : 17,
  },
  materialCard: {
    backgroundColor: theme.colors.surface,
    padding: isSmallDevice ? 15 : isLargeDevice ? 20 : 18,
    borderRadius: theme.borderRadius.lg,
    marginBottom: isSmallDevice ? 10 : isLargeDevice ? 15 : 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  materialInfo: {
    flex: 1,
    marginRight: isSmallDevice ? 10 : isLargeDevice ? 15 : 12,
  },
  materialTitle: {
    fontSize: isSmallDevice ? 18 : isLargeDevice ? 20 : 19,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: isSmallDevice ? 4 : isLargeDevice ? 6 : 5,
    lineHeight: isSmallDevice ? 22 : isLargeDevice ? 24 : 23,
  },
  materialDescription: {
    fontSize: isSmallDevice ? 15 : isLargeDevice ? 16 : 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: isSmallDevice ? 6 : isLargeDevice ? 8 : 7,
    lineHeight: isSmallDevice ? 18 : isLargeDevice ? 20 : 19,
  },
  materialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialSubject: {
    fontSize: isSmallDevice ? 13 : isLargeDevice ? 14 : 13,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  materialYear: {
    fontSize: isSmallDevice ? 13 : isLargeDevice ? 14 : 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginLeft: 5,
  },
  materialPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: isSmallDevice ? 18 : isLargeDevice ? 20 : 19,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  benefitsContainer: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  benefitText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: isSmallDevice ? 18 : isLargeDevice ? 20 : 19,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: isSmallDevice ? 20 : isLargeDevice ? 30 : 25,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginTop: 15,
    ...theme.shadows.sm,
  },
  emptyStateIcon: {
    fontSize: isSmallDevice ? 40 : isLargeDevice ? 60 : 50,
    marginBottom: isSmallDevice ? 10 : isLargeDevice ? 15 : 12,
  },
  emptyStateText: {
    fontSize: isSmallDevice ? 18 : isLargeDevice ? 20 : 19,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: isSmallDevice ? 5 : isLargeDevice ? 8 : 6,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: isSmallDevice ? 15 : isLargeDevice ? 16 : 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 18 : isLargeDevice ? 20 : 19,
  },
  supportCard: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  supportButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
  },
  supportButtonText: {
    color: theme.colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default HomeScreen; 