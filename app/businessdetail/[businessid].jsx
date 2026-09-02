import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Linking,
  Image,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// SINGLE IMAGE FOR ALL BUSINESSES
const SINGLE_IMAGE_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4gxCoOkmds3FFDABOAPs6qfBqLSVnxkFG-wuwHJ6Ygw&s=10";

export default function BusinessDetail() {
  const { businessid } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, [businessid]);

  const fetchBusiness = async () => {
    try {
      const docRef = doc(db, "businesses", businessid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBusiness({ id: docSnap.id, ...data });
        navigation.setOptions({
          title: data.name || "Business Detail",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ padding: 8, marginLeft: 4 }}>
              <Feather name="arrow-left" size={24} color="#000000" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => setIsLiked(!isLiked)} style={{ padding: 8, marginRight: 4 }}>
              <Feather name={isLiked ? "heart" : "heart"} size={24} color={isLiked ? "#EF4444" : "#6B7280"} />
            </Pressable>
          ),
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching business:", error);
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (business?.phone && business.phone !== "Not available") {
      Linking.openURL(`tel:${business.phone}`);
    }
  };

  const handleEmail = () => {
    if (business?.email && business.email !== "Not available") {
      Linking.openURL(`mailto:${business.email}`);
    }
  };

  const handleLocation = () => {
    if (business?.address && business.address !== "Not available") {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;
      Linking.openURL(url);
    }
  };

  const handleWebsite = () => {
    if (business?.website && business.website !== "") {
      Linking.openURL(business.website);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading business details...</Text>
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-triangle" size={44} color="#EF4444" />
        <Text style={styles.errorText}>Business not found</Text>
      </View>
    );
  }

  const hasPhone = business.phone && business.phone !== "Not available";
  const hasEmail = business.email && business.email !== "Not available";
  const hasAddress = business.address && business.address !== "Not available";
  const hasWebsite = business.website && business.website !== "";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image - Single Image for All */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: SINGLE_IMAGE_URL }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.4)"]}
          style={styles.imageGradient}
        />
      </View>

      {/* Name & Like Button */}
      <View style={styles.nameContainer}>
        <View style={styles.nameWrapper}>
          <Text style={styles.businessName}>{business.name || "Business"}</Text>
          <Text style={styles.businessCategory}>{business.category || "Textile"}</Text>
        </View>
        <Pressable onPress={() => setIsLiked(!isLiked)} style={styles.likeButton}>
          <Feather name={isLiked ? "heart" : "heart"} size={28} color={isLiked ? "#EF4444" : "#6B7280"} />
        </Pressable>
      </View>

      {/* Contact Person */}
      {business.contactPerson && business.contactPerson !== "Not specified" && (
        <View style={styles.contactPersonRow}>
          <Feather name="user" size={16} color="#6B7280" />
          <Text style={styles.contactPersonText}>{business.contactPerson}</Text>
        </View>
      )}

      {/* Details Section */}
      <View style={styles.detailsSection}>
        {business.productRange && business.productRange !== "Not specified" && (
          <View style={styles.detailCard}>
            <View style={styles.detailIconContainer}>
              <View style={[styles.detailIconBg, { backgroundColor: "#F3E8FF" }]}>
                <Feather name="package" size={20} color="#8B5CF6" />
              </View>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Product Range</Text>
              <Text style={styles.detailValue}>{business.productRange}</Text>
            </View>
          </View>
        )}

        <View style={styles.detailCard}>
          <View style={styles.detailIconContainer}>
            <View style={[styles.detailIconBg, { backgroundColor: "#EFF6FF" }]}>
              <Feather name="phone" size={20} color="#3B82F6" />
            </View>
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{business.phone || "Not available"}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailIconContainer}>
            <View style={[styles.detailIconBg, { backgroundColor: "#ECFDF5" }]}>
              <Feather name="mail" size={20} color="#10B981" />
            </View>
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{business.email || "Not available"}</Text>
          </View>
        </View>

        {hasWebsite && (
          <View style={styles.detailCard}>
            <View style={styles.detailIconContainer}>
              <View style={[styles.detailIconBg, { backgroundColor: "#FEF3C7" }]}>
                <Feather name="globe" size={20} color="#F59E0B" />
              </View>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Website</Text>
              <Pressable onPress={handleWebsite}>
                <Text style={[styles.detailValue, styles.websiteLink]} numberOfLines={1}>
                  {business.website}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.detailCard}>
          <View style={styles.detailIconContainer}>
            <View style={[styles.detailIconBg, { backgroundColor: "#FEF2F2" }]}>
              <Feather name="map-pin" size={20} color="#EF4444" />
            </View>
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailValue}>{business.address || "Not available"}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailIconContainer}>
            <View style={[styles.detailIconBg, { backgroundColor: "#F3E8FF" }]}>
              <Feather name="home" size={20} color="#8B5CF6" />
            </View>
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>City</Text>
            <Text style={styles.detailValue}>{business.city || "Not available"}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailIconContainer}>
            <View style={[styles.detailIconBg, { backgroundColor: "#FDF2F8" }]}>
              <Feather name="flag" size={20} color="#EC4899" />
            </View>
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>State</Text>
            <Text style={styles.detailValue}>{business.state || "Not available"}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {hasPhone && (
          <Pressable onPress={handleCall} style={styles.actionButton}>
            <LinearGradient colors={["#3B82F6", "#2563EB"]} style={styles.actionGradient}>
              <Feather name="phone" size={18} color="#FFFFFF" />
              <Text style={styles.actionText}>Call</Text>
            </LinearGradient>
          </Pressable>
        )}
        {hasEmail && (
          <Pressable onPress={handleEmail} style={styles.actionButton}>
            <LinearGradient colors={["#10B981", "#059669"]} style={styles.actionGradient}>
              <Feather name="mail" size={18} color="#FFFFFF" />
              <Text style={styles.actionText}>Email</Text>
            </LinearGradient>
          </Pressable>
        )}
        {hasAddress && (
          <Pressable onPress={handleLocation} style={styles.actionButton}>
            <LinearGradient colors={["#8B5CF6", "#7C3AED"]} style={styles.actionGradient}>
              <Feather name="map-pin" size={18} color="#FFFFFF" />
              <Text style={styles.actionText}>Location</Text>
            </LinearGradient>
          </Pressable>
        )}
        {hasWebsite && (
          <Pressable onPress={handleWebsite} style={styles.actionButton}>
            <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.actionGradient}>
              <Feather name="globe" size={18} color="#FFFFFF" />
              <Text style={styles.actionText}>Website</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = {
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  imageContainer: {
    position: "relative",
    height: 200,
    width: "100%",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  nameWrapper: {
    flex: 1,
    marginRight: 12,
  },
  businessName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
  },
  businessCategory: {
    fontSize: 14,
    color: "#3B82F6",
    marginTop: 2,
  },
  likeButton: {
    padding: 4,
  },
  contactPersonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  contactPersonText: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  detailIconContainer: {
    marginRight: 16,
  },
  detailIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 14,
    color: "#000000",
    marginTop: 2,
  },
  websiteLink: {
    color: "#3B82F6",
    textDecorationLine: "underline",
  },
  actionSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 6,
    marginVertical: 6,
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
};