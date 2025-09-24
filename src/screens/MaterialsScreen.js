import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
 
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import theme from '../config/theme';

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
    <View style={styles.materialCard}>
      <View style={styles.materialHeader}>
        <Text style={styles.materialTitle}>{item.title}</Text>
        <Text style={styles.materialPrice}>KES {item.price}</Text>
      </View>
      
      <Text style={styles.materialDescription}>{item.description}</Text>
      
      <View style={styles.materialMeta}>
        <Text style={styles.materialSubject}>{item.subject}</Text>
        <Text style={styles.materialLevel}>{item.level}</Text>
        <Text style={styles.materialYear}>{item.year}</Text>
      </View>
      
      {Boolean(item.pages || item.fileSize) && (
        <View style={styles.materialDetails}>
          {item.pages ? (
            <Text style={styles.materialDetail}>📄 {item.pages} pages</Text>
          ) : null}
          {item.fileSize ? (
            <Text style={styles.materialDetail}>📁 {item.fileSize}</Text>
          ) : null}
        </View>
      )}
      
      <View style={styles.materialActions}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => addToCart(item)}
        >
          <Text style={styles.addToCartButtonText}>🛒 Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading materials...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
              {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Study Materials</Text>
          <Text style={styles.headerSubtitle}>Browse and purchase KASNEB materials</Text>
          <View style={styles.headerStats}>
            <Text style={styles.statText}>{filteredMaterials.length} materials available</Text>
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
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filter by Subject:</Text>
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
        
        <Text style={styles.filtersTitle}>Filter by Level:</Text>
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
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''} found
        </Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => Alert.alert('Sort Options', 'Sort by: Price, Date, Title')}
        >
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Materials List */}
      <FlatList
        data={filteredMaterials}
        renderItem={renderMaterialItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textInverse,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textInverse,
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  headerStats: {
    marginTop: 10,
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: theme.colors.textInverse,
    opacity: 0.8,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: theme.colors.surface,
  },
  searchInput: {
    backgroundColor: theme.colors.lightGray,
    padding: 15,
    borderRadius: theme.borderRadius.lg,
    fontSize: 16,
  },
  filtersContainer: {
    backgroundColor: theme.colors.surface,
    padding: 15,
    marginBottom: 10,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 10,
    marginTop: 10,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  filterButtonContainer: {
    marginRight: 10,
    marginBottom: 5,
  },
  filterButton: {
    backgroundColor: theme.colors.lightGray,
    paddingHorizontal: 15,
    paddingVertical: 8,
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  sortButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
  },
  sortButtonText: {
    color: theme.colors.textInverse,
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  materialCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  materialPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  materialDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  materialMeta: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  materialSubject: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 5,
  },
  materialLevel: {
    fontSize: 12,
    color: '#4caf50',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 5,
  },
  materialYear: {
    fontSize: 12,
    color: '#ff9800',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  materialDetails: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  materialDetail: {
    fontSize: 12,
    color: '#666',
    marginRight: 15,
  },
  materialActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  addToCartButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
});

export default MaterialsScreen; 