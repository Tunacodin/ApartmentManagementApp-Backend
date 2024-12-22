import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import axios from "axios";
import colors from "../../../styles/colors";
import { TextInput as PaperInput, Button as PaperButton } from "react-native-paper";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [apartments, setApartments] = useState([]);

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
      setIsLoading(true);
      const apartmentData = {
        apartmentName,
        numberOfFloors: parseInt(numberOfFloors),
        totalApartments: parseInt(totalApartments),
        city,
        district,
        neighborhood,
        street,
        buildingNumber,
        postalCode
      };

      const response = await api.post(API_URL, apartmentData);

      if (response.status === 200) {
        setApartments([...apartments, apartmentData]);
        setApartmentName("");
        setNumberOfFloors("");
        setTotalApartments("");
        setCity("");
        setDistrict("");
        setNeighborhood("");
        setStreet("");
        setBuildingNumber("");
        setPostalCode("");
        setShowForm(false);
        setIsSubmitted(false);

        Alert.alert(
          "Başarılı", 
          "Apartman bilgileri kaydedildi"
        );
      }
    } catch (error) {
      console.error("API Hatası:", error);
      Alert.alert("Hata", "Apartman bilgileri kaydedilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View style={styles.headerContainer}>
          <LottieView source={animate} autoPlay loop style={styles.animation} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Apartman Bilgileri</Text>
          </View>
        </View>

        {showForm ? (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <MaterialIcons name="apartment" size={24} color={colors.primary} style={styles.icon} />
                <PaperInput
                  mode="outlined"
                  label="Apartman Adı"
                  value={apartmentName}
                  onChangeText={setApartmentName}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="layers" size={24} color={colors.primary} style={styles.icon} />
                <PaperInput
                  mode="outlined"
                  label="Kat Sayısı"
                  value={numberOfFloors}
                  onChangeText={setNumberOfFloors}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="door-front" size={24} color={colors.primary} style={styles.icon} />
                <PaperInput
                  mode="outlined"
                  label="Toplam Daire Sayısı"
                  value={totalApartments}
                  onChangeText={setTotalApartments}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="location-city" size={24} color={colors.primary} style={styles.icon} />
                <PaperInput
                  mode="outlined"
                  label="Şehir"
                  value={city}
                  onChangeText={setCity}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="business" size={24} color={colors.primary} style={styles.icon} />
                <PaperInput
                  mode="outlined"
                  label="İlçe"
                  value={district}
                  onChangeText={setDistrict}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="home" size={24} color={colors.primary} style={styles.icon} />
                <PaperInput
                  mode="outlined"
                  label="Mahalle"
                  value={neighborhood}
                  onChangeText={setNeighborhood}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="add-road" size={24} color={colors.primary} style={styles.icon} />
                <PaperInput
                  mode="outlined"
                  label="Sokak"
                  value={street}
                  onChangeText={setStreet}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="house" size={24} color={colors.primary} style={styles.icon} />
                <PaperInput
                  mode="outlined"
                  label="Bina No"
                  value={buildingNumber}
                  onChangeText={setBuildingNumber}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="local-post-office" size={24} color={colors.primary} style={styles.icon} />
                <PaperInput
                  mode="outlined"
                  label="Posta Kodu"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              {isSubmitted ? (
                <View style={styles.successIconContainer}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={50} 
                    color={colors.success}
                  />
                </View>
              ) : (
                <PaperButton
                  mode="contained"
                  onPress={handleSubmit}
                  disabled={!validateForm() || isLoading}
                  loading={isLoading}
                  style={styles.submitButton}
                  contentStyle={styles.submitButtonContent}
                  labelStyle={styles.submitButtonLabel}
                >
                  {isLoading ? "Kaydediliyor..." : "Kaydet"}
                </PaperButton>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.listContainer}>
            {apartments.length > 0 ? (
              <FlatList
                data={apartments}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.apartmentCard}>
                    <MaterialIcons name="apartment" size={24} color={colors.primary} style={styles.cardIcon} />
                    <Text style={styles.apartmentName}>{item.apartmentName}</Text>
                  </View>
                )}
                contentContainerStyle={styles.apartmentsList}
              />
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="home" size={50} color={colors.lightGray} />
                <Text style={styles.emptyText}>Henüz apartman bilgisi girilmedi</Text>
              </View>
            )}
          </View>
        )}

        {!showForm && (
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
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
  },
  customButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  customButtonInactive: {
    backgroundColor: "transparent",
  },
  customButtonActive: {
    backgroundColor: colors.white,
  },
  submittedButton: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  customButtonText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 16,
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 8,
    height: 50,
  },
  submitButtonContent: {
    height: 50,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkGray,
    marginTop: 10,
    textAlign: 'center',
  },
  apartmentsList: {
    padding: 20,
    paddingBottom: 80,
  },
  apartmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  cardIcon: {
    marginRight: 15,
  },
  apartmentName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  listContainer: {
    flex: 1,
    marginTop: 10,
  },
});

export default ApartmentInfoScreen;
