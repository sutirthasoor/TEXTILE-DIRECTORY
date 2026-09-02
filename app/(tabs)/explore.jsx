import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get('window');

// Recent searches
const recentSearches = [
  "Textile Mills",
  "Garment Exporters",
  "Yarn Spinning",
  "Fabric Weavers",
  "Denim Manufacturers",
];

export default function Explore() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [stats, setStats] = useState({ total: 0 });
  const [recentSearchesList, setRecentSearchesList] = useState(recentSearches);
  const router = useRouter();

  const fetchBusinesses = async () => {
    try {
      const snapshot = await getDocs(collection(db, "businesses"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBusinesses(data);
      setFiltered(data);
      setStats({ total: data.length });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBusinesses();
    }, [])
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFiltered(businesses);
    } else {
      const results = businesses.filter(
        (b) =>
          b.name?.toLowerCase().includes(text.toLowerCase()) ||
          b.city?.toLowerCase().includes(text.toLowerCase()) ||
          b.state?.toLowerCase().includes(text.toLowerCase()) ||
          b.category?.toLowerCase().includes(text.toLowerCase()) ||
          b.productRange?.toLowerCase().includes(text.toLowerCase()) ||
          b.contactPerson?.toLowerCase().includes(text.toLowerCase())
      );
      setFiltered(results);
    }
  };

  const handleRecentSearchPress = (searchTerm) => {
    setSearchQuery(searchTerm);
    handleSearch(searchTerm);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBusinesses();
    setRefreshing(false);
  };

  const renderBusinessCard = (item) => (
    <Pressable
      key={item.id}
      onPress={() => router.push(`/businessdetail/${item.id}`)}
      style={styles.businessCard}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Text style={styles.businessName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {item.category.substring(0, 12)}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.businessCategory}>
        {item.category || "Textile"}
      </Text>
      
      <Text style={styles.businessLocation}>
        {item.city || ""}{item.state ? `, ${item.state}` : ""}
      </Text>
      
      {item.phone && item.phone !== "Not available" && (
        <Text style={styles.businessPhone}>
          {item.phone}
        </Text>
      )}
      
      {item.productRange && item.productRange !== "Not specified" && (
        <Text style={styles.productRange} numberOfLines={1}>
          {item.productRange}
        </Text>
      )}
    </Pressable>
  );

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
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJ6HmhOgmMw7-9OXkN5BtGeoVHGxRCkynSE3uq1NQ0_w&s=10" }}
            style={styles.heroImage}
            imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.5)"]}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Explore</Text>
                <Text style={styles.heroSubtitle}>
                  {stats.total} Businesses • Discover textile companies
                </Text>
              </View>
            </LinearGradient>
          </ImageBackground>
          
          {/* Floating Search Bar */}
          <View style={styles.floatingSearchContainer}>
            <View style={styles.floatingSearchBar}>
              <Feather name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.floatingSearchInput}
                placeholder="Search businesses, cities, categories..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => handleSearch("")}>
                  <Feather name="x" size={20} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
          </View>
        </View>

        

        {/* Recent Searches */}
        {recentSearchesList.length > 0 && searchQuery.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <View style={styles.recentSearchContainer}>
              {recentSearchesList.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentSearchChip}
                  onPress={() => handleRecentSearchPress(item)}
                >
                  <Feather name="clock" size={14} color="#6B7280" />
                  <Text style={styles.recentSearchText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search Results */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery.length > 0 ? `Results (${filtered.length})` : "All Businesses"}
            </Text>
            {filtered.length > 0 && searchQuery.length > 0 && (
              <Text style={styles.resultCount}>{filtered.length} found</Text>
            )}
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="search" size={44} color="#D1D5DB" />
              <Text style={styles.emptyText}>No businesses found</Text>
              <Text style={styles.emptySubText}>Try a different search term</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderBusinessCard(item)}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
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
  heroContainer: {
    position: "relative",
    height: height * 0.40,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  heroGradient: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 110,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  floatingSearchContainer: {
    position: "absolute",
    bottom: 16,
    left: 20,
    right: 20,
    zIndex: 50,
  },
  floatingSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  floatingSearchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: "#000000",
  },
  statsMiniContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  statsMiniCard: {
    alignItems: "center",
  },
  statsMiniValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  statsMiniLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  resultCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  recentSearchContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 4,
  },
  recentSearchChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  recentSearchText: {
    fontSize: 13,
    color: "#1a1a1a",
  },
  listContent: {
    paddingBottom: 20,
  },
  businessCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  businessName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: "#3B82F6",
    fontWeight: "500",
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
  productRange: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
};