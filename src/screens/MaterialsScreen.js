import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Card, Button, Text, Container } from '../components/ui';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import theme from '../config/theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - 45) / 2; // 45 = padding + margins

const MaterialsScreen = ({ navigation, route }) => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  

  const subjects = ['All', 'CPA', 'ATD', 'CS', 'CCP'];
  const levels = ['All', 'Foundation', 'Intermediate', 'Advanced'];

  // Real data loaded from Firestore (see loadMaterials)

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchQuery, selectedSubject, selectedLevel]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const materialsRef = collection(db, 'materials');
      const snapshot = await getDocs(materialsRef);
      const materialsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setMaterials(materialsData);
    } catch (error) {
      console.error('Error loading materials:', error);
      Alert.alert('Error', 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = [...materials];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by subject
    if (selectedSubject && selectedSubject !== 'All') {
      filtered = filtered.filter(material => material.subject === selectedSubject);
    }

    // Filter by level
    if (selectedLevel && selectedLevel !== 'All') {
      filtered = filtered.filter(material => material.level === selectedLevel);
    }

    setFilteredMaterials(filtered);
  };

  const addToCart = (material) => {
    // Navigate to Cart tab with the selected material
    navigation.navigate('Cart', { material });
  };

  

  const renderMaterialItem = ({ item }) => (
    <Card style={[styles.materialCard, { width: cardWidth }]}>
      <View style={styles.materialContent}>
        <View style={styles.materialHeader}>
          <Text variant="h6" color="textPrimary" style={styles.materialTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text variant="price" color="primary" style={styles.materialPrice}>
            KES {item.price}
          </Text>
        </View>
        
        <Text variant="bodySmall" color="textSecondary" style={styles.materialDescription} numberOfLines={3}>
          {item.description}
        </Text>
        
        <View style={styles.materialMeta}>
          <Text variant="caption" color="primary" style={styles.materialSubject}>
            {item.subject}
          </Text>
          <Text variant="caption" color="secondary" style={styles.materialLevel}>
            {item.level}
          </Text>
          {item.year && (
            <Text variant="caption" color="accent" style={styles.materialYear}>
              {item.year}
            </Text>
          )}
        </View>
        
        {Boolean(item.pages || item.fileSize) && (
          <View style={styles.materialDetails}>
            {item.pages ? (
              <Text variant="caption" color="textMuted" style={styles.materialDetail}>
                📄 {item.pages} pages
              </Text>
            ) : null}
            {item.fileSize ? (
              <Text variant="caption" color="textMuted" style={styles.materialDetail}>
                📁 {item.fileSize}
              </Text>
            ) : null}
          </View>
        )}
        
        <View style={styles.materialActions}>
          <Button
            title="🛒 Add to Cart"
            onPress={() => addToCart(item)}
            size="small"
            style={styles.addToCartButton}
          />
        </View>
      </View>
    </Card>
  );

  const renderFilterButton = (title, value, onPress) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        (selectedSubject === value || selectedLevel === value) && styles.filterButtonActive
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterButtonText,
        (selectedSubject === value || selectedLevel === value) && styles.filterButtonTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <Container style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="h5" color="textSecondary" style={styles.loadingText}>
          Loading materials...
        </Text>
      </Container>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
              {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" color="textInverse" style={styles.headerTitle}>
            Study Materials
          </Text>
          <Text variant="bodyLarge" color="textInverse" style={styles.headerSubtitle}>
            Browse and purchase KASNEB materials
          </Text>
          <View style={styles.headerStats}>
            <Text variant="caption" color="textInverse" style={styles.statText}>
              {filteredMaterials.length} materials available
            </Text>
          </View>
        </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search materials..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <Container style={styles.filtersContainer}>
        <Text variant="h5" color="textPrimary" style={styles.filtersTitle}>
          Filter by Subject:
        </Text>
        <View style={styles.filtersRow}>
          {subjects.map((subject) => (
            <View key={subject} style={styles.filterButtonContainer}>
              {renderFilterButton(
                subject,
                subject,
                () => setSelectedSubject(selectedSubject === subject ? '' : subject)
              )}
            </View>
          ))}
        </View>
        
        <Text variant="h5" color="textPrimary" style={styles.filtersTitle}>
          Filter by Level:
        </Text>
        <View style={styles.filtersRow}>
          {levels.map((level) => (
            <View key={level} style={styles.filterButtonContainer}>
              {renderFilterButton(
                level,
                level,
                () => setSelectedLevel(selectedLevel === level ? '' : level)
              )}
            </View>
          ))}
        </View>
      </Container>

      {/* Results Count */}
      <Container style={styles.resultsContainer}>
        <Text variant="body" color="textSecondary" style={styles.resultsText}>
          {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''} found
        </Text>
        <Button
          title="Sort"
          onPress={() => Alert.alert('Sort Options', 'Sort by: Price, Date, Title')}
          size="small"
          variant="secondary"
          style={styles.sortButton}
        />
      </Container>

      {/* Materials List */}
      <FlatList
        data={filteredMaterials}
        renderItem={renderMaterialItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
      />
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
  headerStats: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statText: {
    opacity: 0.8,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginTop: -theme.spacing.lg,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filtersContainer: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filtersTitle: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  filterButtonContainer: {
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  filterButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  filterButtonTextActive: {
    color: theme.colors.textInverse,
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    // Styling handled by Text component
  },
  sortButton: {
    // Styling handled by Button component
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  materialCard: {
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
  materialContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  materialHeader: {
    marginBottom: theme.spacing.md,
  },
  materialTitle: {
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
    lineHeight: 22,
  },
  materialPrice: {
    // Styling handled by Text component
  },
  materialDescription: {
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  materialMeta: {
    flexDirection: 'column',
    marginBottom: theme.spacing.md,
  },
  materialSubject: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  materialLevel: {
    backgroundColor: theme.colors.secondary + '15',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.secondary + '30',
  },
  materialYear: {
    backgroundColor: theme.colors.accent + '15',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.accent + '30',
  },
  materialDetails: {
    flexDirection: 'column',
    marginBottom: theme.spacing.sm,
  },
  materialDetail: {
    marginBottom: theme.spacing.xs,
  },
  materialActions: {
    // Styling handled by Button component
  },
  addToCartButton: {
    // Styling handled by Button component
  },
});

export default MaterialsScreen; 