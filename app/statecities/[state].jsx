import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Dimensions,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

export default function StateCities() {
  const { state } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cities, setCities] = useState([]);
  const [cityCounts, setCityCounts] = useState({});

  useEffect(() => {
    navigation.setOptions({ title: state });
    fetchCities();
  }, [state]);

  const fetchCities = async () => {
    try {
      const snapshot = await getDocs(collection(db, "businesses"));
      const data = snapshot.docs.map((doc) => doc.data());
      
      const counts = {};
      const uniqueCities = new Set();
      
      data.forEach(business => {
        const businessState = business.state || business.State || '';
        const city = business.city || business.City || '';
        
        if (businessState === state && city && city !== 'Not available' && city !== '') {
          uniqueCities.add(city);
          counts[city] = (counts[city] || 0) + 1;
        }
      });
      
      setCityCounts(counts);
      setCities(Array.from(uniqueCities).sort());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCities();
    setRefreshing(false);
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
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cities in {state}</Text>
        <Text style={styles.headerSubtitle}>{cities.length} cities with businesses</Text>
      </View>

      <View style={styles.gridContainer}>
        {cities.map((city) => (
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 16,
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
};