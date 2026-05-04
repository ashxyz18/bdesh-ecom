import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import StoreSelectorScreen from "../screens/dashboard/StoreSelectorScreen";
import ProductListScreen from "../screens/products/ProductListScreen";
import ProductAddScreen from "../screens/products/ProductAddScreen";
import ProductDetailScreen from "../screens/products/ProductDetailScreen";
import OrderListScreen from "../screens/orders/OrderListScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import AnalyticsScreen from "../screens/analytics/AnalyticsScreen";
import AIAssistantScreen from "../screens/ai/AIAssistantScreen";
import AIBuilderScreen from "../screens/ai/AIBuilderScreen";
import MarketingScreen from "../screens/marketing/MarketingScreen";
import SEOScreen from "../screens/marketing/SEOScreen";
import DiscountsScreen from "../screens/marketing/DiscountsScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";

const Tab = createBottomTabNavigator();
const ProductsStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const MarketingStack = createNativeStackNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: "📊",
    Products: "📦",
    Orders: "🛒",
    More: "⚙️",
  };
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.6 }}>
      {icons[label] || "📱"}
    </Text>
  );
}

function ProductsNavigator() {
  return (
    <ProductsStack.Navigator screenOptions={{ headerShown: false }}>
      <ProductsStack.Screen name="ProductList" component={ProductListScreen} />
      <ProductsStack.Screen name="ProductAdd" component={ProductAddScreen} />
      <ProductsStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </ProductsStack.Navigator>
  );
}

function OrdersNavigator() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="OrderList" component={OrderListScreen} />
      <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </OrdersStack.Navigator>
  );
}

function MarketingNavigator() {
  return (
    <MarketingStack.Navigator screenOptions={{ headerShown: false }}>
      <MarketingStack.Screen name="MarketingHome" component={MarketingScreen} />
      <MarketingStack.Screen name="SEO" component={SEOScreen} />
      <MarketingStack.Screen name="Discounts" component={DiscountsScreen} />
    </MarketingStack.Navigator>
  );
}

export default function MerchantNavigator() {
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
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Products" component={ProductsNavigator} />
      <Tab.Screen name="Orders" component={OrdersNavigator} />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ tabBarLabel: "More" }}
      />
    </Tab.Navigator>
  );
}

function MoreScreen() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Marketing" component={MarketingNavigator} />
      <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
      <Stack.Screen name="AIBuilder" component={AIBuilderScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
