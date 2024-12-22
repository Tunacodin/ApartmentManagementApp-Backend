import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  FlatList,
  Switch,
} from "react-native";
import axios from "axios";
import colors from "../../../styles/colors";
import { TextInput as PaperInput, Button as PaperButton } from "react-native-paper";
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import animate from "../../../assets/json/animApartment.json";

const API_URL = "http://172.16.1.155:5001/api/Building";

const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  }
});

api.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response.data);
    return response;
  },
  error => {
    console.log('Error:', error);
    return Promise.reject(error);
  }
);

const ApartmentInfoScreen = () => {
  const [apartmentName, setApartmentName] = useState("");
  const [numberOfFloors, setNumberOfFloors] = useState("");
  const [totalApartments, setTotalApartments] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [includedUtilities, setIncludedUtilities] = useState({
    electric: false,
    water: false,
    gas: false,
    internet: false
  });
  const [apartments, setApartments] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showApartmentDetails, setShowApartmentDetails] = useState(false);
  const [apartmentUnits, setApartmentUnits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const APARTMENT_TYPES = ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1"];

  const validateForm = () => {
    return (
      apartmentName.trim() &&
      !isNaN(numberOfFloors) && numberOfFloors > 0 &&
      !isNaN(totalApartments) && totalApartments > 0 &&
      city.trim() && district.trim() &&
      neighborhood.trim() && street.trim() && buildingNumber.trim() &&
      /^\d{5}$/.test(postalCode)
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Hata", "Lütfen tüm alanları eksiksiz doldurun.");
      return;
    }

    try {
      const apartmentData = {
        apartmentName,
        numberOfFloors: parseInt(numberOfFloors),
        totalApartments: parseInt(totalApartments),
        city,
        district,
        neighborhood,
        street,
        buildingNumber,
        postalCode,
        includedUtilities
      };

      setApartments([...apartments, apartmentData]);

      // Input alanlarını temizle
      setApartmentName("");
      setNumberOfFloors("");
      setTotalApartments("");
      setCity("");
      setDistrict("");
      setNeighborhood("");
      setStreet("");
      setBuildingNumber("");
      setPostalCode("");
      setIncludedUtilities({ electric: false, water: false, gas: false, internet: false });

      // Formu kapat ve liste görünümüne dön
      setShowForm(false);

      Alert.alert("Başarılı", "Apartman bilgileri kaydedildi");
    } catch (error) {
      console.error("API Hatası:", error);
      Alert.alert("Hata", "Apartman bilgileri kaydedilemedi");
    }
  };

  const handleAddApartmentDetails = (apartment) => {
    setSelectedApartment(apartment);
    const units = Array.from({ length: apartment.totalApartments }, (_, index) => ({
      unitNumber: index + 1,
      floor: 1,
      rentAmount: '',
      duesAmount: '',
      type: '2+1',
      hasBalcony: false,
      notes: '',
    }));
    setApartmentUnits(units);
    setShowApartmentDetails(true);
  };

  const handleNext = () => {
    if (currentIndex < apartmentUnits.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const isFormValid = () => {
    return apartmentUnits.every(unit => 
      unit.rentAmount && unit.duesAmount && unit.notes // Tüm dairelerin eksiksiz olup olmadığını kontrol et
    ) && apartmentUnits.length > 0; // Dairelerin varlığını kontrol et
  };

  const handleSave = () => {
    // Burada kaydetme işlemleri yapılacak
    Alert.alert("Başarılı", "Daire bilgileri kaydedildi.");
    // İsterseniz burada API çağrısı yapabilir veya durumu güncelleyebilirsiniz
  };

  const renderApartmentForm = () => (
    <View style={styles.formContainer}>
      <PaperInput
        mode="outlined"
        label="Apartman Adı"
        value={apartmentName}
        onChangeText={setApartmentName}
        style={styles.input}
      />

      <PaperInput
        mode="outlined"
        label="Kat Sayısı"
        value={numberOfFloors}
        onChangeText={setNumberOfFloors}
        keyboardType="numeric"
        style={styles.input}
      />

      <PaperInput
        mode="outlined"
        label="Toplam Daire Sayısı"
        value={totalApartments}
        onChangeText={setTotalApartments}
        keyboardType="numeric"
        style={styles.input}
      />

      <PaperInput
        mode="outlined"
        label="Şehir"
        value={city}
        onChangeText={setCity}
        style={styles.input}
      />

      <PaperInput
        mode="outlined"
        label="İlçe"
        value={district}
        onChangeText={setDistrict}
        style={styles.input}
      />

      <PaperInput
        mode="outlined"
        label="Mahalle"
        value={neighborhood}
        onChangeText={setNeighborhood}
        style={styles.input}
      />

      <PaperInput
        mode="outlined"
        label="Sokak"
        value={street}
        onChangeText={setStreet}
        style={styles.input}
      />

      <PaperInput
        mode="outlined"
        label="Bina No"
        value={buildingNumber}
        onChangeText={setBuildingNumber}
        style={styles.input}
      />

      <PaperInput
        mode="outlined"
        label="Posta Kodu"
        value={postalCode}
        onChangeText={setPostalCode}
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={styles.utilitiesContainer}>
        <Text style={styles.utilitiesTitle}>Dahil Hizmetler</Text>
        <View style={styles.checkboxGroup}>
          {Object.entries(includedUtilities).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.checkbox,
                value && styles.checkboxChecked
              ]}
              onPress={() => setIncludedUtilities({ ...includedUtilities, [key]: !value })}
            >
              <Text style={[
                styles.checkboxLabel,
                value && styles.checkboxLabelChecked
              ]}>
                {key === 'electric' ? 'Elektrik' :
                 key === 'water' ? 'Su' :
                 key === 'gas' ? 'Doğalgaz' : 'İnternet'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <PaperButton
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        labelStyle={styles.submitButtonLabel}
      >
        Kaydet
      </PaperButton>
    </View>
  );

  const renderApartmentDetails = () => (
    <View style={styles.detailsContainer}>
      

      {/* Butonlar ve FlatList'i kapsayan container */}
      <View style={styles.listContainer}>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handlePrevious} disabled={currentIndex === 0}>
            <MaterialIcons name="chevron-left" size={40} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.detailsTitle}>
            {selectedApartment.apartmentName} - Daire Bilgileri
          </Text>
          <TouchableOpacity onPress={handleNext} disabled={currentIndex === apartmentUnits.length - 1}>
            <MaterialIcons name="chevron-right" size={40} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={apartmentUnits}
          keyExtractor={(item) => item.unitNumber.toString()}
          renderItem={({ item, index }) => (
            <View style={[styles.unitCard, { display: index === currentIndex ? 'flex' : 'none' }]}>
              {/* Daire bilgileri ve diğer bileşenler burada */}
              <View style={styles.unitHeader}>
                <Text style={styles.unitTitle}>Daire {item.unitNumber}</Text>
                <View style={styles.counterContainer}>
                  <Text style={styles.counterLabel}>Kat</Text>
                  <View style={styles.counterButtons}>
                    <TouchableOpacity
                      onPress={() => {
                        const updatedUnits = apartmentUnits.map(unit =>
                          unit.unitNumber === item.unitNumber && item.floor > 1 // Kat sayısı 1'den büyükse azalt
                            ? { ...unit, floor: unit.floor - 1 }
                            : unit
                        );
                        setApartmentUnits(updatedUnits);
                      }}
                      style={styles.counterButton}
                    >
                      <Text style={styles.counterButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{item.floor}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const updatedUnits = apartmentUnits.map(unit =>
                          unit.unitNumber === item.unitNumber && item.floor < numberOfFloors // Kat sayısı, girilen kat sayısından azsa artır
                            ? { ...unit, floor: unit.floor + 1 }
                            : unit
                        );
                        setApartmentUnits(updatedUnits);
                      }}
                      style={styles.counterButton}
                    >
                      <Text style={styles.counterButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Daire Tipi Dropdown */}
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>Daire Tipi</Text>
                <PaperButton
                  mode="outlined"
                  onPress={() => {
                    Alert.alert(
                      'Daire Tipi Seçin',
                      '',
                      APARTMENT_TYPES.map(type => ({
                        text: type,
                        onPress: () => {
                          const updatedUnits = apartmentUnits.map(unit =>
                            unit.unitNumber === item.unitNumber
                              ? { ...unit, type }
                              : unit
                          );
                          setApartmentUnits(updatedUnits);
                        }
                      }))
                    );
                  }}
                  style={styles.dropdown}
                >
                  {item.type || 'Seçiniz'}
                </PaperButton>
              </View>

              {/* Balkon Toggle */}
              <View style={styles.balconyContainer}>
                <Text style={styles.balconyLabel}>Balkon</Text>
                <Switch
                  value={item.hasBalcony}
                  onValueChange={() => {
                    const updatedUnits = apartmentUnits.map(unit =>
                      unit.unitNumber === item.unitNumber
                        ? { ...unit, hasBalcony: !item.hasBalcony }
                        : unit
                    );
                    setApartmentUnits(updatedUnits);
                  }}
                  trackColor={{ false: colors.gray, true: colors.primary }}
                  thumbColor={item.hasBalcony ? colors.white : colors.gray}
                />
              </View>

              {/* Kira Miktarı */}
              <PaperInput
                mode="outlined"
                label="Kira Miktarı (₺)"
                value={item.rentAmount}
                onChangeText={(text) => {
                  const updatedUnits = apartmentUnits.map(unit =>
                    unit.unitNumber === item.unitNumber
                      ? { ...unit, rentAmount: text }
                      : unit
                  );
                  setApartmentUnits(updatedUnits);
                }}
                keyboardType="numeric"
                style={styles.unitInput}
                right={<PaperInput.Affix text="₺" />}
              />

              {/* Aidat Miktarı */}
              <PaperInput
                mode="outlined"
                label="Aidat Miktarı (₺)"
                value={item.duesAmount}
                onChangeText={(text) => {
                  const updatedUnits = apartmentUnits.map(unit =>
                    unit.unitNumber === item.unitNumber
                      ? { ...unit, duesAmount: text }
                      : unit
                  );
                  setApartmentUnits(updatedUnits);
                }}
                keyboardType="numeric"
                style={styles.unitInput}
                right={<PaperInput.Affix text="₺" />}
              />

              {/* Ek Notlar */}
              <PaperInput
                mode="outlined"
                label="Ek Notlar"
                value={item.notes}
                onChangeText={(text) => {
                  const updatedUnits = apartmentUnits.map(unit =>
                    unit.unitNumber === item.unitNumber
                      ? { ...unit, notes: text }
                      : unit
                  );
                  setApartmentUnits(updatedUnits);
                }}
                multiline
                numberOfLines={3}
                style={styles.notesInput}
              />
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      {/* Onayla butonu */}
      <View style={styles.saveButtonContainer}>
        <PaperButton
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
          disabled={!isFormValid()} // Butonun aktif olup olmadığını kontrol et
        >
          Onayla
        </PaperButton>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        enabled
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <LottieView source={animate} autoPlay loop style={styles.animation} />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Apartman Bilgileri</Text>
            </View>
          </View>

          {showApartmentDetails ? (
            renderApartmentDetails()
          ) : showForm ? (
            renderApartmentForm()
          ) : (
            <View style={styles.listContainer}>
              <FlatList
                data={apartments}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.apartmentCard}>
                    <MaterialIcons name="apartment" size={24} color={colors.primary} />
                    <View style={styles.apartmentInfo}>
                      <Text style={styles.apartmentName}>{item.apartmentName}</Text>
                      <Text style={styles.apartmentDetails}>
                        {item.totalApartments} Daire • {item.numberOfFloors} Kat
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.detailsButton}
                      onPress={() => handleAddApartmentDetails(item)}
                    >
                      <MaterialIcons name="add-circle" size={24} color={colors.primary} />
                      <Text style={styles.detailsButtonText}>Daire Bilgileri</Text>
                    </TouchableOpacity>
                  </View>
                )}
                scrollEnabled={false}
                  />
                  
            </View>
          )}
        </ScrollView>

        {!showForm && !showApartmentDetails && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowForm(true)}
          >
            <MaterialIcons name="add" size={30} color={colors.white} />
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 100 : 90,
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
  },
  animation: {
    width: 200,
    height: 200,
  },
  titleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.black,
    textAlign: "center",
  },
  formContainer: {
    padding: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: colors.white,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  listContainer: {
   
  },
  apartmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  apartmentInfo: {
    flex: 1,
    marginLeft: 10,
  },
  apartmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  apartmentDetails: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 4,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  detailsButtonText: {
    color: colors.primary,
    marginLeft: 5,
    fontWeight: '500',
  },
  // Daire detayları için stiller
  detailsContainer: {
    flex: 1,
   
    backgroundColor: "lightblue",
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 5,  
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 10,
    textAlign: "center",
  },
  unitCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
   
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    width: 320,
    
  },
  unitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  unitTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.black,
    backgroundColor: colors.textPrimary,
    borderRadius: 5,
    padding: 5,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterLabel: {
    marginRight: 10,
    fontSize: 14,
    color: colors.darkGray,
  },
  counterButtons: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
  },
  counterButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 15,
    marginHorizontal: 4,
  },
  counterButtonText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: "bold",
  },
  counterValue: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.black,
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 5,
  },
  dropdown: {
    width: '100%',
    borderColor: colors.primary,
  },
  unitInput: {
    marginBottom: 10,
    backgroundColor: colors.white,
  },
  notesInput: {
    marginTop: 10,
    backgroundColor: colors.white,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: "70%",
    alignSelf: "center",
   
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
  },
  utilitiesContainer: {
    marginVertical: 10,
  },
  utilitiesTitle: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 10,
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  checkbox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.primary,    
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    color: colors.primary,
    fontSize: 14,
  },
  checkboxLabelChecked: {
    color: colors.white,
  },
  balconyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  balconyLabel: {
    fontSize: 16,
    color: colors.darkGray,
    marginRight: 10,
  },
  horizontalList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  saveButtonContainer: {
    borderRadius: 10,
    marginBottom: 20,
  },
  listContainer: {
    marginVertical: 20,
  // Container arka plan rengi
    borderRadius: 10,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
    alignItems: 'center',
  },
  navigationButton: {
    padding: 10,
  },
});

export default ApartmentInfoScreen;
