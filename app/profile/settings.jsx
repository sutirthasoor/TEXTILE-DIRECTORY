import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../configs/FirebaseConfig";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [language, setLanguage] = useState("English");
  const [userId, setUserId] = useState(null);

  // Load settings from Firebase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        setUserId(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Load settings from user document
          if (data.settings) {
            setNotifications(data.settings.notifications ?? true);
            setDarkMode(data.settings.darkMode ?? false);
            setAutoSync(data.settings.autoSync ?? true);
            setLanguage(data.settings.language ?? "English");
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading settings:", error);
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to Firebase
  const saveSettings = async (key, value) => {
    if (!userId) return;

    try {
      setSaving(true);
      const docRef = doc(db, "users", userId);
      
      // Get current data first
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.exists() ? docSnap.data() : {};
      
      // Update settings
      const updatedSettings = {
        ...(currentData.settings || {}),
        [key]: value,
      };

      await updateDoc(docRef, {
        settings: updatedSettings,
        updatedAt: new Date().toISOString(),
      });

      // Show success for important changes
      if (key === "darkMode") {
        // You can implement dark mode toggle here
        // This would require app-wide theme context
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchChange = async (key, value, setter) => {
    setter(value);
    await saveSettings(key, value);
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear all cached data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear app cache
              const cacheDir = FileSystem.cacheDirectory;
              if (cacheDir) {
                await FileSystem.deleteAsync(cacheDir, { idempotent: true });
              }
              Alert.alert("Success", "Cache cleared successfully!");
            } catch (error) {
              Alert.alert("Error", "Failed to clear cache");
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      Alert.alert("Info", "Data export feature is being prepared. Please check back soon!");
      // In future: Export business data as CSV/JSON
    } catch (error) {
      Alert.alert("Error", "Failed to export data");
    }
  };

  const settingsSections = [
    {
      title: "Preferences",
      items: [
        {
          id: "notifications",
          label: "Push Notifications",
          icon: "bell",
          type: "switch",
          value: notifications,
          onChange: (value) => handleSwitchChange("notifications", value, setNotifications),
        },
        {
          id: "darkMode",
          label: "Dark Mode",
          icon: "moon",
          type: "switch",
          value: darkMode,
          onChange: (value) => handleSwitchChange("darkMode", value, setDarkMode),
        },
        {
          id: "autoSync",
          label: "Auto Sync",
          icon: "refresh-cw",
          type: "switch",
          value: autoSync,
          onChange: (value) => handleSwitchChange("autoSync", value, setAutoSync),
        },
        {
          id: "language",
          label: "Language",
          icon: "globe",
          type: "button",
          value: language,
          onPress: () => {
            Alert.alert(
              "Select Language",
              "Choose your preferred language",
              [
                { text: "English", onPress: () => handleSwitchChange("language", "English", setLanguage) },
                { text: "Hindi", onPress: () => handleSwitchChange("language", "Hindi", setLanguage) },
                { text: "Tamil", onPress: () => handleSwitchChange("language", "Tamil", setLanguage) },
                { text: "Gujarati", onPress: () => handleSwitchChange("language", "Gujarati", setLanguage) },
                { text: "Cancel", style: "cancel" },
              ]
            );
          },
        },
      ],
    },
    {
      title: "Data Management",
      items: [
        {
          id: "clearCache",
          label: "Clear Cache",
          icon: "trash-2",
          type: "button",
          onPress: handleClearCache,
        },
        {
          id: "exportData",
          label: "Export Data",
          icon: "download",
          type: "button",
          onPress: handleExportData,
        },
      ],
    },
    {
      title: "Legal",
      items: [
        {
          id: "privacy",
          label: "Privacy Policy",
          icon: "shield",
          type: "button",
          onPress: () => Alert.alert("Privacy Policy", "Privacy policy coming soon!"),
        },
        {
          id: "terms",
          label: "Terms of Service",
          icon: "file-text",
          type: "button",
          onPress: () => Alert.alert("Terms of Service", "Terms of service coming soon!"),
        },
        {
          id: "version",
          label: "App Version",
          icon: "info",
          type: "info",
          value: "1.0.0",
        },
      ],
    },
  ];

  const renderSettingItem = (item) => {
    if (item.type === "switch") {
      return (
        <View style={styles.settingItem} key={item.id}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Feather name={item.icon} size={20} color="#6B7280" />
            </View>
            <Text style={styles.settingLabel}>{item.label}</Text>
          </View>
          {saving ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Switch
              value={item.value}
              onValueChange={item.onChange}
              trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
              thumbColor="#FFFFFF"
            />
          )}
        </View>
      );
    }

    if (item.type === "info") {
      return (
        <View style={[styles.settingItem, styles.infoItem]} key={item.id}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Feather name={item.icon} size={20} color="#6B7280" />
            </View>
            <Text style={styles.settingLabel}>{item.label}</Text>
          </View>
          <Text style={styles.infoValue}>{item.value}</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <Feather name={item.icon} size={20} color="#6B7280" />
          </View>
          <Text style={styles.settingLabel}>{item.label}</Text>
        </View>
        {item.value && (
          <Text style={styles.itemValue}>{item.value}</Text>
        )}
        <Feather name="chevron-right" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {settingsSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map(renderSettingItem)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  infoItem: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    fontSize: 15,
    color: "#1a1a1a",
  },
  itemValue: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: "#6B7280",
  },
});