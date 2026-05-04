import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import MerchantNavigator from "./MerchantNavigator";
import StorefrontNavigator from "./StorefrontNavigator";
import { ActivityIndicator, View, Text } from "react-native";

interface AppNavigatorProps {
  initialMode?: "merchant" | "storefront";
}

export default function AppNavigator({ initialMode = "storefront" }: AppNavigatorProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#006A4E" />
        <Text style={{ marginTop: 12, color: "#6b7280", fontSize: 14 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        user.role === "MERCHANT" || user.role === "ADMIN" ? (
          <MerchantNavigator />
        ) : (
          <StorefrontNavigator />
        )
      ) : (
        <StorefrontNavigator />
      )}
    </NavigationContainer>
  );
}
