import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  TextInput,
  Dimensions,
  FlatList,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get('window');

// Category data with icons
const categories = [
  { name: "SPINNING", icon: "activity", color: "#3B82F6" },
  { name: "GARMENTS", icon: "shopping-bag", color: "#10B981" },
  { name: "HOME TEXTILES", icon: "home", color: "#8B5CF6" },
  { name: "WEAVING", icon: "grid", color: "#EC4899" },
  { name: "KNITTING", icon: "feather", color: "#EF4444" },
  { name: "DENIM", icon: "layers", color: "#F59E0B" },
  { name: "DYENG", icon: "droplet", color: "#6366F1" },
  { name: "TECHNICAL", icon: "cpu", color: "#14B8A6" },
];

// Quick stats for the dashboard
const quickStats = [
  { label: "Businesses", key: "total", icon: "briefcase", color: "#3B82F6" },
  { label: "Cities", key: "cities", icon: "map-pin", color: "#8B5CF6" },
  { label: "States", key: "states", icon: "map", color: "#EC4899" },
];

// Recent searches (store in state)
const recentSearches = [
  "Textile Mills",
  "Garment Exporters",
  "Yarn Spinning",
  "Fabric Weavers",
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [stats, setStats] = useState({ total: 0, cities: 0, states: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [recentSearchesList, setRecentSearchesList] = useState(recentSearches);
  const router = useRouter();

  const fetchBusinesses = async () => {
    try {
      console.log("🔄 Fetching ALL businesses from Firebase...");
      const snapshot = await getDocs(collection(db, "businesses"));
      console.log("📊 Total businesses in Firebase:", snapshot.size);
      
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setBusinesses(data);
      setFilteredBusinesses(data);
      setFeaturedBusinesses(data.slice(0, 6));
      
      const uniqueCities = new Set();
      const uniqueStates = new Set();
      
      data.forEach(b => {
        const city = b.city || b.City || '';
        if (city && city !== 'Not available' && city !== '') {
          uniqueCities.add(city);
        }
        const state = b.state || b.State || '';
        if (state && state !== 'Not available' && state !== '') {
          uniqueStates.add(state);
        }
      });
      
      setStats({
        total: data.length,
        cities: uniqueCities.size || 0,
        states: uniqueStates.size || 0,
      });
      
      setLoading(false);
      console.log(`📊 Total: ${data.length}, Cities: ${uniqueCities.size}, States: ${uniqueStates.size}`);
      
    } catch (error) {
      console.error("❌ Error fetching businesses:", error);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBusinesses();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBusinesses();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredBusinesses(businesses);
    } else {
      const results = businesses.filter(
        (b) =>
          b.name?.toLowerCase().includes(text.toLowerCase()) ||
          b.city?.toLowerCase().includes(text.toLowerCase()) ||
          b.state?.toLowerCase().includes(text.toLowerCase()) ||
          b.category?.toLowerCase().includes(text.toLowerCase()) ||
          b.productRange?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredBusinesses(results);
    }
  };

  const handleRecentSearchPress = (searchTerm) => {
    setSearchQuery(searchTerm);
    handleSearch(searchTerm);
  };

  const renderCategoryItem = ({ item }) => (
    <Pressable
      onPress={() => router.push(`/businesslist/${encodeURIComponent(item.name)}`)}
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: "#F0F0F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
        width: (width - 48) / 4,
        marginBottom: 8,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: item.color + "15",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 6,
        }}
      >
        <Feather name={item.icon} size={20} color={item.color} />
      </View>
      <Text
        style={{
          fontSize: 10,
          color: "#1a1a1a",
          textAlign: "center",
          fontWeight: "500",
        }}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </Pressable>
  );

  const renderFeaturedCard = (business) => (
    <Pressable
      key={business.id}
      onPress={() => router.push(`/businessdetail/${business.id}`)}
      style={{
        width: width * 0.4,
        height: width * 0.4,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: "#F0F0F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        justifyContent: "space-between",
      }}
    >
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#000000", flex: 1 }} numberOfLines={2}>
            {business.name}
          </Text>
        </View>
        <Text style={{ fontSize: 11, color: "#3B82F6", marginTop: 4 }} numberOfLines={1}>
          {business.category || "Textile"}
        </Text>
        <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }} numberOfLines={1}>
          {business.city || ""}{business.state ? `, ${business.state}` : ""}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
        <Feather name="phone" size={12} color="#10B981" />
        <Text style={{ fontSize: 10, color: "#10B981", marginLeft: 4 }} numberOfLines={1}>
          {business.phone && business.phone !== "Not available" ? business.phone : "No phone"}
        </Text>
      </View>
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
   <ScrollView
  style={styles.container}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />
  }
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 60 }}  // ← Add this
>
      {/* Hero Image Section */}
      <View style={styles.heroContainer}>
        <ImageBackground
          source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpmdzrfs__EgMGyUvOWpRAoLGUvOhGnlc1derSJ4H_TQ&s=10" }}
          style={styles.heroImage}
          imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.5)"]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Indian Textile Directory</Text>
              <Text style={styles.heroSubtitle}>
                {stats.total} Businesses • {stats.cities} Cities • {stats.states} States
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

      

      {/* Categories Grid (4x2) */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Categories</Text>
  <FlatList
    key="categories-grid"  // ← ADD THIS
    data={categories}
    renderItem={renderCategoryItem}
    keyExtractor={(item) => item.name}
    numColumns={4}
    scrollEnabled={false}
    contentContainerStyle={styles.categoriesGrid}
    columnWrapperStyle={styles.categoryRow}
  />
</View>
      {/* Recent Searches */}
      {recentSearchesList.length > 0 && (
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

      <View style={{ height: 20 }} />
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
  viewAllText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  categoriesGrid: {
    paddingVertical: 4,
  },
  categoryRow: {
    justifyContent: "space-between",
  },
  carouselContainer: {
    paddingVertical: 4,
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
};