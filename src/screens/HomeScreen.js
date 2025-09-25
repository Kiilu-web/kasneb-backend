import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { Card, Button, Text, Container } from '../components/ui';
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
        <Container style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="h5" color="textSecondary" style={styles.loadingText}>
            Loading...
          </Text>
        </Container>
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
          <Text variant="h1" color="textInverse" style={styles.headerTitle}>
            KASNEB MATERIALS
          </Text>
          <Text variant="bodyLarge" color="textInverse" style={styles.headerSubtitle}>
            Your gateway to professional success
          </Text>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text variant="h3" color="textInverse" style={styles.statNumber}>
                {featuredMaterials.length}
              </Text>
              <Text variant="caption" color="textInverse" style={styles.statLabel}>
                Materials
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="h3" color="textInverse" style={styles.statNumber}>
                {subjects.length}
              </Text>
              <Text variant="caption" color="textInverse" style={styles.statLabel}>
                Programs
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="h3" color="textInverse" style={styles.statNumber}>
                24/7
              </Text>
              <Text variant="caption" color="textInverse" style={styles.statLabel}>
                Access
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Card style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Materials')}
          >
            <Text style={styles.actionIcon}>📚</Text>
            <Text variant="h6" color="textPrimary" style={styles.actionText}>
              Browse Materials
            </Text>
            <Text variant="caption" color="textSecondary" style={styles.actionSubtext}>
              Find study materials
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.actionIcon}>🛒</Text>
            <Text variant="h6" color="textPrimary" style={styles.actionText}>
              View Cart
            </Text>
            <Text variant="caption" color="textSecondary" style={styles.actionSubtext}>
              Checkout items
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming Soon', 'Study planner feature will be available soon!')}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text variant="h6" color="textPrimary" style={styles.actionText}>
              Study Planner
            </Text>
            <Text variant="caption" color="textSecondary" style={styles.actionSubtext}>
              Plan your studies
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Subjects */}
        <Container style={styles.section}>
          <View style={styles.subjectsContainer}>
            {subjects.map((subject, index) => (
              <TouchableOpacity
                key={index}
                style={styles.subjectCard}
                onPress={() => navigation.navigate('Materials', { subject })}
              >
                <Text variant="h5" color="textPrimary" style={styles.subjectTitle}>
                  {subject}
                </Text>
                <Text variant="bodySmall" color="textSecondary" style={styles.subjectDescription}>
                  {getSubjectDescription(subject)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Container>

        {/* Featured Materials */}
        <Container style={styles.section}>
          {featuredMaterials.length === 0 ? (
            <Card style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📚</Text>
              <Text variant="h5" color="textPrimary" style={styles.emptyStateText}>
                No materials available yet
              </Text>
              <Text variant="body" color="textSecondary" style={styles.emptyStateSubtext}>
                Check back soon for new study materials
              </Text>
            </Card>
          ) : (
            <View style={styles.materialsGrid}>
              {featuredMaterials.map((material) => (
                <Card key={material.id} style={styles.materialCard}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Materials', { material })}
                    style={styles.materialCardContent}
                  >
                    <View style={styles.materialInfo}>
                      <Text variant="h6" color="textPrimary" style={styles.materialTitle} numberOfLines={2}>
                        {material.title}
                      </Text>
                      <Text variant="bodySmall" color="textSecondary" style={styles.materialDescription} numberOfLines={2}>
                        {material.description}
                      </Text>
                      <View style={styles.materialMeta}>
                        <Text variant="caption" color="primary" style={styles.materialSubject}>
                          {material.subject} - {material.level}
                        </Text>
                        {material.year && (
                          <Text variant="caption" color="textMuted" style={styles.materialYear}>
                            Year: {material.year}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.materialPrice}>
                      <Text variant="price" color="primary" style={styles.priceText}>
                        {formatCurrency(material.price)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          )}
        </Container>

        {/* Benefits */}
        <Container style={styles.section}>
          <Card style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text variant="body" color="textPrimary" style={styles.benefitText}>
                Official KASNEB Past Papers
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text variant="body" color="textPrimary" style={styles.benefitText}>
                Instant Download After Payment
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text variant="body" color="textPrimary" style={styles.benefitText}>
                Secure M-Pesa Payment
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text variant="body" color="textPrimary" style={styles.benefitText}>
                24/7 Access to Materials
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text variant="body" color="textPrimary" style={styles.benefitText}>
                Mobile-Friendly Interface
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text variant="body" color="textPrimary" style={styles.benefitText}>
                Regular Updates & New Content
              </Text>
            </View>
          </Card>
        </Container>

        {/* Contact Support */}
        <Container style={styles.section}>
          <Card style={styles.supportCard}>
            <Text variant="h4" color="textPrimary" style={styles.supportTitle}>
              Need Help?
            </Text>
            <Text variant="body" color="textSecondary" style={styles.supportText}>
              Our support team is here to help you succeed
            </Text>
            <Button
              title="Contact Support"
              onPress={() => Alert.alert('Contact Support', 'Email: support@kasneb.com\nPhone: +254 794483321')}
              style={styles.supportButton}
            />
          </Card>
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
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
    paddingTop: theme.spacing.xxxl + 20,
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
    marginBottom: theme.spacing.xl,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
  },
  statNumber: {
    marginBottom: theme.spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    opacity: 0.8,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginTop: -theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.xs,
  },
  actionIcon: {
    fontSize: 36,
    marginBottom: theme.spacing.md,
  },
  actionText: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  actionSubtext: {
    textAlign: 'center',
    fontSize: 12,
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  subjectCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    width: '48%',
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  subjectTitle: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontWeight: '700',
  },
  subjectDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  materialCard: {
    width: '48%',
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  materialCardContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  materialInfo: {
    marginBottom: theme.spacing.md,
  },
  materialTitle: {
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
    lineHeight: 22,
  },
  materialDescription: {
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  materialMeta: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  materialSubject: {
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.borderRadius.sm,
  },
  materialYear: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.borderRadius.sm,
  },
  materialPrice: {
    alignItems: 'flex-start',
    marginTop: theme.spacing.sm,
  },
  priceText: {
    fontWeight: '700',
  },
  benefitsContainer: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    marginTop: theme.spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: theme.spacing.lg,
    width: 30,
    textAlign: 'center',
  },
  benefitText: {
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.sm,
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
  supportCard: {
    alignItems: 'center',
  },
  supportTitle: {
    marginBottom: theme.spacing.sm,
  },
  supportText: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  supportButton: {
    // Button styling handled by Button component
  },
});

export default HomeScreen; 