import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function ContactUs() {
  const router = useRouter();

  const contactItems = [
    { 
      id: "email", 
      label: "Email Us", 
      value: "support@textiledirectory.com", 
      icon: "mail", 
      color: "#3B82F6",
      action: () => Linking.openURL("mailto:support@textiledirectory.com")
    },
    { 
      id: "phone", 
      label: "Call Us", 
      value: "+91 98765 43210", 
      icon: "phone", 
      color: "#10B981",
      action: () => Linking.openURL("tel:+919876543210")
    },
    { 
      id: "whatsapp", 
      label: "WhatsApp", 
      value: "+91 98765 43210", 
      icon: "message-circle", 
      color: "#25D366",
      action: () => Linking.openURL("https://wa.me/919876543210")
    },
    { 
      id: "website", 
      label: "Website", 
      value: "www.textiledirectory.com", 
      icon: "globe", 
      color: "#8B5CF6",
      action: () => Linking.openURL("https://www.textiledirectory.com")
    },
  ];

  const socialLinks = [
    { id: "facebook", icon: "facebook", color: "#1877F2", url: "https://facebook.com/textiledirectory" },
    { id: "instagram", icon: "instagram", color: "#E4405F", url: "https://instagram.com/textiledirectory" },
    { id: "twitter", icon: "twitter", color: "#1DA1F2", url: "https://twitter.com/textiledirectory" },
    { id: "linkedin", icon: "linkedin", color: "#0A66C2", url: "https://linkedin.com/company/textiledirectory" },
    { id: "youtube", icon: "youtube", color: "#FF0000", url: "https://youtube.com/textiledirectory" },
  ];

  const handleSocialPress = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open link");
    });
  };

  const handleContactPress = (item) => {
    item.action().catch(() => {
      Alert.alert("Error", `Unable to open ${item.label}`);
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.description}>
            Have questions or feedback? Reach out to us through any of the channels below.
            We're here to help you!
          </Text>
        </View>

        {/* Contact Items */}
        {contactItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.contactItem}
            onPress={() => handleContactPress(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + "15" }]}>
              <Feather name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{item.label}</Text>
              <Text style={styles.contactValue}>{item.value}</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))}

        {/* Social Media Section */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <Text style={styles.socialSubtitle}>Stay connected with us on social media</Text>
          <View style={styles.socialRow}>
            {socialLinks.map((social) => (
              <TouchableOpacity
                key={social.id}
                style={[styles.socialButton, { borderColor: social.color + "30" }]}
                onPress={() => handleSocialPress(social.url)}
                activeOpacity={0.7}
              >
                <View style={[styles.socialIconBg, { backgroundColor: social.color + "15" }]}>
                  <Feather name={social.icon} size={22} color={social.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Office Hours */}
        <View style={styles.hoursCard}>
          <Text style={styles.hoursTitle}>Office Hours</Text>
          <View style={styles.hoursRow}>
            <Feather name="clock" size={16} color="#6B7280" />
            <Text style={styles.hoursText}>Monday - Friday: 9:00 AM - 6:00 PM</Text>
          </View>
          <View style={styles.hoursRow}>
            <Feather name="clock" size={16} color="#6B7280" />
            <Text style={styles.hoursText}>Saturday: 10:00 AM - 2:00 PM</Text>
          </View>
          <View style={styles.hoursRow}>
            <Feather name="clock" size={16} color="#6B7280" />
            <Text style={styles.hoursText}>Sunday: Closed</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>We typically respond within 24 hours</Text>
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
    paddingTop: 16,
    paddingBottom: 20,
  },
  descriptionCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  contactValue: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  arrowContainer: {
    width: 24,
    alignItems: "flex-end",
  },
  socialSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  socialSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 12,
  },
  socialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  socialIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  hoursCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginTop: 4,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 10,
  },
  hoursText: {
    fontSize: 14,
    color: "#6B7280",
  },
  footerText: {
    textAlign: "center",
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 16,
  },
});