import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import { Feather } from "@expo/vector-icons";

export default function StateList() {
  const { state } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: state });
    fetchBusinessesByState();
  }, [state]);

  const fetchBusinessesByState = async () => {
    try {
      const snapshot = await getDocs(collection(db, "businesses"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      const filtered = data.filter(
        (business) => business.state === state || business.State === state
      );
      
      setBusinesses(filtered);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBusinessesByState();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading businesses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.resultCount}>{businesses.length} businesses in {state}</Text>
      </View>

      <FlatList
        data={businesses}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/businessdetail/${item.id}`)}
            style={styles.businessCard}
          >
            <Text style={styles.businessName}>{item.name}</Text>
            <Text style={styles.businessCategory}>{item.category || "Textile"}</Text>
            <Text style={styles.businessLocation}>
              {item.city || ""}, {item.state || ""}
            </Text>
            {item.phone && item.phone !== "Not available" && (
              <Text style={styles.businessPhone}>{item.phone}</Text>
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={44} color="#D1D5DB" />
            <Text style={styles.emptyText}>No businesses found in {state}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  resultCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 80,
  },
  businessCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  businessName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  businessCategory: {
    fontSize: 14,
    color: "#3B82F6",
    marginTop: 2,
  },
  businessLocation: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  businessPhone: {
    fontSize: 14,
    color: "#10B981",
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
};