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
  ScrollView,
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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
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
          scrollEnabled={false}
      />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
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
    marginBottom: theme.spacing.md,
  },
  headerStats: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statText: {
    opacity: 0.8,
  },
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  searchInput: {
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    fontSize: 16,
  },
  filtersContainer: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  filtersTitle: {
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  filterButtonContainer: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  filterButton: {
    backgroundColor: theme.colors.lightGray,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
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
    padding: theme.spacing.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  materialCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  materialContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  materialHeader: {
    marginBottom: theme.spacing.sm,
  },
  materialTitle: {
    marginBottom: theme.spacing.xs,
    fontSize: 14,
  },
  materialPrice: {
    // Styling handled by Text component
  },
  materialDescription: {
    marginBottom: theme.spacing.sm,
    fontSize: 12,
  },
  materialMeta: {
    flexDirection: 'column',
    marginBottom: theme.spacing.sm,
  },
  materialSubject: {
    backgroundColor: theme.colors.lightGray,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
    alignSelf: 'flex-start',
    fontSize: 10,
  },
  materialLevel: {
    backgroundColor: theme.colors.lightGray,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
    alignSelf: 'flex-start',
    fontSize: 10,
  },
  materialYear: {
    backgroundColor: theme.colors.lightGray,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    fontSize: 10,
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