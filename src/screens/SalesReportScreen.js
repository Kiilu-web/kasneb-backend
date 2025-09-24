import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const SalesReportScreen = ({ navigation }) => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const periods = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  // Mock sales data
  const mockSales = [
    {
      id: '1',
      transactionId: 'TXN001',
      customerName: 'John Doe',
      phoneNumber: '254700000001',
      materialTitle: 'CPA Foundation - Financial Accounting',
      amount: 500,
      date: '2024-01-15T14:30:00Z',
      status: 'completed',
      materialSubject: 'CPA',
      materialLevel: 'Foundation',
    },
    {
      id: '2',
      transactionId: 'TXN002',
      customerName: 'Jane Smith',
      phoneNumber: '254700000002',
      materialTitle: 'ATD Intermediate - Management Accounting',
      amount: 750,
      date: '2024-01-15T13:45:00Z',
      status: 'completed',
      materialSubject: 'ATD',
      materialLevel: 'Intermediate',
    },
    {
      id: '3',
      transactionId: 'TXN003',
      customerName: 'Mike Johnson',
      phoneNumber: '254700000003',
      materialTitle: 'CS Advanced - Corporate Secretarial Practice',
      amount: 1000,
      date: '2024-01-15T12:20:00Z',
      status: 'completed',
      materialSubject: 'CS',
      materialLevel: 'Advanced',
    },
    {
      id: '4',
      transactionId: 'TXN004',
      customerName: 'Sarah Wilson',
      phoneNumber: '254700000004',
      materialTitle: 'CCP Foundation - Credit Management',
      amount: 600,
      date: '2024-01-14T16:15:00Z',
      status: 'completed',
      materialSubject: 'CCP',
      materialLevel: 'Foundation',
    },
    {
      id: '5',
      transactionId: 'TXN005',
      customerName: 'David Brown',
      phoneNumber: '254700000005',
      materialTitle: 'CPA Foundation - Business Law',
      amount: 450,
      date: '2024-01-14T11:30:00Z',
      status: 'completed',
      materialSubject: 'CPA',
      materialLevel: 'Foundation',
    },
  ];

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, searchQuery, selectedPeriod]);

  const loadSales = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch from Firebase
      const salesRef = collection(db, 'sales');
      const snapshot = await getDocs(salesRef);
      const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // For now, using mock data
      //setSales(mockSales);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSales = () => {
    let filtered = [...sales];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(sale =>
        sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.materialTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by period
    const now = new Date();
    switch (selectedPeriod) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filtered = filtered.filter(sale => new Date(sale.date) >= today);
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(sale => new Date(sale.date) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(sale => new Date(sale.date) >= monthAgo);
        break;
      default:
        // All time - no filtering
        break;
    }

    setFilteredSales(filtered);
  };

  const getTotalRevenue = () => {
    return filteredSales.reduce((total, sale) => total + sale.amount, 0);
  };

  const getTotalSales = () => {
    return filteredSales.length;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const renderSaleItem = ({ item }) => (
    <View style={styles.saleItem}>
      <View style={styles.saleHeader}>
        <Text style={styles.transactionId}>{item.transactionId}</Text>
        <Text style={styles.saleAmount}>{formatCurrency(item.amount)}</Text>
      </View>
      
      <Text style={styles.customerName}>{item.customerName}</Text>
      <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
      
      <Text style={styles.materialTitle}>{item.materialTitle}</Text>
      
      <View style={styles.saleMeta}>
        <Text style={styles.materialSubject}>{item.materialSubject}</Text>
        <Text style={styles.materialLevel}>{item.materialLevel}</Text>
        <Text style={styles.saleDate}>{formatDate(item.date)}</Text>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  const renderPeriodButton = (period) => (
    <TouchableOpacity
      key={period.key}
      style={[
        styles.periodButton,
        selectedPeriod === period.key && styles.periodButtonActive
      ]}
      onPress={() => setSelectedPeriod(period.key)}
    >
      <Text style={[
        styles.periodButtonText,
        selectedPeriod === period.key && styles.periodButtonTextActive
      ]}>
        {period.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading sales data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sales Report</Text>
        <Text style={styles.headerSubtitle}>Track your sales performance</Text>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>💰</Text>
          <Text style={styles.summaryValue}>{formatCurrency(getTotalRevenue())}</Text>
          <Text style={styles.summaryLabel}>Total Revenue</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>📊</Text>
          <Text style={styles.summaryValue}>{getTotalSales()}</Text>
          <Text style={styles.summaryLabel}>Total Sales</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer, material, or transaction ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.periodContainer}>
          <Text style={styles.periodLabel}>Filter by Period:</Text>
          <View style={styles.periodButtons}>
            {periods.map(renderPeriodButton)}
          </View>
        </View>
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredSales.length} sale{filteredSales.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Sales List */}
      <FlatList
        data={filteredSales}
        renderItem={renderSaleItem}
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
    backgroundColor: '#f8f9fa',
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
  summaryContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  periodContainer: {
    marginBottom: 10,
  },
  periodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  periodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  periodButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 5,
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#333',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  resultsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 15,
  },
  saleItem: {
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
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  saleAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  materialTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  saleMeta: {
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
  saleDate: {
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default SalesReportScreen; 