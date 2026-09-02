import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function AboutUs() {
  const router = useRouter();

  const teamMembers = [
    { name: "Textile Directory Team", role: "Core Team" },
    { name: "Data Partners", role: "Industry Partners" },
  ];

  const handleEmailPress = () => {
    Linking.openURL("mailto:support@textiledirectory.com");
  };

  const handlePhonePress = () => {
    Linking.openURL("tel:+919876543210");
  };

  const handleWebsitePress = () => {
    Linking.openURL("https://www.textiledirectory.com");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Feather name="book-open" size={40} color="#3B82F6" />
          </View>
          <Text style={styles.appName}>Textile Directory</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            To connect textile businesses across India through a comprehensive digital directory,
            making it easier for manufacturers, suppliers, and traders to find and connect with
            each other.
          </Text>
        </View>

        {/* What We Offer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <View style={styles.featureItem}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.featureText}>1,600+ verified textile businesses</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.featureText}>20+ states and 100+ cities covered</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.featureText}>Complete contact information</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.featureText}>Easy search and navigation</Text>
          </View>
        </View>

        {/* Team Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team</Text>
          {teamMembers.map((member, index) => (
            <View key={index} style={styles.teamItem}>
              <View style={styles.teamAvatar}>
                <Feather name="user" size={20} color="#3B82F6" />
              </View>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{member.name}</Text>
                <Text style={styles.teamRole}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <TouchableOpacity style={styles.infoItem} onPress={handleEmailPress}>
            <View style={styles.infoIcon}>
              <Feather name="mail" size={18} color="#3B82F6" />
            </View>
            <Text style={styles.infoText}>support@textiledirectory.com</Text>
            <Feather name="chevron-right" size={16} color="#9CA3AF" style={styles.infoArrow} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem} onPress={handlePhonePress}>
            <View style={styles.infoIcon}>
              <Feather name="phone" size={18} color="#10B981" />
            </View>
            <Text style={styles.infoText}>+91 98765 43210</Text>
            <Feather name="chevron-right" size={16} color="#9CA3AF" style={styles.infoArrow} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem} onPress={handleWebsitePress}>
            <View style={styles.infoIcon}>
              <Feather name="globe" size={18} color="#8B5CF6" />
            </View>
            <Text style={styles.infoText}>www.textiledirectory.com</Text>
            <Feather name="chevron-right" size={16} color="#9CA3AF" style={styles.infoArrow} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          © 2024 Textile Directory. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
  },
  appVersion: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  teamItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  teamAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  teamRole: {
    fontSize: 12,
    color: "#6B7280",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  infoArrow: {
    marginLeft: 4,
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
    marginBottom: 20,
  },
});