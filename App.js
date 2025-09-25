import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase';
import theme from './src/config/theme';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import MaterialsScreen from './src/screens/MaterialsScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminLoginScreen from './src/screens/AdminLoginScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import UploadMaterialScreen from './src/screens/UploadMaterialScreen';
import SalesReportScreen from './src/screens/SalesReportScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ReceiptScreen from './src/screens/ReceiptScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// User Tab Navigator - Only for regular users
function UserTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.darkGray,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.gray,
          ...theme.shadows.sm,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Materials" 
        component={MaterialsScreen}
        options={{
          tabBarLabel: 'Materials',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📚</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🛒</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Admin Tab Navigator - Only for admin users
function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.darkGray,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.gray,
          ...theme.shadows.sm,
        },
      }}
    >
      <Tab.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="UploadMaterial" 
        component={UploadMaterialScreen}
        options={{
          tabBarLabel: 'Upload',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📤</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="SalesReport" 
        component={SalesReportScreen}
        options={{
          tabBarLabel: 'Sales',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>💰</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// User Stack Navigator - Includes payment flows for regular users
function UserStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs" component={UserTabNavigator} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Receipt" component={ReceiptScreen} />
    </Stack.Navigator>
  );
}

// Admin Stack Navigator - Only admin-specific screens
function AdminStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('🔍 App: Setting up auth listener...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔍 App: Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setUser(user);
      // Check if user is admin - kiilu075@gmail.com is configured as admin
      if (user && user.email === 'kiilu075@gmail.com') {
        setIsAdmin(true);
        console.log('🔍 App: User is admin');
      } else {
        setIsAdmin(false);
        console.log('🔍 App: User is regular user');
      }
      setLoading(false);
      console.log('🔍 App: Loading set to false');
    });

    return unsubscribe;
  }, []);

  console.log('🔍 App: Render - loading:', loading, 'user:', user ? user.email : 'null', 'isAdmin:', isAdmin);

  if (loading) {
    console.log('🔍 App: Showing loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.textPrimary }}>Loading KASNEB MATERIALS...</Text>
      </View>
    );
  }

  console.log('🔍 App: Rendering main navigation');
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth screens - accessible to everyone
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          </>
        ) : isAdmin ? (
          // Admin-only experience - completely separate from user experience
          <Stack.Screen name="AdminStack" component={AdminStackNavigator} />
        ) : (
          // User-only experience - includes payment flows
          <Stack.Screen name="UserStack" component={UserStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
