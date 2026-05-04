import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import StoreListScreen from "../screens/storefront/StoreListScreen";
import StoreDetailScreen from "../screens/storefront/StoreDetailScreen";
import ProductDetailScreen from "../screens/storefront/ProductDetailScreen";
import CartScreen from "../screens/storefront/CartScreen";
import CheckoutScreen from "../screens/storefront/CheckoutScreen";
import OrderListScreen from "../screens/storefront/OrderListScreen";
import OrderTrackingScreen from "../screens/storefront/OrderTrackingScreen";
import SearchScreen from "../screens/storefront/SearchScreen";
import LoginScreen from "../screens/auth/LoginScreen";

const Tab = createBottomTabNavigator();
const StoreStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Stores: "🏪",
    Search: "🔍",
    Cart: "🛒",
    Orders: "📋",
    Profile: "👤",
  };
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.6 }}>
      {icons[label] || "📱"}
    </Text>
  );
}

function StoreNavigator() {
  return (
    <StoreStack.Navigator screenOptions={{ headerShown: false }}>
      <StoreStack.Screen name="StoreList" component={StoreListScreen} />
      <StoreStack.Screen name="StoreDetail" component={StoreDetailScreen} />
      <StoreStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </StoreStack.Navigator>
  );
}

function CartNavigator() {
  return (
    <CartStack.Navigator screenOptions={{ headerShown: false }}>
      <CartStack.Screen name="CartMain" component={CartScreen} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} />
    </CartStack.Navigator>
  );
}

export default function StorefrontNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: "#006A4E",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      })}
    >
      <Tab.Screen name="Stores" component={StoreNavigator} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Cart" component={CartNavigator} />
      <Tab.Screen name="Orders" component={OrderListScreen} />
      <Tab.Screen name="Profile" component={LoginScreen} />
    </Tab.Navigator>
  );
}
