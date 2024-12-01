import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import colors from "../../../styles/colors";
import LottieView from "lottie-react-native";
import animate from "../../../assets/json/animApartment.json";

const ApartmentInfoScreen = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [locations, setLocations] = useState([]);
  const [apartments, setApartments] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    if (selectedLocation) {
      setMapRegion({
        ...mapRegion,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
    }
  }, [selectedLocation]);

  const fetchAddressSuggestions = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: query,
            format: "json",
            addressdetails: 1,
            limit: 5,
          },
        }
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Adres öneri hatası:", error);
    }
  };

  const handleAddressSelect = (item) => {
    const { lat, lon, address } = item;
    const newLocation = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    
    const { city, county, suburb, road } = address;

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...newLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }

    setSelectedLocation(newLocation);
    setSearchResults([]);
    setQuery(item.display_name);

    console.log("İl:", city);
    console.log("İlçe:", county);
    console.log("Mahalle:", suburb);
    console.log("Cadde:", road);
  };

  const handleMarkerDragEnd = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirm = () => {
    if (!selectedLocation || !query.trim()) {
      Alert.alert("Hata", "Adres seçimi veya konum işareti eksik!");
      return;
    }
    const newLocation = {
      display_name: query,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    };
    setLocations([...locations, newLocation]);
    setApartments([...apartments, newLocation]);
    setQuery("");
    setSelectedLocation(null);
    Alert.alert("Başarılı", "Adres ve konum kaydedildi.");
  };

  return (
    <View style={styles.container}>
      {/* Animasyon */}
      <LottieView source={animate} autoPlay loop style={styles.animation} />

      {/* Arama Alanı */}
      <TextInput
        style={styles.input}
        placeholder="Adres Ara"
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          fetchAddressSuggestions(text);
        }}
      />

      {/* Adres Önerileri */}
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleAddressSelect(item)}
            >
              <Text>{item.display_name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Harita */}
      <MapView
        ref={mapRef}
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={(region) => setMapRegion(region)}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        )}
      </MapView>

      {/* Onayla */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Konumu Onayla</Text>
      </TouchableOpacity>

      {/* Apartmanlar Listesi */}
      <FlatList
        data={apartments}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.apartmentItem}>
            <Text>{item.display_name}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  animation: { width: 200, height: 200, alignSelf: "center", marginTop: 50 },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    margin: 10,
    borderRadius: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  map: {
    flex: 3,
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    padding: 15,
    alignItems: "center",
    margin: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  apartmentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
});

export default ApartmentInfoScreen;
