import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  SectionList,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import colors from "../../../styles/colors";
import LottieView from "lottie-react-native";
import animate from "../../../assets/json/animApartment.json";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const ApartmentInfoScreen = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 39.9334,
    longitude: 32.8597,
    latitudeDelta: 20,
    longitudeDelta: 20,
  });
  const [locations, setLocations] = useState([]);
  const [apartments, setApartments] = useState([]);
  const mapRef = useRef(null);
  const [houseNumber, setHouseNumber] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [suburb, setSuburb] = useState("");
  const [road, setRoad] = useState("");
  const [isAddingApartment, setIsAddingApartment] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);

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
            countrycodes: "tr",
            "accept-language": "tr",
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
    
    const cityCounty = address.county || address.city_district || address.town || address.municipality;
    
    console.log("Gelen adres bilgileri:", address); // Debug için

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }

    setSelectedLocation(newLocation);
    setSearchResults([]);
    setQuery(item.display_name);

    setCity(address.city || '');
    setCounty(cityCounty || '');
    setSuburb(address.suburb || address.neighbourhood || address.quarter || '');
    setRoad(address.road || '');

    setMapRegion({
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleMarkerDragEnd = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  const handleConfirm = () => {
    if (!selectedLocation || !query.trim()) {
      Alert.alert("Hata", "Adres seçimi veya konum işareti eksik!");
      return;
    }

    axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat: selectedLocation.latitude,
          lon: selectedLocation.longitude,
          format: "json",
          addressdetails: 1,
        },
      }
    ).then(response => {
      const address = response.data.address;
      const cityCounty = address.county || address.city_district || address.town || address.municipality;
      
      console.log("Reverse geocoding adres bilgileri:", address); // Debug için

      const promptFields = async () => {
        return new Promise((resolve) => {
          let remainingFields = 0;
          let tempInfo = {
            city: address.city || '',
            county: cityCounty || '',
            suburb: address.suburb || address.neighbourhood || address.quarter || '',
            road: address.road || '',
            house_number: houseNumber || '',
            building_name: buildingName || ''
          };

          if (!tempInfo.city) remainingFields++;
          if (!tempInfo.county) remainingFields++;
          if (!tempInfo.suburb) remainingFields++;
          if (!tempInfo.road) remainingFields++;
          if (!tempInfo.house_number) remainingFields++;
          if (!tempInfo.building_name) remainingFields++;

          if (remainingFields === 0) {
            resolve(tempInfo);
            return;
          }

          const checkComplete = () => {
            remainingFields--;
            if (remainingFields === 0) {
              resolve(tempInfo);
            }
          };

          if (!tempInfo.city) {
            Alert.prompt("İl", "Lütfen il bilgisini girin:", text => {
              tempInfo.city = text;
              checkComplete();
            });
          }
          if (!tempInfo.county) {
            Alert.prompt("İlçe", "Lütfen ilçe bilgisini girin:", text => {
              tempInfo.county = text;
              checkComplete();
            });
          }
          if (!tempInfo.suburb) {
            Alert.prompt("Mahalle", "Lütfen mahalle bilgisini girin:", text => {
              tempInfo.suburb = text;
              checkComplete();
            });
          }
          if (!tempInfo.road) {
            Alert.prompt("Cadde", "Lütfen cadde bilgisini girin:", text => {
              tempInfo.road = text;
              checkComplete();
            });
          }
          if (!tempInfo.house_number) {
            Alert.prompt("Bina Numarası", "Lütfen bina numarasını girin:", text => {
              tempInfo.house_number = text;
              checkComplete();
            });
          }
          if (!tempInfo.building_name) {
            Alert.prompt("Bina Adı", "Lütfen bina adını girin:", text => {
              tempInfo.building_name = text;
              checkComplete();
            });
          }
        });
      };

      promptFields().then(completedInfo => {
        const isDuplicate = apartments.some(apt => 
          (apt.building_name.toLowerCase() === completedInfo.building_name.toLowerCase()) ||
          (
            apt.road === completedInfo.road &&
            apt.house_number === completedInfo.house_number &&
            apt.suburb === completedInfo.suburb &&
            apt.county === completedInfo.county &&
            apt.city === completedInfo.city
          )
        );

        if (isDuplicate && !editingApartment) {
          Alert.alert(
            "Uyarı",
            "Bu adres veya bina adı zaten kayıtlı!",
            [
              {
                text: "Tamam",
                onPress: () => {
                  setQuery("");
                  setSelectedLocation(null);
                  setHouseNumber("");
                  setBuildingName("");
                  setIsAddingApartment(false);
                }
              }
            ]
          );
          return;
        }

        const apartmentInfo = {
          display_name: `${completedInfo.road}, ${completedInfo.suburb}, ${completedInfo.county}/${completedInfo.city}`,
          ...completedInfo,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        };

        if (editingApartment) {
          const updatedApartments = apartments.filter(a => a !== editingApartment);
          setApartments([...updatedApartments, apartmentInfo]);
          setEditingApartment(null);
        } else {
          setApartments([...apartments, apartmentInfo]);
        }

        setLocations([...locations, selectedLocation]);
        setQuery("");
        setSelectedLocation(null);
        setHouseNumber("");
        setBuildingName("");
        setCity("");
        setCounty("");
        setSuburb("");
        setRoad("");
        setIsAddingApartment(false);
        Alert.alert("Başarılı", editingApartment ? "Apartman bilgileri güncellendi!" : "Yeni apartman eklendi!");
      });
    }).catch(error => {
      console.error("Adres alma hatası:", error);
      Alert.alert("Hata", "Adres bilgisi alınamadı.");
    });
  };

  const handleDeleteApartment = (apartment) => {
    Alert.alert(
      "Apartman Sil",
      "Bu apartmanı silmek istediğinizden emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            const newApartments = apartments.filter(a => a !== apartment);
            setApartments(newApartments);
          }
        }
      ]
    );
  };

  const handleUpdateApartment = (apartment) => {
    setIsAddingApartment(true);
    setEditingApartment(apartment);
    
    setSelectedLocation({
      latitude: apartment.latitude,
      longitude: apartment.longitude
    });
    setQuery(apartment.display_name);
    setCity(apartment.city);
    setCounty(apartment.county);
    setSuburb(apartment.suburb);
    setRoad(apartment.road);
    setHouseNumber(apartment.house_number);
    setBuildingName(apartment.building_name);
    
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: apartment.latitude,
          longitude: apartment.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  const sections = [];

  sections.push({
    title: 'APARTMANLAR',
    data: apartments.length > 0 ? apartments : [{ type: 'empty' }],
    renderItem: ({ item }) => {
      if (item.type === 'empty') {
        return (
          <View style={styles.emptyApartments}>
            <Text style={styles.emptyText}>Henüz apartman eklenmedi</Text>
          </View>
        );
      }
      return (
        <View style={styles.apartmentItem}>
          <View style={styles.apartmentContent}>
            <View style={styles.apartmentInfo}>
              <Text style={styles.buildingName}>{item.building_name}</Text>
              <Text style={styles.addressDetails}>
                {`${item.road}, No: ${item.house_number}`}
              </Text>
              <Text style={styles.addressDetails}>
                {`${item.suburb}, ${item.county}/${item.city}`}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleUpdateApartment(item)}
              >
                <MaterialIcons name="edit" size={24} color={colors.danger} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteApartment(item)}
              >
                <MaterialIcons name="delete" size={24} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }
  });

  if (isAddingApartment) {
    sections.push(
      {
        title: 'ADRES ARA',
        data: [{ type: 'search' }],
        renderItem: () => (
          <View style={styles.searchSection}>
            <TextInput
              style={styles.input}
              placeholder="Adres Ara"
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                fetchAddressSuggestions(text);
              }}
            />
            {searchResults.length > 0 && (
              <FlatList
                nestedScrollEnabled
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
          </View>
        )
      },
      {
        title: '',
        data: [{ type: 'map' }],
        renderItem: () => (
          <View style={styles.mapSection}>
            <MapView
              ref={mapRef}
              style={styles.map}
              region={mapRegion}
              onRegionChangeComplete={(region) => setMapRegion(region)}
              onPress={handleMapPress}
            >
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                />
              )}
            </MapView>
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>
                Konumu Onayla
              </Text>
            </TouchableOpacity>
          </View>
        )
      }
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        <ScrollView 
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <LottieView source={animate} autoPlay loop style={styles.animation} />
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Apartman Bilgileri</Text>
              </View>
            </View>
            
            <View style={styles.contentContainer}>
              <SectionList
                scrollEnabled={false}
                sections={sections}
                renderSectionHeader={({ section: { title } }) => {
                  if (title === '') return null;
                  
                  return (
                    <View style={styles.sectionHeaderContainer}>
                      <Text style={styles.sectionHeaderText}>{title}</Text>
                      {title === 'APARTMANLAR' && <View style={styles.sectionHeaderLine} />}
                    </View>
                  );
                }}
                stickySectionHeadersEnabled={false}
                keyExtractor={(item, index) => index.toString()}
                SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
                contentContainerStyle={styles.scrollContent}
              />
            </View>
          </View>
        </ScrollView>

        {!isAddingApartment && (
          <TouchableOpacity 
            style={styles.addApartmentButton}
            onPress={() => setIsAddingApartment(true)}
          >
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: { 
    flex: 1,
    backgroundColor: colors.white,
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 80,
  },
  animation: { 
    width: 200, 
    height: 200,
    position: 'relative',
  },
  scrollContent: {
    paddingTop: 5,
  },
  searchSection: {
    padding: 5,
    backgroundColor: colors.white,
    borderRadius: 12,
   
  },
  mapSection: {
    height: 400,
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#F8F9FA',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    backgroundColor: '#F8F9FA',
    marginTop: 2,
    borderRadius: 8,
  },
  map: {
    flex: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    padding: 15,
    alignItems: "center",
    borderRadius: 8,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  confirmButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  sectionHeaderContainer: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 1,
    flex: 1,
  },
  sectionHeaderLine: {
    height: 3,
    width: 30,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginLeft: 10,
  },
  sectionSeparator: {
    height: 20,
  },
  apartmentItem: {
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  addressDetails: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 2,
  },
  emptyApartments: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    margin: 10,
   
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkGray,
    fontStyle: 'italic',
  },
  addApartmentButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.black,
    textAlign: "center",
  },
  apartmentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  apartmentInfo: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: colors.textPrimary,
    marginLeft: 18,
  },
  deleteButton: {
    backgroundColor: '#ffebee', // Hafif kırmızı arka plan
  },
});

export default ApartmentInfoScreen;
