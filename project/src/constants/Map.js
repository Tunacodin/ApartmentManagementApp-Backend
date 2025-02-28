import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function Map() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Kullanıcının mevcut konumunu al
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "İzin Gerekli",
          "Bu özelliği kullanabilmek için konum izni vermelisiniz."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  return (
    <View style={styles.container}>
      {currentLocation ? (
        <MapView
          style={styles.map}
          initialRegion={currentLocation}
          onPress={handleMapPress}
        >
          {/* Kullanıcının mevcut konumunu işaretle */}
          <Marker
            coordinate={currentLocation}
            title="Mevcut Konum"
            pinColor="blue"
          />

          {/* Harita üzerinde seçilen konumu işaretle */}
          {selectedLocation && (
            <Marker coordinate={selectedLocation} title="Seçilen Konum" />
          )}
        </MapView>
      ) : (
        <Text style={styles.loadingText}>Konum alınıyor...</Text>
      )}

      {selectedLocation && (
        <View style={styles.infoContainer}>
          <Text>Latitude: {selectedLocation.latitude}</Text>
          <Text>Longitude: {selectedLocation.longitude}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingText: {
    flex: 1,
    textAlign: "center",
    marginTop: "50%",
    fontSize: 18,
  },
  infoContainer: {
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
});
