import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View } from "react-native";
// ⬇️ Import the new AppNavigator component
import RootNavigator from "./navigator/RootNavigator";

export default function App() {
  return (
    <View style={styles.container}>
      {/* ⬇️ Render the AppNavigator here */}
      <RootNavigator />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // It's still a good idea for the root container to take up the whole screen
    flex: 1,
    backgroundColor: "#fff",
  },
});
