import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";

const BRAND = "#065E6A";
const BRAND_DARK = "#054A54";
const SCAN_GREEN = "#34A853";

export default function Home({ navigation }) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, 480);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { width: contentWidth }]}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>QR</Text>
        </View>
        <Text style={styles.heroTitle}>Travel & Border Health</Text>
        <Text style={styles.heroSubtitle}>QR Scanner</Text>
      </View>

      <View style={[styles.card, { width: contentWidth }]}>
        <Text style={styles.welcome}>Welcome</Text>
        <Text style={styles.instruction}>
          Scan a traveler's QR code to view their health status flag and
          send scan confirmation to the EPHI PHEM TBH DHIS2 instance.
        </Text>
      </View>

      <View style={[styles.actions, { width: contentWidth }]}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate("QrScanner")}
        >
          <Text style={styles.primaryButtonTitle}>Start QR Scan</Text>
          <Text style={styles.primaryButtonHint}>
            Open camera and scan traveler code
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
          onPress={() => navigation.navigate("About")}
        >
          <Text style={styles.secondaryButtonTitle}>About This App</Text>
          <Text style={styles.secondaryButtonHint}>
            Learn more about this application
          </Text>
        </Pressable>
      </View>

      <View style={[styles.footer, { width: contentWidth }]}>
        <Text style={styles.footerOrg}>EPHI · PHEM</Text>
        <Text style={styles.footerText}>
          Travelers and Border Health Directorate
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: BRAND,
    borderRadius: 16,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    marginTop: 6,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  welcome: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  instruction: {
    fontSize: 16,
    lineHeight: 26,
    color: "#444",
  },
  actions: {
    gap: 14,
  },
  primaryButton: {
    backgroundColor: SCAN_GREEN,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: SCAN_GREEN,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: BRAND,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  secondaryButtonPressed: {
    backgroundColor: "#E8F4F6",
    transform: [{ scale: 0.98 }],
  },
  primaryButtonTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  primaryButtonHint: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  secondaryButtonTitle: {
    color: BRAND_DARK,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryButtonHint: {
    color: "#666",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  footer: {
    alignItems: "center",
    marginTop: 28,
    paddingTop: 8,
  },
  footerOrg: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND,
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 4,
  },
});
