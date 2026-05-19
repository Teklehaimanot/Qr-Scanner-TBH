import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";

const BRAND = "#065E6A";
const BRAND_LIGHT = "#E8F4F6";

export default function About() {
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
        <Text style={styles.sectionLabel}>About this app</Text>
        <Text style={styles.body}>
          This is a simple Android application designed to scan QR codes and
          extract their values. It then sends the scan status to the EPHI PHEM
          Travel and Border Health DHIS2 instance.
        </Text>
        <View style={styles.divider} />
        <Text style={styles.body}>
          The application was developed by the Travelers and Border Health
          Directorate under EPHI/PHEM.
        </Text>
      </View>

      <View style={[styles.featuresCard, { width: contentWidth }]}>
        <FeatureRow
          label="Scan"
          description="Read traveler QR codes at the point of entry"
        />
        <FeatureRow
          label="Classify"
          description="Display health status flags (RED, YELLOW, GREEN)"
        />
        <FeatureRow
          label="Sync"
          description="Update scan status in DHIS2 automatically"
        />
      </View>

      <View style={[styles.footer, { width: contentWidth }]}>
        <Text style={styles.footerOrg}>EPHI · PHEM</Text>
        <Text style={styles.footerDirectorate}>
          Travelers and Border Health Directorate
        </Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

function FeatureRow({ label, description }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureBadge}>
        <Text style={styles.featureBadgeText}>{label}</Text>
      </View>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
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
    paddingVertical: 32,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    marginTop: 4,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#E8ECF0",
    marginVertical: 16,
  },
  featuresCard: {
    backgroundColor: BRAND_LIGHT,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D0E8EC",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  featureBadge: {
    backgroundColor: BRAND,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 72,
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  featureBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  featureDescription: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#444",
  },
  footer: {
    alignItems: "center",
    paddingTop: 8,
  },
  footerOrg: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND,
    letterSpacing: 0.5,
  },
  footerDirectorate: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  version: {
    fontSize: 12,
    color: "#999",
    marginTop: 16,
  },
});
