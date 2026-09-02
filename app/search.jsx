import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../configs/FirebaseConfig";
import { Feather } from "@expo/vector-icons";

export default function Search() {
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const snapshot = await getDocs(collection(db, "businesses"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBusinesses(data);
      setFiltered(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFiltered(businesses);
    } else {
      const results = businesses.filter(
        (b) =>
          b.name?.toLowerCase().includes(text.toLowerCase()) ||
          b.city?.toLowerCase().includes(text.toLowerCase()) ||
          b.category?.toLowerCase().includes(text.toLowerCase())
      );
      setFiltered(results);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => handleSearch("")}>
            <Feather name="x" size={20} color="#9CA3AF" />
          </Pressable>
        )}
      </View>

      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>{filtered.length} results</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/businessdetail/${item.id}`)}
            style={styles.businessCard}
          >
            <Text style={styles.businessName}>{item.name}</Text>
            <Text style={styles.businessCategory}>{item.category}</Text>
            <Text style={styles.businessLocation}>
              {item.city}, {item.state}
            </Text>
            <Text style={styles.businessPhone}>{item.phone}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="search" size={44} color="#D1D5DB" />
            <Text style={styles.emptyText}>No businesses found</Text>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: "#000000",
  },
  resultHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  listContent: {
    paddingHorizontal: 20,
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