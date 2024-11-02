import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';

const AddApartmentScreen = () => {
  const [apartmentName, setApartmentName] = useState('');
  const [apartmentUnits, setApartmentUnits] = useState('');
  const [location, setLocation] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
  });
  const navigation = useNavigation();

  const handleAddApartment = () => {
    if (!apartmentName || !apartmentUnits) {
      Alert.alert('Eksik Bilgi', 'Lütfen apartman adı ve daire sayısını girin.');
      return;
    }

    const newApartment = {
      id: uuidv4(),
      name: apartmentName,
      units: apartmentUnits,
      location,
    };
    navigation.navigate('CreateAccountScreen', { newApartment });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Apartman Konumu Seç</Text>

      {/* Google Places Autocomplete */}
      <GooglePlacesAutocomplete
        placeholder="Şehir veya ilçe arayın"
        fetchDetails={true} // fetchDetails'i true yaparak ayrıntıları almasını sağlayın
        onPress={(data, details = null) => {
          if (details) {
            const { lat, lng } = details.geometry.location;
            setLocation({ latitude: lat, longitude: lng });
          }
        }}
        query={{
          key: 'YOUR_GOOGLE_API_KEY', // Buraya API anahtarınızı ekleyin
          language: 'tr',
        }}
        styles={{
          container: { flex: 0, zIndex: 1 },
          textInputContainer: { width: '100%' },
          textInput: {
            height: 40,
            borderRadius: 5,
            paddingVertical: 5,
            paddingHorizontal: 10,
            fontSize: 16,
          },
          listView: {
            position: 'absolute',
            top: 60,
            zIndex: 2,
            backgroundColor: '#fff',
          },
        }}
      />

      <MapView
        style={styles.map}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={(e) => setLocation(e.nativeEvent.coordinate)}
      >
        <Marker coordinate={location} />
      </MapView>
      <Text style={styles.coordinates}>Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}</Text>

      <TouchableOpacity style={styles.button} onPress={handleAddApartment}>
        <Text style={styles.buttonText}>Ekle</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#4B59CD', marginVertical: 10 },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginTop: 70,
  },
  coordinates: {
    fontSize: 14,
    color: '#4B59CD',
    textAlign: 'center',
    marginBottom: 15,
  },
  button: { backgroundColor: '#4B59CD', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default AddApartmentScreen;
