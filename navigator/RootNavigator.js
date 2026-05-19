import React from "react";
// Import React Navigation components
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import your screen components
import Home from "../components/Home";
import QrScanner from "../components/QrScanner";
import About from "../components/About";

// Create the Stack Navigator object
const Stack = createNativeStackNavigator();

// This component defines the structure of your app navigation
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#065E6A",
          },
          headerTintColor: "#fff",
        }}
      >
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ title: "Travel & Border Health" }}
        />
        <Stack.Screen
          name="QrScanner"
          component={QrScanner}
          options={{ title: "Scan QR Code" }}
        />
        <Stack.Screen
          name="About"
          component={About}
          options={{ title: "About the App" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
