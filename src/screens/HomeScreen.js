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
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Study Programs
          </Text>
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
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Latest Materials
          </Text>
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
          <Text variant="h3" color="textPrimary" style={styles.sectionTitle}>
            Why Choose Our Materials?
          </Text>
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
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    opacity: 0.8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    padding: theme.spacing.md,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  actionText: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  actionSubtext: {
    textAlign: 'center',
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.lg,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subjectCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    width: '48%',
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  subjectTitle: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subjectDescription: {
    textAlign: 'center',
  },
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  materialCard: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  materialCardContent: {
    flex: 1,
  },
  materialInfo: {
    marginBottom: theme.spacing.sm,
  },
  materialTitle: {
    marginBottom: theme.spacing.xs,
  },
  materialDescription: {
    marginBottom: theme.spacing.sm,
  },
  materialMeta: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  materialSubject: {
    marginBottom: theme.spacing.xs,
  },
  materialYear: {
    // Styling handled by Text component
  },
  materialPrice: {
    alignItems: 'flex-start',
  },
  priceText: {
    // Price styling handled by Text component
  },
  benefitsContainer: {
    padding: theme.spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  benefitText: {
    flex: 1,
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
    padding: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyStateText: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    textAlign: 'center',
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