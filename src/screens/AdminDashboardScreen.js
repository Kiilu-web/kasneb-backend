import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

const db = getFirestore();

const AdminDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalSales: 0,
    totalRevenue: 0,
    todaySales: 0,
    todayRevenue: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentMaterials, setRecentMaterials] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      
      // Fetch materials
      const materialsQuery = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
      const materialsSnapshot = await getDocs(materialsQuery);
      const materials = [];
      materialsSnapshot.forEach(doc => {
        materials.push({ id: doc.id, ...doc.data() });
      });

      // Fetch sales
      const salesQuery = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
      const salesSnapshot = await getDocs(salesQuery);
      const sales = [];
      salesSnapshot.forEach(doc => {
        sales.push({ id: doc.id, ...doc.data() });
      });

      // Calculate today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter today's sales
      const todaySales = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= today;
      });

      // Calculate statistics
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
      const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.amount || 0), 0);

      setStats({
        totalMaterials: materials.length,
        totalSales: sales.length,
        totalRevenue: totalRevenue,
        todaySales: todaySales.length,
        todayRevenue: todayRevenue,
      });

      // Set recent transactions (latest 5 sales)
      setRecentTransactions(sales.slice(0, 5));

      // Set recent materials (latest 5 materials)
      setRecentMaterials(materials.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // Navigation will be handled automatically by the App.js auth state listener
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (dashboardLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome back, Admin!</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchDashboardData}
              disabled={dashboardLoading}
            >
              <Text style={styles.refreshButtonText}>🔄</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={loading}
            >
              <Text style={styles.logoutButtonText}>
                {loading ? '...' : 'Logout'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📚</Text>
              <Text style={styles.statValue}>{stats.totalMaterials}</Text>
              <Text style={styles.statLabel}>Total Materials</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statValue}>{stats.totalSales}</Text>
              <Text style={styles.statLabel}>Total Sales</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🆕</Text>
              <Text style={styles.statValue}>{stats.todaySales}</Text>
              <Text style={styles.statLabel}>Today's Sales</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('UploadMaterial')}
            >
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionTitle}>Upload Material</Text>
              <Text style={styles.actionDescription}>Add new study materials</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('SalesReport')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Sales Report</Text>
              <Text style={styles.actionDescription}>View detailed sales data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => Alert.alert('Coming Soon', 'User management feature coming soon!')}
            >
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionTitle}>Manage Users</Text>
              <Text style={styles.actionDescription}>User access control</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => Alert.alert('Coming Soon', 'Analytics dashboard coming soon!')}
            >
              <Text style={styles.actionIcon}>📈</Text>
              <Text style={styles.actionTitle}>Analytics</Text>
              <Text style={styles.actionDescription}>Performance insights</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SalesReport')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📊</Text>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>Sales will appear here once customers make purchases</Text>
            </View>
          ) : (
            recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionCustomer}>
                    {transaction.customerName || transaction.customer || 'Unknown Customer'}
                  </Text>
                  <Text style={styles.transactionPhone}>
                    {transaction.phoneNumber || transaction.phone || 'No phone'}
                  </Text>
                  <Text style={styles.transactionMaterial} numberOfLines={1}>
                    {transaction.materialTitle || transaction.material || 'Unknown Material'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.createdAt || transaction.date)}
                  </Text>
                </View>
                
                <View style={styles.transactionAmount}>
                  <Text style={styles.amountText}>
                    {formatCurrency(transaction.amount || 0)}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {transaction.status || 'completed'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recent Materials */}
        <View style={styles.materialsContainer}>
          <View style={styles.materialsHeader}>
            <Text style={styles.sectionTitle}>Recent Materials</Text>
            <TouchableOpacity onPress={() => navigation.navigate('UploadMaterial')}>
              <Text style={styles.viewAllText}>Upload New</Text>
            </TouchableOpacity>
          </View>
          
          {recentMaterials.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📚</Text>
              <Text style={styles.emptyStateText}>No materials uploaded yet</Text>
              <Text style={styles.emptyStateSubtext}>Upload your first study material to get started</Text>
            </View>
          ) : (
            recentMaterials.map((material) => (
              <View key={material.id} style={styles.materialItem}>
                <View style={styles.materialInfo}>
                  <Text style={styles.materialTitle} numberOfLines={2}>
                    {material.title}
                  </Text>
                  <Text style={styles.materialSubject}>
                    {material.subject} - {material.level}
                  </Text>
                  <Text style={styles.materialPrice}>
                    {formatCurrency(material.price)}
                  </Text>
                  <Text style={styles.materialDate}>
                    Uploaded: {formatDate(material.createdAt)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Today's Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Sales:</Text>
              <Text style={styles.summaryValue}>{stats.todaySales}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Revenue:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(stats.todayRevenue)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Avg. Order:</Text>
              <Text style={styles.summaryValue}>
                {stats.todaySales > 0 ? formatCurrency(stats.todayRevenue / stats.todaySales) : 'KES 0'}
              </Text>
            </View>
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
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 10,
    marginRight: 10,
  },
  refreshButtonText: {
    fontSize: 24,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
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
  statIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  transactionsContainer: {
    padding: 15,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCustomer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  transactionPhone: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  transactionMaterial: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
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
  summaryContainer: {
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
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  materialsContainer: {
    padding: 15,
  },
  materialsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  materialItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  materialSubject: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  materialPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  materialDate: {
    fontSize: 12,
    color: '#666',
  },
});

export default AdminDashboardScreen; 