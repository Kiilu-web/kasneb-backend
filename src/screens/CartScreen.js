import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isLargeDevice = width > 768;

const CartScreen = ({ navigation, route }) => {
  const [cartItems, setCartItems] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if material was passed from MaterialsScreen
    if (route.params?.material) {
      const newMaterial = {
        ...route.params.material,
        quantity: 1,
      };
      setCartItems([newMaterial]);
    }
  }, [route.params]);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount || 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add some materials to your cart first.');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Phone Number Required', 'Please enter your M-Pesa phone number to proceed.');
      return;
    }

    if (!phoneNumber.startsWith('254') && !phoneNumber.startsWith('07') && !phoneNumber.startsWith('01')) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid Kenyan phone number.');
      return;
    }

    // Navigate to payment screen
    navigation.navigate('Payment', {
      cartItems,
      totalAmount: getTotalPrice(),
      phoneNumber: phoneNumber.trim(),
    });
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemSubject}>
            {item.subject} - {item.level}
          </Text>
          {item.year && (
            <Text style={styles.itemYear}>Year: {item.year}</Text>
          )}
        </View>
        <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
      </View>
      
      <View style={styles.itemActions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item.id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <Text style={styles.headerSubtitle}>Your selected materials</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some study materials to get started</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Materials')}
          >
            <Text style={styles.browseButtonText}>Browse Materials</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.headerSubtitle}>
          {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart
        </Text>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartList}
      />

      {/* Phone Number Input */}
      <View style={styles.phoneInputContainer}>
        <Text style={styles.phoneInputLabel}>M-Pesa Phone Number:</Text>
        <TextInput
          style={styles.phoneInput}
          placeholder="e.g., 254700000000 or 0700000000"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          maxLength={12}
        />
      </View>

      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Subtotal:</Text>
        <Text style={styles.summaryValue}>KES {getTotalPrice()}</Text>
      </View>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Processing Fee:</Text>
        <Text style={styles.summaryValue}>KES 0</Text>
      </View>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Total:</Text>
        <Text style={styles.summaryValue}>KES {getTotalPrice()}</Text>
      </View>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity
          style={[styles.checkoutButton, !phoneNumber.trim() && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={!phoneNumber.trim() || loading}
        >
          <Text style={styles.checkoutButtonText}>
            {loading ? 'Processing...' : `Pay KES ${getTotalPrice()} with M-Pesa`}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.checkoutHint}>
          You will receive an M-Pesa prompt to complete the payment
        </Text>
      </View>
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
    padding: isSmallDevice ? 15 : isLargeDevice ? 25 : 20,
    paddingTop: isSmallDevice ? 30 : isLargeDevice ? 50 : 40,
  },
  headerTitle: {
    fontSize: isSmallDevice ? 22 : isLargeDevice ? 28 : 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: isSmallDevice ? 14 : isLargeDevice ? 16 : 15,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isSmallDevice ? 20 : isLargeDevice ? 40 : 30,
  },
  emptyIcon: {
    fontSize: isSmallDevice ? 60 : isLargeDevice ? 80 : 70,
    marginBottom: isSmallDevice ? 15 : isLargeDevice ? 20 : 18,
  },
  emptyTitle: {
    fontSize: isSmallDevice ? 20 : isLargeDevice ? 24 : 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: isSmallDevice ? 8 : isLargeDevice ? 10 : 9,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: isSmallDevice ? 14 : isLargeDevice ? 16 : 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 20 : isLargeDevice ? 25 : 22,
    lineHeight: isSmallDevice ? 20 : isLargeDevice ? 22 : 21,
  },
  browseButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: isSmallDevice ? 20 : isLargeDevice ? 30 : 25,
    paddingVertical: isSmallDevice ? 12 : isLargeDevice ? 15 : 13,
    borderRadius: 25,
  },
  browseButtonText: {
    color: 'white',
    fontSize: isSmallDevice ? 14 : isLargeDevice ? 16 : 15,
    fontWeight: '600',
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    backgroundColor: 'white',
    margin: isSmallDevice ? 10 : isLargeDevice ? 15 : 12,
    padding: isSmallDevice ? 15 : isLargeDevice ? 20 : 18,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemInfo: {
    marginBottom: isSmallDevice ? 12 : isLargeDevice ? 15 : 13,
  },
  itemTitle: {
    fontSize: isSmallDevice ? 15 : isLargeDevice ? 17 : 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: isSmallDevice ? 6 : isLargeDevice ? 8 : 7,
    lineHeight: isSmallDevice ? 20 : isLargeDevice ? 22 : 21,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 6 : isLargeDevice ? 8 : 7,
  },
  itemSubject: {
    fontSize: isSmallDevice ? 12 : isLargeDevice ? 13 : 12,
    color: '#007AFF',
    fontWeight: '600',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: isSmallDevice ? 6 : isLargeDevice ? 8 : 7,
    paddingVertical: isSmallDevice ? 2 : isLargeDevice ? 3 : 2,
    borderRadius: 8,
  },
  itemYear: {
    fontSize: isSmallDevice ? 12 : isLargeDevice ? 13 : 12,
    color: '#666',
    marginLeft: isSmallDevice ? 8 : isLargeDevice ? 10 : 9,
  },
  itemPrice: {
    fontSize: isSmallDevice ? 16 : isLargeDevice ? 18 : 17,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    width: isSmallDevice ? 32 : isLargeDevice ? 36 : 34,
    height: isSmallDevice ? 32 : isLargeDevice ? 36 : 34,
    borderRadius: isSmallDevice ? 16 : isLargeDevice ? 18 : 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: isSmallDevice ? 16 : isLargeDevice ? 18 : 17,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    fontSize: isSmallDevice ? 14 : isLargeDevice ? 16 : 15,
    fontWeight: '600',
    marginHorizontal: isSmallDevice ? 12 : isLargeDevice ? 15 : 13,
    minWidth: isSmallDevice ? 20 : isLargeDevice ? 25 : 22,
    textAlign: 'center',
  },
  removeButton: {
    paddingHorizontal: isSmallDevice ? 12 : isLargeDevice ? 15 : 13,
    paddingVertical: isSmallDevice ? 6 : isLargeDevice ? 8 : 7,
  },
  removeButtonText: {
    fontSize: isSmallDevice ? 12 : isLargeDevice ? 14 : 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  checkoutContainer: {
    backgroundColor: 'white',
    padding: isSmallDevice ? 15 : isLargeDevice ? 20 : 18,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  phoneInputContainer: {
    marginBottom: isSmallDevice ? 15 : isLargeDevice ? 20 : 18,
  },
  phoneInputLabel: {
    fontSize: isSmallDevice ? 14 : isLargeDevice ? 16 : 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: isSmallDevice ? 6 : isLargeDevice ? 8 : 7,
  },
  phoneInput: {
    fontSize: isSmallDevice ? 14 : isLargeDevice ? 16 : 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: isSmallDevice ? 12 : isLargeDevice ? 15 : 13,
    backgroundColor: '#f8f9fa',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 15 : isLargeDevice ? 20 : 18,
    paddingVertical: isSmallDevice ? 10 : isLargeDevice ? 12 : 11,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryText: {
    fontSize: isSmallDevice ? 14 : isLargeDevice ? 16 : 15,
    color: '#333',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: isSmallDevice ? 16 : isLargeDevice ? 18 : 17,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: isSmallDevice ? 12 : isLargeDevice ? 15 : 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#ccc',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: isSmallDevice ? 14 : isLargeDevice ? 16 : 15,
    fontWeight: '600',
  },
  checkoutHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default CartScreen; 