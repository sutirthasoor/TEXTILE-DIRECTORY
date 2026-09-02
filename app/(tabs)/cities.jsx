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

// Recent searches
const recentSearches = [
  "Mumbai",
  "Surat",
  "Coimbatore",
  "Ahmedabad",
];

export default function Cities() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cities, setCities] = useState([]);
  const [cityCounts, setCityCounts] = useState({});
  const [stats, setStats] = useState({ total: 0, cities: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [recentSearchesList, setRecentSearchesList] = useState(recentSearches);
  const router = useRouter();

  const fetchCities = async () => {
    try {
      const snapshot = await getDocs(collection(db, "businesses"));
      const data = snapshot.docs.map((doc) => doc.data());
      
      const counts = {};
      const uniqueCities = new Set();
      
      data.forEach(business => {
        const city = business.city || business.City || '';
        if (city && city !== 'Not available' && city !== '') {
          uniqueCities.add(city);
          counts[city] = (counts[city] || 0) + 1;
        }
      });
      
      setCityCounts(counts);
      const sortedCities = Array.from(uniqueCities).sort();
      setCities(sortedCities);
      setFilteredCities(sortedCities);
      
      setStats({
        total: data.length,
        cities: uniqueCities.size,
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCities();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCities();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredCities(cities);
    } else {
      const results = cities.filter(
        (city) =>
          city.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCities(results);
    }
  };

  const handleRecentSearchPress = (searchTerm) => {
    setSearchQuery(searchTerm);
    handleSearch(searchTerm);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading cities...</Text>
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
          source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUwpWqCa629SBTaqZpBvdzYGhmi1jkMLczDWTJV2dTTA&s=10" }}
          style={styles.heroImage}
          imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.5)"]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Cities</Text>
              <Text style={styles.heroSubtitle}>
                {stats.cities} Cities • {stats.total} Businesses
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
              placeholder="Search cities..."
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

      

      {/* Cities Grid */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Cities</Text>
          <Text style={styles.resultCount}>{filteredCities.length} cities</Text>
        </View>

        <View style={styles.gridContainer}>
          {filteredCities.map((city) => (
            <Pressable
              key={city}
              onPress={() => router.push(`/citylist/${encodeURIComponent(city)}`)}
              style={styles.card}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Feather name="map-pin" size={28} color="#10B981" />
                </View>
                <Text style={styles.cityName} numberOfLines={2}>
                  {city}
                </Text>
                <Text style={styles.businessCount}>
                  {cityCounts[city] || 0} businesses
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
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cityName: {
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