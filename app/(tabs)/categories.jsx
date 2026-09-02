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
  { name: "DYEING", icon: "droplet", color: "#6366F1" },
  { name: "TECHNICAL", icon: "cpu", color: "#14B8A6" },
  { name: "FABRICS", icon: "file-text", color: "#FF6B6B" },
  { name: "YARN", icon: "link", color: "#845EC2" },
  { name: "MACHINERY", icon: "settings", color: "#FFC75F" },
  { name: "TEXTILE PARKS", icon: "map", color: "#4FFBDF" },
];

// Recent searches
const recentSearches = [
  "SPINNING",
  "GARMENTS",
  "HOME TEXTILES",
  "WEAVING",
];

export default function Categories() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [stats, setStats] = useState({ total: 0, categories: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [recentSearchesList, setRecentSearchesList] = useState(recentSearches);
  const router = useRouter();

  const fetchCategoryCounts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "businesses"));
      const data = snapshot.docs.map((doc) => doc.data());
      
      const counts = {};
      const uniqueCategories = new Set();
      
      data.forEach(business => {
        const category = business.category || business.Category || '';
        if (category && category !== 'Not specified' && category !== '') {
          uniqueCategories.add(category);
          counts[category] = (counts[category] || 0) + 1;
        }
      });
      
      setCategoryCounts(counts);
      
      // Count all categories (including ones from database)
      const allCategories = new Set();
      // Add predefined categories
      categories.forEach(c => allCategories.add(c.name));
      // Add database categories
      Object.keys(counts).forEach(c => allCategories.add(c));
      
      setStats({
        total: data.length,
        categories: allCategories.size,
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategoryCounts();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategoryCounts();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const results = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCategories(results);
    }
  };

  const handleRecentSearchPress = (searchTerm) => {
    setSearchQuery(searchTerm);
    handleSearch(searchTerm);
  };

  const getCategoryCount = (categoryName) => {
    // Check if this category exists in database counts
    return categoryCounts[categoryName] || 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading categories...</Text>
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
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      {/* Hero Image Section */}
      <View style={styles.heroContainer}>
        <ImageBackground
          source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4gxCoOkmds3FFDABOAPs6qfBqLSVnxkFG-wuwHJ6Ygw&s=10" }}
          style={styles.heroImage}
          imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.5)"]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Categories</Text>
              <Text style={styles.heroSubtitle}>
                {stats.categories} Categories • {stats.total} Businesses
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
              placeholder="Search categories..."
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

      

      {/* Categories Grid */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Categories</Text>
          <Text style={styles.resultCount}>{filteredCategories.length} categories</Text>
        </View>

        <View style={styles.gridContainer}>
          {filteredCategories.map((category) => (
            <Pressable
              key={category.name}
              onPress={() => router.push(`/businesslist/${encodeURIComponent(category.name)}`)}
              style={styles.card}
            >
              <View style={styles.cardContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: category.color + "15" }
                  ]}
                >
                  <Feather name={category.icon} size={28} color={category.color} />
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {category.name}
                </Text>
                <Text style={styles.businessCount}>
                  {getCategoryCount(category.name)} businesses
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
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
  resultCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  card: {
    width: "46%",
    marginHorizontal: "2%",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginBottom: 4,
  },
  businessCount: {
    fontSize: 12,
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
};