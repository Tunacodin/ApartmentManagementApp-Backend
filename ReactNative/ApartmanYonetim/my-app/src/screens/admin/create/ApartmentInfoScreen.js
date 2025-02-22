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
  Switch,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Image,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import colors from "../../../styles/colors";
import { TextInput as PaperInput, Button as PaperButton } from "react-native-paper";
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import animate from "../../../assets/json/animApartment.json";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, axiosConfig } from '../../../config/apiConfig';
import * as ImagePicker from 'expo-image-picker';

// API URL'lerini güncelle
const buildingApi = axios.create({
  baseURL: API_ENDPOINTS.BUILDING,
  ...axiosConfig
});

const apartmentApi = axios.create({
  baseURL: API_ENDPOINTS.APARTMENT,
  ...axiosConfig
});

const imageApi = axios.create({
  baseURL: API_ENDPOINTS.IMAGE,
  ...axiosConfig
});

// API istekleri için hata yönetimi
const logApiError = (error, context) => {
  console.log(`\n=================== ${context} HATA DETAYI ===================`);
  console.error("❌ Hata Türü:", error.name);
  console.error("❌ Hata Mesajı:", error.message);
  
  if (error.response) {
    // Sunucudan gelen hata
    console.error(" Sunucu Yanıtı:", {
      data: error.response.data,
      status: error.response.status,
      headers: error.response.headers
    });
  } else if (error.request) {
    // İstek yapıldı ama yanıt alınamadı
    console.error("📡 İstek Yapıldı Ama Yanıt Yok:", error.request);
  } else {
    // İstek oluşturulurken hata oluştu
    console.error("📡 İstek Hatası:", error.message);
  }

  if (error.config) {
    console.error("📝 İstek Detayları:", {
      url: error.config.url,
      method: error.config.method,
      headers: error.config.headers,
      data: error.config.data
    });
  }

  console.log("=======================================================\n");
};

const ApartmentInfoScreen = () => {
  const [apartmentName, setApartmentName] = useState("");
  const [numberOfFloors, setNumberOfFloors] = useState(0);
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
  const [duesAmount, setDuesAmount] = useState("");
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState([]);
  const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  const [selectedType, setSelectedType] = useState('');
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [bulkRentAmount, setBulkRentAmount] = useState('5000');
  const [bulkDepositAmount, setBulkDepositAmount] = useState('10000');
  const [showUnitSelector, setShowUnitSelector] = useState(false);

  const [currentStep, setCurrentStep] = useState('type');
  const [completionStatus, setCompletionStatus] = useState({
    type: false,
    floor: false,
    balcony: false,
    rent: false,
    deposit: false,
    notes: false
  });
  const [unassignedUnits, setUnassignedUnits] = useState([]);

  const [bulkNotes, setBulkNotes] = useState('');
  const [bulkFloor, setBulkFloor] = useState('');

  const [selectedFloor, setSelectedFloor] = useState(null);
  const [isSelectingType, setIsSelectingType] = useState(false);

  const [availableFloors, setAvailableFloors] = useState([]);
  const [hasBasement, setHasBasement] = useState(false);
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);

  const [showBasementSelector, setShowBasementSelector] = useState(false);
  const [selectedBasementFloor, setSelectedBasementFloor] = useState(null);

  const APARTMENT_TYPES = ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1"];

  const STEPS = [
    { id: 'type', title: 'Daire Tipi', icon: 'home' },
    { id: 'floor', title: 'Kat Bilgisi', icon: 'layers' },
    { id: 'balcony', title: 'Balkon', icon: 'deck' },
    { id: 'rent', title: 'Kira Bilgisi', icon: 'attach-money' },
    { id: 'deposit', title: 'Depozito', icon: 'account-balance-wallet' },
    { id: 'notes', title: 'Ek Notlar', icon: 'note' }
  ];

  const scrollViewRef = useRef(null);

  // Varsayılan değerlerle güncelle
  const [buildingFeatures, setBuildingFeatures] = useState({
    parking: { exists: false, type: null },
    elevator: false,
    park: true, // Oyun alanı varsayılan olarak true
    heatingSystem: 'central',
    pool: { exists: false, type: null },
    gym: false,
    buildingAge: '',
    garden: false,
    thermalInsulation: false
  });

  // Isıtma sistemi seçenekleri
  const heatingOptions = [
    { label: 'Merkezi', value: 'central' },
    { label: 'Kombi', value: 'combi' },
    { label: 'Yerden', value: 'floor' },
  ];

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [constructionDate, setConstructionDate] = useState(null);

  const calculateBuildingAge = (constructionDate) => {
    if (!constructionDate) return '';
    const today = new Date();
    const age = today.getFullYear() - constructionDate.getFullYear();
    return age.toString();
  };

  const [tempDate, setTempDate] = useState(null);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        // Android için onay dialogu göster
        Alert.alert(
          "Tarih Seçimi",
          `${selectedDate.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} tarihini onaylıyor musunuz?`,
          [
            {
              text: "Hayır",
              onPress: () => {
                setTempDate(null);
                setShowDatePicker(false);
              },
              style: "cancel"
            },
            {
              text: "Evet",
              onPress: () => {
                setConstructionDate(selectedDate);
                handleFeatureChange('buildingAge', calculateBuildingAge(selectedDate));
                setShowDatePicker(false);
              }
            }
          ]
        );
      }
    }
  };

  // iOS için onay butonu
  const handleConfirmDate = () => {
    if (tempDate) {
      setConstructionDate(tempDate);
      handleFeatureChange('buildingAge', calculateBuildingAge(tempDate));
    }
    setTempDate(null);
    setShowDatePicker(false);
  };

  // iOS için iptal butonu
  const handleCancelDate = () => {
    setTempDate(null);
    setShowDatePicker(false);
  };

  const handleFeatureChange = (feature, value) => {
    setBuildingFeatures(prev => ({
      ...prev,
      [feature]: value
    }));
  };

  // Animasyon değerleri için ref'ler oluşturalım
  const parkingAnimation = useRef(new Animated.Value(0)).current;
  const poolAnimation = useRef(new Animated.Value(0)).current;

  // Switch değiştiğinde animasyonu tetikleyen fonksiyon
  const animateFeature = (animation, show) => {
    Animated.timing(animation, {
      toValue: show ? 1 : 0,
      duration: 500, // 0.5 saniye
      useNativeDriver: true,
    }).start();
  };

  // Switch değişimlerini güncelleyelim
  const handleNestedFeatureChange = (feature, subFeature, value) => {
    setBuildingFeatures(prev => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        [subFeature]: value
      }
    }));

    // Switch açıldığında/kapandığında animasyonu tetikle
    if (subFeature === 'exists') {
      if (feature === 'parking') {
        animateFeature(parkingAnimation, value);
      } else if (feature === 'pool') {
        animateFeature(poolAnimation, value);
      }
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleCityFilter = (text) => {
    setCity(text);
    console.log('Filtering cities with:', text);
    
    if (text.length > 0) {
      const filtered = cities
        .filter(city => 
          city.name.toLowerCase().includes(text.toLowerCase()))
        .map(city => city.name);
      setFilteredCities(filtered);
      setShowCityDropdown(true);
      console.log('Filtered cities:', filtered);
    } else {
      setFilteredCities([]);
      setShowCityDropdown(false);
    }
  };

  const handleCityChange = (selectedCity) => {
    console.log('Selected city:', selectedCity);
    setCity(selectedCity);
    setDistrict('');
    setNeighborhood('');
    
    const cityData = cities.find(c => c.name === selectedCity);
    if (cityData) {
      setDistricts(cityData.districts);
      setFilteredDistricts([]);
      setShowDistrictDropdown(false);
    
    }
    
    setShowCityDropdown(false);
  };

  const handleDistrictFilter = (text) => {
    setDistrict(text);
    console.log('Filtering districts with:', text);
    
    if (text.length > 0 && districts.length > 0) {
      const filtered = districts.filter(district => 
        district.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDistricts(filtered);
      setShowDistrictDropdown(true);
     
    } else {
      setFilteredDistricts([]);
      setShowDistrictDropdown(false);
    }
  };

  const handleNeighborhoodFilter = (text) => {
    setNeighborhood(text);
    console.log('Filtering neighborhoods with:', text);

    if (text.length > 0 && neighborhoods.length > 0) {
      const filtered = neighborhoods.filter(neighborhood =>
        neighborhood.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredNeighborhoods(filtered);
      setShowNeighborhoodDropdown(true);
      console.log('Filtered neighborhoods:', filtered);
    } else {
      setFilteredNeighborhoods([]);
      setShowNeighborhoodDropdown(false);
    }
  };

  const handleNeighborhoodChange = (selectedNeighborhood) => {
    console.log('Selected neighborhood:', selectedNeighborhood);
    setNeighborhood(selectedNeighborhood);
    setShowNeighborhoodDropdown(false);
  };

  const validateForm = () => {
    const missingFields = [];

    if (!apartmentName.trim()) missingFields.push("- Apartman Adı");
    if (!numberOfFloors) missingFields.push("- Kat Sayısı");
    if (!totalApartments) missingFields.push("- Toplam Daire Sayısı");
    if (!city.trim()) missingFields.push("- Şehir");
    if (!district.trim()) missingFields.push("- İlçe");
    if (!neighborhood.trim()) missingFields.push("- Mahalle");
    if (!street.trim()) missingFields.push("- Sokak");
    if (!buildingNumber.trim()) missingFields.push("- Bina Numarası");
    if (!postalCode.trim()) missingFields.push("- Posta Kodu");
    if (!duesAmount.trim()) missingFields.push("- Aidat Miktarı");
    if (selectedImages.length === 0) missingFields.push("- En az bir görsel");

    if (missingFields.length > 0) {
      console.log("\n=================== FORM DOĞRULAMA ===================");
      console.log("❌ Eksik Alanlar:");
      missingFields.forEach(field => console.log(field));
      console.log("====================================================\n");

      Alert.alert(
        "Eksik Bilgiler",
        `Lütfen aşağıdaki alanları doldurun:\n\n${missingFields.join("\n")}`
      );
      return false;
    }

    console.log("\n=================== FORM DOĞRULAMA ===================");
    console.log("✅ Tüm alanlar doldurulmuş");
    console.log("====================================================\n");

    return true;
  };

  // AsyncStorage'dan veri yükleme
  useEffect(() => {
    loadSavedApartment();
  }, []);

  // Kaydedilmiş apartman bilgilerini yükle
  const loadSavedApartment = async () => {
    try {
      const savedApartment = await AsyncStorage.getItem('savedApartment');
      if (savedApartment) {
        const apartmentData = JSON.parse(savedApartment);
        
        // State'leri güncelle
        setApartmentName(apartmentData.buildingName || '');
        setNumberOfFloors(apartmentData.numberOfFloors?.toString() || '');
        setTotalApartments(apartmentData.totalApartments?.toString() || '');
        setCity(apartmentData.city || '');
        setDistrict(apartmentData.district || '');
        setNeighborhood(apartmentData.neighborhood || '');
        setStreet(apartmentData.street || '');
        setBuildingNumber(apartmentData.buildingNumber || '');
        setPostalCode(apartmentData.postalCode || '');
        setDuesAmount(apartmentData.duesAmount?.toString() || '');
        
        setIncludedUtilities({
          electric: apartmentData.includedElectric || false,
          water: apartmentData.includedWater || false,
          gas: apartmentData.includedGas || false,
          internet: apartmentData.includedInternet || false
        });

        setBuildingFeatures({
          parking: {
            exists: apartmentData.parkingType !== 'Yok',
            type: apartmentData.parkingType !== 'Yok' ? apartmentData.parkingType : null
          },
          elevator: apartmentData.hasElevator || false,
          park: apartmentData.hasPlayground || false,
          heatingSystem: apartmentData.heatingType || 'central',
          pool: {
            exists: apartmentData.poolType !== 'Yok',
            type: apartmentData.poolType !== 'Yok' ? apartmentData.poolType : null
          },
          gym: apartmentData.hasGym || false,
          buildingAge: apartmentData.buildingAge?.toString() || '',
          garden: apartmentData.hasGarden || false,
          thermalInsulation: apartmentData.hasThermalInsulation || false
        });

        if (apartmentData.imageId) {
          setUploadedImageUrls([{ id: apartmentData.imageId }]);
        }

        console.log('Apartman bilgileri yüklendi:', apartmentData);
      }
    } catch (error) {
      console.error('Apartman bilgileri yüklenirken hata:', error);
    }
  };

  // Apartman bilgilerini kaydet
  const saveApartmentToStorage = async (apartmentData) => {
    try {
      await AsyncStorage.setItem('savedApartment', JSON.stringify(apartmentData));
      console.log('Apartman bilgileri kaydedildi');
    } catch (error) {
      console.error('Apartman bilgileri kaydedilirken hata:', error);
    }
  };

  // Görsel işleme fonksiyonu
  const processImage = async (image) => {
    try {
      // Dosyayı base64'e çevir
      const response = await fetch(image.uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64data = reader.result.split(',')[1];
          resolve(base64data);
        };
        reader.onerror = () => reject(new Error('Base64 dönüşümü başarısız'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Görsel işleme hatası:", error);
      throw error;
    }
  };

  // handleSubmit fonksiyonunu güncelle
  const handleSubmit = async () => {
    if (!validateForm()) {
        return;
    }

    setIsLoading(true);
    console.log("\n=================== İŞLEM BAŞLADI ===================");

    try {
        // Prepare the building data as a JSON object with default values
        const buildingData = {
             id: 0,
        buildingName: apartmentName.trim(),
        numberOfFloors: parseInt(numberOfFloors),
        totalApartments: parseInt(totalApartments),
        occupancyRate: 0,
        city: city.trim(),
        district: district.trim(),
        neighborhood: neighborhood.trim(),
        street: street.trim(),
        buildingNumber: buildingNumber.trim(),
        postalCode: postalCode.trim(),
        duesAmount: parseFloat(duesAmount || "0"),
        includedElectric: includedUtilities.electric,
        includedWater: includedUtilities.water,
        includedGas: includedUtilities.gas,
        includedInternet: includedUtilities.internet,
        parkingType: buildingFeatures.parking.exists ? buildingFeatures.parking.type : "Yok",
        hasElevator: buildingFeatures.elevator,
        hasPlayground: buildingFeatures.park,
        heatingType: buildingFeatures.heatingSystem,
        poolType: buildingFeatures.pool.exists ? buildingFeatures.pool.type : "Yok",
        hasGym: buildingFeatures.gym,
        buildingAge: parseInt(buildingFeatures.buildingAge) || 0,
        hasGarden: buildingFeatures.garden,
        hasThermalInsulation: buildingFeatures.thermalInsulation,
        adminId: 1,
        createdAt: new Date().toISOString(),
        isActive: true,
        lastMaintenanceDate: new Date().toISOString(),
            imageId: null, // Default value indicating no image uploaded
            imageUrl: null, // Default value indicating no image uploaded
            isActive: true, // Default value
        
        };

        // Image handling section (commented out)
        /*
        if (selectedImages.length > 0) {
            const imageFile = {
                uri: selectedImages[0].uri,
                type: 'image/jpeg', // Adjust based on your image type
                name: `building_${Date.now()}.jpg`
            };
            buildingData.imageId = imageFile.name; // Set imageId to the name of the image
            buildingData.imageUrl = imageFile.uri; // Set imageUrl to the URI of the image
        }
        */

        // Send the request as JSON
        const response = await axios.post('https://your-api-endpoint', buildingData, {
            headers: {
                'Content-Type': 'application/json', // Set to application/json
            }
        });

        console.log("✅ Building kaydı başarılı:", response.data);
        // Handle success response

    } catch (error) {
        console.log("\n=================== HATA OLUŞTU ===================");
        console.error("❌ Hata detayı:", error);
        logApiError(error, "KAYIT");
    } finally {
        setIsLoading(false);
        console.log("=================== İŞLEM TAMAMLANDI ===================\n");
    }
};

  // Form verilerini sıfırlama fonksiyonu
  const resetForm = () => {
    setApartmentName("");
    setNumberOfFloors(0);
    setTotalApartments("");
    setCity("");
    setDistrict("");
    setNeighborhood("");
    setStreet("");
    setBuildingNumber("");
    setPostalCode("");
    setDuesAmount("");
    setIncludedUtilities({
      electric: false,
      water: false,
      gas: false,
      internet: false
    });
    setBuildingFeatures({
      parking: { exists: false, type: null },
      elevator: false,
      park: true, // Oyun alanı varsayılan olarak true kalacak
      heatingSystem: 'central',
      pool: { exists: false, type: null },
      gym: false,
      buildingAge: '',
      garden: false,
      thermalInsulation: false
    });
    setSelectedImages([]);
    setApartmentUnits([]);
    setBulkRentAmount('5000'); // Varsayılan kira miktarı
    setBulkDepositAmount('10000'); // Varsayılan depozito miktarı
  };

  const handleAddApartmentDetails = (apartment) => {
    setSelectedApartment(apartment);
    const units = Array.from({ length: apartment.totalApartments }, (_, index) => ({
      unitNumber: index + 1,
      floor: undefined,
      rentAmount: '',
      depositAmount: '',
      type: '',
      hasBalcony: false,
      notes: '',
    }));
    setApartmentUnits(units);
    setUnassignedUnits(Array.from({ length: apartment.totalApartments }, (_, i) => i + 1));
    setShowApartmentDetails(true);
    setCurrentStep('type');
    setSelectedType('');
    setSelectedUnits([]);
    setSelectedFloor(0);
    setSelectedBasementFloor(null);
    setAvailableFloors([0, ...Array.from({ length: apartment.numberOfFloors - 1 }, (_, i) => i + 1)]);
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
    const currentUnit = apartmentUnits[currentIndex];
    
    // Mevcut dairenin zorunlu alanlarının kontrolü
    return currentUnit && 
      currentUnit.rentAmount?.trim() && 
      currentUnit.depositAmount?.trim() && 
      currentUnit.type;  // floor zaten 0 veya daha büyük olacak
  };

  const handleSave = () => {
    // Tüm dairelerin kontrolü
    const allUnitsValid = apartmentUnits.every(unit => 
      unit.rentAmount?.trim() && 
      unit.depositAmount?.trim() && 
      unit.type
    );

    if (!allUnitsValid) {
      Alert.alert(
        "Uyarı", 
        "Lütfen tüm dairelerin kira ve depozito bilgilerini eksiksiz doldurun."
      );
      return;
    }

    // Başarılı kayıt
    console.log('Daire bilgileri kaydedildi:', apartmentUnits);
    Alert.alert(
      "Başarılı",
      "Daire bilgileri başarıyla kaydedildi.",
      [{ 
        text: "Tamam",
        onPress: () => setShowApartmentDetails(false)
      }]
    );
  };

  const fetchCities = async () => {
    try {
      console.log('Fetching cities...');
      const response = await axios.get('https://turkiyeapi.dev/api/v1/provinces');
      
      
      if (response.data.status === "OK") {
        const cityData = response.data.data.map(city => ({
          name: city.name,
          districts: city.districts.map(district => ({
            districtId: district.id,
            name: district.name
          }))
        }));
        setCities(cityData);
        
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleDistrictChange = async (selectedDistrict) => {
    console.log('Selected district:', selectedDistrict);
    setDistrict(selectedDistrict.name);
    setNeighborhood('');
    setFilteredNeighborhoods([]);
    setShowNeighborhoodDropdown(false);
    setShowDistrictDropdown(false);
    
    try {
      console.log('Fetching neighborhoods for district ID:', selectedDistrict.districtId);
      const response = await axios.get('https://turkiyeapi.dev/api/v1/neighborhoods');
     
      
      if (response.data.status === "OK") {
        const districtNeighborhoods = response.data.data
          .filter(n => n.provinceId === selectedDistrict.provinceId && 
                      n.districtId === selectedDistrict.districtId)
          .map(n => n.name);
        
        setNeighborhoods(districtNeighborhoods);
        console.log('Fetched neighborhoods:', districtNeighborhoods);
      }
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
      Alert.alert('Hata', 'Mahalle bilgileri alınırken bir hata oluştu.');
    }
  };

  const handleTypeSelection = (type) => {
    if (isSelectingType && type !== selectedType) {
      // Eğer seçim yapılıyorsa ve farklı bir tipe tıklandıysa, işlemi engelle
      return;
    }
    setSelectedType(type);
    setIsSelectingType(true);
  };

  const handleUnitSelection = (unitNumber) => {
    // Sadece atanmamış daireler seçilebilir
    if (!unassignedUnits.includes(unitNumber)) return;

    if (selectedUnits.includes(unitNumber)) {
      setSelectedUnits(selectedUnits.filter(num => num !== unitNumber));
    } else {
      setSelectedUnits([...selectedUnits, unitNumber].sort((a, b) => a - b));
    }
  };

  const handleRangeSelection = (start, end) => {
    const range = Array.from(
      { length: end - start + 1 }, 
      (_, i) => start + i
    );
    setSelectedUnits(range);
  };

  const handleBulkUpdate = () => {
    const updatedUnits = [...apartmentUnits];
    selectedUnits.forEach(unitNumber => {
      const index = unitNumber - 1;
      updatedUnits[index] = {
        ...updatedUnits[index],
        type: selectedType,
        rentAmount: bulkRentAmount,
        depositAmount: bulkDepositAmount
      };
    });
    setApartmentUnits(updatedUnits);
    // Reset seçimleri
    setSelectedUnits([]);
    setSelectedType('');
    setBulkRentAmount('');
    setBulkDepositAmount('');
    setShowUnitSelector(false);
  };

  const renderApartmentForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <MaterialIcons
          name="apartment"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <PaperInput
          mode="outlined"
          label="Apartman Adı"
          placeholder="örn: Melek Apartmanı"
          value={apartmentName}
          onChangeText={setApartmentName}
          style={styles.input}
          outlineColor={colors.darkGray}
          activeOutlineColor={colors.primary}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons
          name="layers"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <PaperInput
          mode="outlined"
          label="Kat Sayısı"
          value={numberOfFloors}
          onChangeText={setNumberOfFloors}
          keyboardType="numeric"
          style={styles.input}
          outlineColor={colors.darkGray}
          activeOutlineColor={colors.primary}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons
          name="door-front"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <PaperInput
          mode="outlined"
          label="Toplam Daire Sayısı"
          value={totalApartments}
          onChangeText={setTotalApartments}
          keyboardType="numeric"
          style={styles.input}
          outlineColor={colors.darkGray}
          activeOutlineColor={colors.primary}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons
          name="location-city"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <View style={styles.dropdownWrapper}>
          <PaperInput
            mode="outlined"
            label="Şehir"
            value={city}
            onChangeText={handleCityFilter}
            style={styles.input}
            outlineColor={colors.darkGray}
            activeOutlineColor={colors.primary}
          />
          {showCityDropdown && filteredCities.length > 0 && (
            <View style={styles.dropdown}>
              <ScrollView nestedScrollEnabled={true} style={styles.dropdownScroll}>
                {filteredCities.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => handleCityChange(item)}
                  >
                    <Text style={styles.dropdownText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons
          name="location-on"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <View style={styles.dropdownWrapper}>
          <PaperInput
            mode="outlined"
            label="İlçe"
            value={district}
            onChangeText={handleDistrictFilter}
            style={styles.input}
            outlineColor={colors.darkGray}
            activeOutlineColor={colors.primary}
            disabled={!city}
          />
          {showDistrictDropdown && filteredDistricts.length > 0 && (
            <View style={styles.dropdown}>
              <ScrollView nestedScrollEnabled={true} style={styles.dropdownScroll}>
                {filteredDistricts.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => handleDistrictChange(item)}
                  >
                    <Text style={styles.dropdownText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons
          name="home"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <View style={styles.dropdownWrapper}>
          <PaperInput
            mode="outlined"
            label="Mahalle"
            value={neighborhood}
            onChangeText={handleNeighborhoodFilter}
            style={styles.input}
            outlineColor={colors.darkGray}
            activeOutlineColor={colors.primary}
            disabled={!district}
          />
          {showNeighborhoodDropdown && filteredNeighborhoods.length > 0 && (
            <View style={styles.dropdown}>
              <ScrollView nestedScrollEnabled={true} style={styles.dropdownScroll}>
                {filteredNeighborhoods.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => handleNeighborhoodChange(item)}
                  >
                    <Text style={styles.dropdownText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons
          name="add-road"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <PaperInput
          mode="outlined"
          label="Sokak"
          value={street}
          onChangeText={setStreet}
          style={styles.input}
          outlineColor={colors.darkGray}
          activeOutlineColor={colors.primary}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons
          name="home-work"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <PaperInput
          mode="outlined"
          label="Bina No"
          value={buildingNumber}
          onChangeText={setBuildingNumber}
          keyboardType="numeric"
          style={styles.input}
          outlineColor={colors.darkGray}
          activeOutlineColor={colors.primary}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons
          name="local-post-office"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <PaperInput
          mode="outlined"
          label="Posta Kodu"
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="numeric"
          style={styles.input}
          outlineColor={colors.darkGray}
          activeOutlineColor={colors.primary}
         
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons
          name="account-balance-wallet"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <PaperInput
          mode="outlined"
          label="Aidat Miktarı (₺)"
          value={duesAmount}
          onChangeText={setDuesAmount}
          keyboardType="numeric"
          style={styles.input}
          outlineColor={colors.darkGray}
          activeOutlineColor={colors.primary}
          right={<PaperInput.Affix text="₺" />}
        />
      </View>

      <View style={styles.utilitiesContainer}>
        <Text style={styles.sectionTitle}>Dahili Hizmetler</Text>
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

      {renderBuildingFeatures()}

      {renderImageUpload()}

      <TouchableOpacity 
        style={[styles.submitButton, isLoading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.submitButtonLabel}>Kaydet</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderBuildingFeatures = () => (
    <View style={styles.featuresContainer}>
      <Text style={styles.sectionTitle}>Bina Özellikleri</Text>
      
      {/* Otopark */}
      <View style={styles.featureRow}>
        <Text style={styles.featureLabel}>Otopark</Text>
        <View style={styles.featureControls}>
          <Animated.View style={[
            styles.radioGroupContainer,
            {
              opacity: parkingAnimation,
              transform: [{
                translateX: parkingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0] // Sağdan sola doğru kayma
                })
              }]
            }
          ]}>
            {buildingFeatures.parking.exists && (
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    buildingFeatures.parking.type === 'open' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleNestedFeatureChange('parking', 'type', 'open')}
                >
                  <Text style={[
                    styles.radioText,
                    buildingFeatures.parking.type === 'open' && styles.radioTextSelected
                  ]}>
                    Açık
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    buildingFeatures.parking.type === 'closed' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleNestedFeatureChange('parking', 'type', 'closed')}
                >
                  <Text style={[
                    styles.radioText,
                    buildingFeatures.parking.type === 'closed' && styles.radioTextSelected
                  ]}>
                    Kapalı
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
          <Switch
            value={buildingFeatures.parking.exists}
            onValueChange={(value) => handleNestedFeatureChange('parking', 'exists', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
          />
        </View>
      </View>

      {/* Havuz */}
      <View style={styles.featureRow}>
        <Text style={styles.featureLabel}>Havuz</Text>
        <View style={styles.featureControls}>
          <Animated.View style={[
            styles.radioGroupContainer,
            {
              opacity: poolAnimation,
              transform: [{
                translateX: poolAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0] // Sağdan sola doğru kayma
                })
              }]
            }
          ]}>
            {buildingFeatures.pool.exists && (
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    buildingFeatures.pool.type === 'open' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleNestedFeatureChange('pool', 'type', 'open')}
                >
                  <Text style={[
                    styles.radioText,
                    buildingFeatures.pool.type === 'open' && styles.radioTextSelected
                  ]}>
                    Açık
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    buildingFeatures.pool.type === 'closed' && styles.radioButtonSelected
                  ]}
                  onPress={() => handleNestedFeatureChange('pool', 'type', 'closed')}
                >
                  <Text style={[
                    styles.radioText,
                    buildingFeatures.pool.type === 'closed' && styles.radioTextSelected
                  ]}>
                    Kapalı
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
          <Switch
            value={buildingFeatures.pool.exists}
            onValueChange={(value) => handleNestedFeatureChange('pool', 'exists', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
          />
        </View>
      </View>

      {/* Isıtma Sistemi */}
      <View style={styles.featureRow}>
        <Text style={styles.featureLabel}>Isıtma Sistemi</Text>
        <View style={styles.radioGroup}>
          {heatingOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.radioButton,
                buildingFeatures.heatingSystem === option.value && styles.radioButtonSelected
              ]}
              onPress={() => handleFeatureChange('heatingSystem', option.value)}
            >
              <Text style={[
                styles.radioText,
                buildingFeatures.heatingSystem === option.value && styles.radioTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bina Yaşı yerine Yapım Tarihi */}
      <View style={styles.featureRow}>
        <Text style={styles.featureLabel}>Yapım Tarihi</Text>
        <View style={styles.datePickerContainer}>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerButtonText}>
              {constructionDate 
                ? constructionDate.toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Tarih Seç'}
            </Text>
          </TouchableOpacity>
          {buildingFeatures.buildingAge && (
            <Text style={styles.buildingAgeText}>
              {buildingFeatures.buildingAge} yaşında
            </Text>
          )}
        </View>
      </View>

      {showDatePicker && (
        <View>
          {Platform.OS === 'android' ? (
            <DateTimePicker
              testID="dateTimePicker"
              value={constructionDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          ) : (
            <View style={styles.iosDatePickerContainer}>
              <View style={styles.iosDatePickerHeader}>
                <TouchableOpacity onPress={handleCancelDate}>
                  <Text style={styles.iosDatePickerButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirmDate}>
                  <Text style={[styles.iosDatePickerButtonText, styles.confirmText]}>Tamam</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate || constructionDate || new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                locale="tr-TR"
              />
            </View>
          )}
        </View>
      )}

      {/* Diğer özellikler için Switch'ler */}
      <View style={styles.switchGroup}>
        <View style={styles.featureRow}>
          <Text style={styles.featureLabel}>Asansör</Text>
          <Switch
            value={buildingFeatures.elevator}
            onValueChange={(value) => handleFeatureChange('elevator', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
          />
        </View>

        <View style={styles.featureRow}>
          <Text style={styles.featureLabel}>Park Alanı</Text>
          <Switch
            value={buildingFeatures.park}
            onValueChange={(value) => handleFeatureChange('park', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
          />
        </View>

        <View style={styles.featureRow}>
          <Text style={styles.featureLabel}>Spor Salonu</Text>
          <Switch
            value={buildingFeatures.gym}
            onValueChange={(value) => handleFeatureChange('gym', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
          />
        </View>

        <View style={styles.featureRow}>
          <Text style={styles.featureLabel}>Bahçe</Text>
          <Switch
            value={buildingFeatures.garden}
            onValueChange={(value) => handleFeatureChange('garden', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
          />
        </View>

        <View style={styles.featureRow}>
          <Text style={styles.featureLabel}>Isı Yalıtımı</Text>
          <Switch
            value={buildingFeatures.thermalInsulation}
            onValueChange={(value) => handleFeatureChange('thermalInsulation', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
          />
        </View>
      </View>
    </View>
  );

  const renderImageUpload = () => (
    <View style={styles.imageUploadContainer}>
      <Text style={styles.sectionTitle}>Apartman Görselleri</Text>
      
      <FlatList
        horizontal
        data={[{ id: 'add' }, ...selectedImages]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.id === 'add') {
            return (
              <TouchableOpacity 
                style={styles.addImageCard}
                onPress={pickImage}
              >
                <MaterialIcons 
                  name="add-photo-alternate" 
                  size={32} 
                  color={colors.primary} 
                />
                <Text style={styles.addImageText}>Görsel Ekle</Text>
              </TouchableOpacity>
            );
          }
          
          return (
            <View style={styles.imageItemContainer}>
              <Image
                source={{ uri: item.uri }}
                style={styles.imagePreview}
              />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => removeImage(item.id)}
              >
                <MaterialIcons name="delete" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={styles.imageListContainer}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  const renderApartmentDetails = () => (
    <View style={styles.detailsContainer}>
      <View style={styles.stepsHeader}>
        {STEPS.map(step => (
          <View key={step.id} style={styles.stepItem}>
            <MaterialIcons
              name={step.icon}
              size={24}
              color={completionStatus[step.id] ? colors.success : colors.darkGray}
            />
            <Text style={styles.stepTitle}>{step.title}</Text>
            {completionStatus[step.id] && (
              <MaterialIcons name="check-circle" size={16} color={colors.success} />
            )}
          </View>
        ))}
      </View>

      <Text style={styles.detailsTitle}>
        {selectedApartment.apartmentName} - {STEPS.find(s => s.id === currentStep).title}
      </Text>

      {currentStep === 'type' && (
        <View style={styles.typeSelectionContainer}>
          <View style={styles.typeButtonsContainer}>
            {APARTMENT_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  selectedType === type && styles.selectedTypeButton
                ]}
                onPress={() => handleTypeSelect(type)}
              >
                <Text style={[
                  styles.typeButtonText,
                  selectedType === type && styles.selectedTypeButtonText
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.unitsGrid}>
            {Array.from({ length: selectedApartment.totalApartments }, (_, i) => i + 1).map(num => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.unitButton,
                  selectedUnits.includes(num) && styles.selectedUnitButton,
                  apartmentUnits[num-1].type && styles.completedUnitButton,
                  !unassignedUnits.includes(num) && styles.inactiveUnitButton
                ]}
                onPress={() => handleUnitSelection(num)}
                disabled={!unassignedUnits.includes(num) || !selectedType} // Tip seçilmeden daire seçilemez
              >
                <Text style={[
                  styles.unitButtonText,
                  selectedUnits.includes(num) && styles.selectedUnitButtonText,
                  apartmentUnits[num-1].type && styles.completedUnitButtonText
                ]}>
                  {num}
                </Text>
                {apartmentUnits[num-1].type && (
                  <Text style={styles.unitTypeText}>
                    {apartmentUnits[num-1].type}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {selectedUnits.length > 0 && (
            <PaperButton
              mode="contained"
              onPress={handleApplyType}
              style={styles.applyButton}
            >
              Seçili Dairelere Uygula
            </PaperButton>
          )}
        </View>
      )}

      {currentStep === 'floor' && (
        <View style={styles.floorContainer}>
          <View style={styles.inputHeader}>
            
            <Text style={styles.remainingText}>
              {unassignedUnits.length} daire için kat bilgisi girilmesi gerekiyor
            </Text>
          </View>

          <FloorSelector 
            currentFloor={selectedFloor}
            onFloorChange={handleFloorChange}
          />

          <View style={styles.floorsGrid}>
            <View style={styles.floorUnits}>
              {apartmentUnits
                .filter(unit => unit.floor === undefined || unit.floor === selectedFloor)
                .map(unit => (
                  <TouchableOpacity
                    key={unit.unitNumber}
                    style={[
                      styles.unitButton,
                      selectedUnits.includes(unit.unitNumber) && styles.selectedUnitButton,
                      unit.floor !== undefined && styles.completedUnitButton,
                      !unassignedUnits.includes(unit.unitNumber) && styles.inactiveUnitButton
                    ]}
                    onPress={() => handleUnitSelection(unit.unitNumber)}
                    disabled={!unassignedUnits.includes(unit.unitNumber) || selectedFloor === null}
                  >
                    <Text style={[
                      styles.unitButtonText,
                      selectedUnits.includes(unit.unitNumber) && styles.selectedUnitButtonText
                    ]}>
                      {unit.unitNumber}
                    </Text>
                    {unit.type && (
                      <Text style={styles.unitTypeText}>{unit.type}</Text>
                    )}
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {selectedUnits.length > 0 && selectedFloor !== null && (
            <PaperButton
              mode="contained"
              onPress={() => handleApplyFloor(selectedFloor)}
              style={styles.applyButton}
            >
              {selectedUnits.length} Daireyi {selectedFloor === 0 ? 'Zemin Kata' : `${selectedFloor}. Kata`} Yerleştir
            </PaperButton>
          )}

          <ResetButton 
            onReset={handleResetFloors}
            section="Kat Bilgileri"
          />
        </View>
      )}

      {currentStep === 'balcony' && (
        <View style={styles.balconyContainer}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>Balkon Bilgisi</Text>
            <Text style={styles.remainingText}>
              Balkonu olan daireleri seçin
            </Text>
          </View>

          <View style={styles.unitsGrid}>
            {apartmentUnits.map(unit => (
              <TouchableOpacity
                key={unit.unitNumber}
                style={[
                  styles.unitButton,
                  selectedUnits.includes(unit.unitNumber) && styles.selectedUnitButton,
                  unit.hasBalcony && styles.balconyUnitButton,
                  !unassignedUnits.includes(unit.unitNumber) && styles.inactiveUnitButton
                ]}
                onPress={() => handleUnitSelection(unit.unitNumber)}
                disabled={!unassignedUnits.includes(unit.unitNumber)}
              >
                <Text style={[
                  styles.unitButtonText,
                  selectedUnits.includes(unit.unitNumber) && styles.selectedUnitButtonText,
                  unit.hasBalcony && styles.balconyUnitText
                ]}>
                  {unit.unitNumber}
                </Text>
                <Text style={styles.unitDetailText}>
                  {unit.floor === 0 ? 'Zemin' : `${unit.floor}. Kat`}
                </Text>
                {unit.hasBalcony && (
                  <MaterialIcons name="deck" size={16} color={colors.success} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {selectedUnits.length > 0 && (
            <PaperButton
              mode="contained"
              onPress={handleApplyBalcony}
              style={styles.applyButton}
            >
              {selectedUnits.length} Daireye Balkon Ekle
            </PaperButton>
          )}
        </View>
      )}

      {currentStep === 'rent' && (
        <View style={styles.rentContainer}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>Kira Miktarı</Text>
            <Text style={styles.remainingText}>
              {unassignedUnits.length} daire için kira bilgisi girilmesi gerekiyor
            </Text>
          </View>

          <View style={styles.amountInputContainer}>
            <PaperInput
              mode="outlined"
              label="Kira Miktarı (₺)"
              value={bulkRentAmount}
              onChangeText={setBulkRentAmount}
              keyboardType="numeric"
              style={styles.amountInput}
              right={<PaperInput.Affix text="₺" />}
            />
          </View>

          <View style={styles.unitsGrid}>
            {Array.from({ length: selectedApartment.totalApartments }, (_, i) => i + 1).map(num => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.unitButton,
                  selectedUnits.includes(num) && styles.selectedUnitButton,
                  apartmentUnits[num-1].rentAmount && styles.completedUnitButton,
                  !unassignedUnits.includes(num) && styles.inactiveUnitButton
                ]}
                onPress={() => handleUnitSelection(num)}
                disabled={!unassignedUnits.includes(num) || !bulkRentAmount}
              >
                <Text style={[
                  styles.unitButtonText,
                  selectedUnits.includes(num) && styles.selectedUnitButtonText,
                  apartmentUnits[num-1].rentAmount && styles.completedUnitButtonText
                ]}>
                  {num}
                </Text>
                {apartmentUnits[num-1].rentAmount && (
                  <Text style={styles.unitAmountText}>
                    {apartmentUnits[num-1].rentAmount}₺
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {selectedUnits.length > 0 && (
            <PaperButton
              mode="contained"
              onPress={handleApplyRent}
              style={styles.applyButton}
            >
              {selectedUnits.length} Daireye Uygula
            </PaperButton>
          )}
        </View>
      )}

      {currentStep === 'deposit' && (
        <View style={styles.depositContainer}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>Depozito Miktarı</Text>
            <Text style={styles.remainingText}>
              {unassignedUnits.length} daire için depozito bilgisi girilmesi gerekiyor
            </Text>
          </View>

          <View style={styles.amountInputContainer}>
            <PaperInput
              mode="outlined"
              label="Depozito Miktarı (₺)"
              value={bulkDepositAmount}
              onChangeText={setBulkDepositAmount}
              keyboardType="numeric"
              style={styles.amountInput}
              right={<PaperInput.Affix text="₺" />}
            />
          </View>

          <View style={styles.unitsGrid}>
            {Array.from({ length: selectedApartment.totalApartments }, (_, i) => i + 1).map(num => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.unitButton,
                  selectedUnits.includes(num) && styles.selectedUnitButton,
                  apartmentUnits[num-1].depositAmount && styles.completedUnitButton,
                  !unassignedUnits.includes(num) && styles.inactiveUnitButton
                ]}
                onPress={() => handleUnitSelection(num)}
                disabled={!unassignedUnits.includes(num) || !bulkDepositAmount}
              >
                <Text style={[
                  styles.unitButtonText,
                  selectedUnits.includes(num) && styles.selectedUnitButtonText,
                  apartmentUnits[num-1].depositAmount && styles.completedUnitButtonText
                ]}>
                  {num}
                </Text>
                {apartmentUnits[num-1].depositAmount && (
                  <Text style={styles.unitAmountText}>
                    {apartmentUnits[num-1].depositAmount}₺
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {selectedUnits.length > 0 && (
            <PaperButton
              mode="contained"
              onPress={handleApplyDeposit}
              style={styles.applyButton}
            >
              {selectedUnits.length} Daireye Uygula
            </PaperButton>
          )}
        </View>
      )}

      {currentStep === 'notes' && (
        <View style={styles.notesContainer}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputTitle}>Ek Notlar</Text>
            <Text style={styles.remainingText}>
              İsteğe bağlı olarak dairelere not ekleyebilirsiniz
            </Text>
          </View>

          <View style={styles.notesInputContainer}>
            <PaperInput
              mode="outlined"
              label="Daire Notu"
              value={bulkNotes}
              onChangeText={setBulkNotes}
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />
          </View>

          <View style={styles.unitsGrid}>
            {Array.from({ length: selectedApartment.totalApartments }, (_, i) => i + 1).map(num => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.unitButton,
                  selectedUnits.includes(num) && styles.selectedUnitButton,
                  apartmentUnits[num-1].notes && styles.completedUnitButton,
                  !unassignedUnits.includes(num) && styles.inactiveUnitButton
                ]}
                onPress={() => handleUnitSelection(num)}
                disabled={!unassignedUnits.includes(num) || !bulkNotes}
              >
                <Text style={[
                  styles.unitButtonText,
                  selectedUnits.includes(num) && styles.selectedUnitButtonText,
                  apartmentUnits[num-1].notes && styles.completedUnitButtonText
                ]}>
                  {num}
                </Text>
                {apartmentUnits[num-1].notes && (
                  <Text style={styles.unitAmountText}>
                    {apartmentUnits[num-1].notes}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {selectedUnits.length > 0 && (
            <PaperButton
              mode="contained"
              onPress={handleApplyNotes}
              style={styles.applyButton}
            >
              {selectedUnits.length} Daireye Uygula
            </PaperButton>
          )}
        </View>
      )}

      <View style={styles.navigationButtons}>
        {currentStep !== 'type' && (
          <PaperButton
            mode="outlined"
            onPress={handlePreviousStep}
            style={styles.navButton}
          >
            Önceki
          </PaperButton>
        )}
        <PaperButton
          mode="contained"
          onPress={handleNextStep}
          style={[styles.navButton, styles.primaryButton]}
        >
          Tamamla
        </PaperButton>
      </View>
    </View>
  );

  const renderNoApartmentMessage = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.noApartmentText}>
        Henüz bir apartman eklemediniz
      </Text>
    </View>
  );

  const handleApplyType = () => {
    if (!selectedType || selectedUnits.length === 0) return;

    const updatedUnits = [...apartmentUnits];
    selectedUnits.forEach(unitNumber => {
      updatedUnits[unitNumber - 1] = {
        ...updatedUnits[unitNumber - 1],
        type: selectedType
      };
    });
    setApartmentUnits(updatedUnits);
    
    const remaining = unassignedUnits.filter(num => !selectedUnits.includes(num));
    setUnassignedUnits(remaining);
    
    setSelectedUnits([]);
    setIsSelectingType(false); // Seçim modunu kapat
    
    if (remaining.length === 0) {
      setCompletionStatus(prev => ({ ...prev, type: true }));
      setSelectedType('');
    }
  };

  const handleNextStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
      // Yeni adım için atanmamış daireleri ayarla
      const nextStep = STEPS[currentIndex + 1].id;
      const unassigned = Array.from(
        { length: selectedApartment.totalApartments },
        (_, i) => i + 1
      ).filter(num => {
        const unit = apartmentUnits[num - 1];
        switch (nextStep) {
          case 'type':
            return !unit.type;
          case 'floor':
            return unit.floor === undefined;
          case 'rent':
            return !unit.rentAmount;
          case 'deposit':
            return !unit.depositAmount;
          case 'notes':
            return !unit.notes && nextStep !== 'notes';
          default:
            return true;
        }
      });
      setUnassignedUnits(unassigned);
    } else {
      // Son adımdaysak, apartman listesine ekle
      handleComplete();
    }
  };

  const handlePreviousStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 'type':
        return completionStatus.type;
      case 'floor':
        return completionStatus.floor;
      case 'rent':
        return completionStatus.rent;
      case 'deposit':
        return completionStatus.deposit;
      case 'notes':
        return true;
      default:
        return false;
    }
  };

  const isLastStep = () => {
    return currentStep === STEPS[STEPS.length - 1].id;
  };

  const handleApplyRent = () => {
    if (!bulkRentAmount || selectedUnits.length === 0) return;

    const updatedUnits = [...apartmentUnits];
    selectedUnits.forEach(unitNumber => {
      updatedUnits[unitNumber - 1] = {
        ...updatedUnits[unitNumber - 1],
        rentAmount: bulkRentAmount
      };
    });
    setApartmentUnits(updatedUnits);
    
    const remaining = unassignedUnits.filter(num => !selectedUnits.includes(num));
    setUnassignedUnits(remaining);
    
    setSelectedUnits([]);
    setBulkRentAmount('');

    if (remaining.length === 0) {
      setCompletionStatus(prev => ({ ...prev, rent: true }));
    }
  };

  const handleApplyDeposit = () => {
    if (!bulkDepositAmount || selectedUnits.length === 0) return;

    const updatedUnits = [...apartmentUnits];
    selectedUnits.forEach(unitNumber => {
      updatedUnits[unitNumber - 1] = {
        ...updatedUnits[unitNumber - 1],
        depositAmount: bulkDepositAmount
      };
    });
    setApartmentUnits(updatedUnits);
    
    const remaining = unassignedUnits.filter(num => !selectedUnits.includes(num));
    setUnassignedUnits(remaining);
    
    setSelectedUnits([]);
    setBulkDepositAmount('');

    // Tüm daireler için depozito atandıysa adımı tamamla
    if (remaining.length === 0) {
      setCompletionStatus(prev => ({ ...prev, deposit: true }));
    }
  };

  const handleApplyNotes = () => {
    if (!bulkNotes || selectedUnits.length === 0) return;

    const updatedUnits = [...apartmentUnits];
    selectedUnits.forEach(unitNumber => {
      updatedUnits[unitNumber - 1] = {
        ...updatedUnits[unitNumber - 1],
        notes: bulkNotes
      };
    });
    setApartmentUnits(updatedUnits);
    
    const remaining = unassignedUnits.filter(num => !selectedUnits.includes(num));
    setUnassignedUnits(remaining);
    
    setSelectedUnits([]);
    setBulkNotes('');

    // Tüm daireler için not atandıysa adımı tamamla
    if (remaining.length === 0) {
      setCompletionStatus(prev => ({ ...prev, notes: true }));
    }
  };

  const handleApplyFloor = (floor) => {
    if (selectedUnits.length === 0) return;

    const updatedUnits = [...apartmentUnits];
    selectedUnits.forEach(unitNumber => {
      updatedUnits[unitNumber - 1] = {
        ...updatedUnits[unitNumber - 1],
        floor: floor
      };
    });
    setApartmentUnits(updatedUnits);
    
    const remaining = unassignedUnits.filter(num => !selectedUnits.includes(num));
    setUnassignedUnits(remaining);
    
    setSelectedUnits([]);

    if (remaining.length === 0) {
      setCompletionStatus(prev => ({ ...prev, floor: true }));
    }
  };

  const handleApplyBalcony = () => {
    if (selectedUnits.length === 0) return;

    const updatedUnits = [...apartmentUnits];
    selectedUnits.forEach(unitNumber => {
      updatedUnits[unitNumber - 1] = {
        ...updatedUnits[unitNumber - 1],
        hasBalcony: true
      };
    });
    setApartmentUnits(updatedUnits);
    
    setSelectedUnits([]);
    setCompletionStatus(prev => ({ ...prev, balcony: true }));
  };

  const handleComplete = () => {
    // Apartman ve daire bilgilerini birleştir
    const completedApartment = {
      ...selectedApartment,
      units: apartmentUnits.map(unit => ({
        ...unit,
        floor: unit.floor || 0,
        notes: unit.notes || ''
      })),
      completedAt: new Date().toISOString() // Tamamlanma tarihini ekle
    };

    // Mevcut apartmanlar listesini güncelle
    setApartments(prevApartments => {
      const existingIndex = prevApartments.findIndex(apt => apt.apartmentName === completedApartment.apartmentName);
      if (existingIndex >= 0) {
        // Varolan apartmanı güncelle
        const updatedApartments = [...prevApartments];
        updatedApartments[existingIndex] = completedApartment;
        return updatedApartments;
      } else {
        // Yeni apartman ekle
        return [...prevApartments, completedApartment];
      }
    });

    // Detay ekranını kapat
    setShowApartmentDetails(false);
    
    // Başarı mesajı göster
    Alert.alert(
      "Başarılı",
      "Apartman bilgileri başarıyla kaydedildi.",
      [{ text: "Tamam" }]
    );
  };

  const handleFloorSelection = (floor) => {
    setSelectedFloor(floor);
    // Seçili daireleri temizle
    setSelectedUnits([]);
  };

  const generateFloorList = (totalFloors, hasBasement = false) => {
    let floors = [];
    if (hasBasement) {
      floors.push(-1); // Bodrum kat
    }
    floors.push(0); // Zemin kat
    for (let i = 1; i <= totalFloors - (hasBasement ? 2 : 1); i++) {
      floors.push(i);
    }
    return floors;
  };

  const FloorSelector = ({ currentFloor, onFloorChange }) => {
    const possibleBasements = [-5, -4, -3, -2, -1];

    // Geçici seçim için yeni state
    const [tempBasementFloor, setTempBasementFloor] = useState(null);

    const handleBasementSelect = (floor) => {
      // Sadece geçici seçimi güncelle, henüz katları ekleme
      setTempBasementFloor(floor);
    };

    const handleConfirmBasement = () => {
      if (!tempBasementFloor) return;

      // Seçilen kattan -1'e kadar olan tüm katları ekle
      const basementFloors = [];
      for (let i = tempBasementFloor; i <= -1; i++) {
        basementFloors.push(i);
      }
      
      // Zemin kat ve üst katları ekle
      const upperFloors = [0]; // Zemin kat
      // Toplam kat sayısından bodrum kat sayısını çıkarma
      const remainingFloors = selectedApartment.numberOfFloors - 1; // -1 for ground floor
      
      // Üst katları ekle (1'den başlayarak)
      for (let i = 1; i <= remainingFloors; i++) {
        upperFloors.push(i);
      }

      // Tüm katları birleştir
      const allFloors = [...basementFloors.sort((a, b) => a - b), ...upperFloors];
      
      setAvailableFloors(allFloors);
      setSelectedBasementFloor(tempBasementFloor);
      setSelectedFloor(tempBasementFloor); // En alt kattan başla
      setShowBasementSelector(false);
      setTempBasementFloor(null);
    };

    const getFloorDisplay = (floor) => {
      // Sadece 0. katta "Zemin" göster
      return floor === 0 ? 'Zemin' : `${floor}. Kat`;
    };

    return (
      <View style={styles.floorSelectorContainer}>
        <TouchableOpacity 
          style={styles.floorArrowButton}
          onPress={() => onFloorChange('up')}
          disabled={currentFloor === Math.max(...availableFloors)}
        >
          <MaterialIcons 
            name="keyboard-arrow-up" 
            size={30} 
            color={currentFloor === Math.max(...availableFloors) ? colors.lightGray : colors.primary} 
          />
        </TouchableOpacity>

        <View style={styles.currentFloorContainer}>
          <Text style={styles.currentFloorText}>
            {getFloorDisplay(currentFloor)}
          </Text>
        </View>

        <View style={styles.downArrowContainer}>
          <TouchableOpacity 
            style={styles.floorArrowButton}
            onPress={() => onFloorChange('down')}
            disabled={currentFloor === Math.min(...availableFloors)}
          >
            <MaterialIcons 
              name="keyboard-arrow-down" 
              size={30} 
              color={currentFloor === Math.min(...availableFloors) ? colors.lightGray : colors.primary} 
            />
          </TouchableOpacity>

          {!selectedBasementFloor && (
            <TouchableOpacity 
              style={[
                styles.addBasementButton,
                selectedBasementFloor && styles.disabledButton
              ]}
              onPress={() => setShowBasementSelector(true)}
              disabled={selectedBasementFloor}
            >
              <MaterialIcons 
                name="add" 
                size={24} 
                color={selectedBasementFloor ? colors.lightGray : colors.primary} 
              />
            </TouchableOpacity>
          )}
        </View>

        {showBasementSelector && (
          <View style={styles.basementSelectorContainer}>
            <Text style={styles.basementSelectorTitle}>Bodrum Kat Seç</Text>
            {possibleBasements.map((floor) => (
              <TouchableOpacity
                key={floor}
                style={[
                  styles.basementOptionButton,
                  tempBasementFloor === floor && styles.selectedBasementButton
                ]}
                onPress={() => handleBasementSelect(floor)}
              >
                <Text style={[
                  styles.basementOptionText,
                  tempBasementFloor === floor && styles.selectedBasementText
                ]}>
                  {floor}. Kat
                </Text>
              </TouchableOpacity>
            ))}
            <PaperButton
              mode="contained"
              onPress={handleConfirmBasement}
              style={styles.confirmBasementButton}
              disabled={!tempBasementFloor}
            >
              Onayla
            </PaperButton>
          </View>
        )}
      </View>
    );
  };

  const ResetButton = ({ onReset, section }) => (
    <TouchableOpacity 
      style={styles.resetButton}
      onPress={() => {
        Alert.alert(
          "Değişiklikleri Geri Al",
          `${section} bölümündeki tüm değişiklikler geri alınacak. Emin misiniz?`,
          [
            { text: "İptal", style: "cancel" },
            { 
              text: "Geri Al", 
              onPress: onReset,
              style: "destructive"
            }
          ]
        );
      }}
    >
      <MaterialIcons name="restore" size={20} color={colors.error} />
      <Text style={styles.resetButtonText}>Değişiklikleri Geri Al</Text>
    </TouchableOpacity>
  );

  const handleFloorChange = (direction) => {
    const currentIndex = availableFloors.indexOf(selectedFloor);
    let newIndex;
    
    if (direction === 'up' && currentIndex < availableFloors.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'down' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      return;
    }

    setSelectedFloor(availableFloors[newIndex]);
    setCurrentFloorIndex(newIndex);
    setSelectedUnits([]); // Seçili daireleri temizle
  };

  const handleResetFloors = () => {
    const updatedUnits = [...apartmentUnits].map(unit => ({
      ...unit,
      floor: undefined
    }));
    setApartmentUnits(updatedUnits);
    setUnassignedUnits(Array.from({ length: selectedApartment.totalApartments }, (_, i) => i + 1));
    setSelectedFloor(0);
    setCurrentFloorIndex(0);
    setCompletionStatus(prev => ({ ...prev, floor: false }));
    setHasBasement(false);
    setAvailableFloors(generateFloorList(numberOfFloors, false));
  };

  // Kat hesaplama yardımcı fonksiyonu ekleyelim
  const calculateTotalFloors = (basementCount) => {
    // Toplam kat sayısından bodrum kat sayısını çıkar ve zemin katı da hesaba kat
    return numberOfFloors - basementCount;
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    
    // Seçilen tipi ayarla
    setSelectedType(type);
    
    // Tüm daireleri seçilebilir yap
    const availableUnits = Array.from(
      { length: selectedApartment.totalApartments },
      (_, i) => i + 1
    );
    setUnassignedUnits(availableUnits);
    
    // Seçili daireleri sıfırla
    setSelectedUnits([]);
  };

  const renderApartmentList = () => (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>Mevcut Apartmanlar</Text>
      <FlatList
        data={apartments}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.apartmentCard}>
            <View style={styles.cardHeader}>
              <View style={styles.headerInfo}>
                <Text style={styles.apartmentName}>{item.apartmentName}</Text>
                <Text style={styles.apartmentDetails}>
                  {item.totalApartments} Daire • {item.numberOfFloors} Kat
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  onPress={() => handleEditApartment(item)}
                  style={styles.editButton}
                >
                  <MaterialIcons name="edit" size={24} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDeleteApartment(index)}
                  style={styles.deleteButton}
                >
                  <MaterialIcons name="delete" size={24} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.addressSection}>
                <Text style={styles.addressText}>
                  {item.street} No:{item.buildingNumber}
                </Text>
                <Text style={styles.addressText}>
                  {item.neighborhood}, {item.district}/{item.city}
                </Text>
              </View>

              <View style={styles.utilitiesSection}>
                <Text style={styles.sectionTitle}>Dahili Hizmetler</Text>
                <View style={styles.utilitiesRow}>
                  {item.includedUtilities.electric && (
                    <View style={styles.utilityItem}>
                      <MaterialIcons name="bolt" size={18} color={colors.success} />
                      <Text style={styles.utilityText}>Elektrik</Text>
                    </View>
                  )}
                  {item.includedUtilities.water && (
                    <View style={styles.utilityItem}>
                      <MaterialIcons name="water-drop" size={18} color={colors.success} />
                      <Text style={styles.utilityText}>Su</Text>
                    </View>
                  )}
                  {item.includedUtilities.gas && (
                    <View style={styles.utilityItem}>
                      <MaterialIcons name="local-fire-department" size={18} color={colors.success} />
                      <Text style={styles.utilityText}>Doğalgaz</Text>
                    </View>
                  )}
                  {item.includedUtilities.internet && (
                    <View style={styles.utilityItem}>
                      <MaterialIcons name="wifi" size={18} color={colors.success} />
                      <Text style={styles.utilityText}>İnternet</Text>
                    </View>
                  )}
                </View>
              </View>

              {item.units && (
                <View style={styles.unitsSection}>
                  <Text style={styles.sectionTitle}>Daire Bilgileri</Text>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={item.units}
                    keyExtractor={(unit, unitIndex) => unitIndex.toString()}
                    renderItem={({ item: unit }) => (
                      <View style={styles.unitSummary}>
                        <Text style={styles.unitNumber}>Daire {unit.unitNumber}</Text>
                        <Text style={styles.unitType}>{unit.type}</Text>
                        <Text style={styles.unitFloor}>
                          {unit.floor === 0 ? 'Zemin Kat' : `${unit.floor}. Kat`}
                        </Text>
                        <Text style={styles.unitRent}>Kira: {unit.rentAmount}₺</Text>
                        <Text style={styles.unitDeposit}>Depozito: {unit.depositAmount}₺</Text>
                        {unit.hasBalcony && (
                          <View style={styles.balconyIndicator}>
                            <MaterialIcons name="deck" size={16} color={colors.success} />
                            <Text style={styles.balconyText}>Balkonlu</Text>
                          </View>
                        )}
                        {unit.notes && (
                          <Text style={styles.unitNotes} numberOfLines={2}>
                            {unit.notes}
                          </Text>
                        )}
                      </View>
                    )}
                    style={styles.unitsScrollView}
                  />
                </View>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );

  const handleEditApartment = (apartment) => {
    // Form alanlarını seçilen apartman bilgileriyle doldur
    setApartmentName(apartment.apartmentName);
    setNumberOfFloors(apartment.numberOfFloors.toString());
    setTotalApartments(apartment.totalApartments.toString());
    setCity(apartment.city);
    setDistrict(apartment.district);
    setNeighborhood(apartment.neighborhood);
    setStreet(apartment.street);
    setBuildingNumber(apartment.buildingNumber);
    setPostalCode(apartment.postalCode);
    setIncludedUtilities(apartment.includedUtilities);
    setDuesAmount(apartment.duesAmount || '');

    // Eğer daire bilgileri varsa onları da ayarla
    if (apartment.units) {
      setApartmentUnits(apartment.units);
      // Tamamlanmış adımları işaretle
      const completed = {
        type: apartment.units.every(unit => unit.type),
        floor: apartment.units.every(unit => unit.floor !== undefined),
        balcony: true, // Balkon bilgisi opsiyonel
        rent: apartment.units.every(unit => unit.rentAmount),
        deposit: apartment.units.every(unit => unit.depositAmount),
        notes: true // Notlar opsiyonel
      };
      setCompletionStatus(completed);
    }

    // Seçili apartmanı güncelle
    setSelectedApartment(apartment);
    
    // Form ekranını aç
    setShowForm(true);
    
    // Daire detayları ekranını kapat
    setShowApartmentDetails(false);
  };

  const handleDeleteApartment = (index) => {
    Alert.alert(
      "Apartmanı Sil",
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
            setApartments(prevApartments => {
              const updatedApartments = [...prevApartments];
              updatedApartments.splice(index, 1);
              return updatedApartments;
            });
            Alert.alert("Başarılı", "Apartman başarıyla silindi.");
          }
        }
      ]
    );
  };

  const [selectedImages, setSelectedImages] = useState([]); // Seçilen görseller
  const [isUploading, setIsUploading] = useState(false);

  // Görsel seçme işlemini güncelle
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImages([{
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: `building_${Date.now()}.jpg`
        }]);
      }
    } catch (error) {
      console.error('Görsel seçme hatası:', error);
      Alert.alert('Hata', 'Görsel seçilirken bir hata oluştu');
    }
  };

  // Görsel silme işlemi
  const removeImage = (imageId) => {
    setSelectedImages(prevImages => 
      prevImages.filter(image => image.id !== imageId)
    );
  };

  // Görselleri yükleme işlemi
  const uploadImages = async () => {
    const uploadedImages = [];
    
    for (const image of selectedImages) {
      try {
        const timestamp = Date.now();
        const extension = image.name ? image.name.split('.').pop() : 'jpg';
        const fileName = `image_${timestamp}.${extension}`;

        const formData = new FormData();
        formData.append('file', {
          uri: image.uri,
          type: image.type || "image/jpeg",
          name: fileName
        });

        // URL yapısını düzelt
        const config = {
          method: 'POST',
          url: `${API_ENDPOINTS.IMAGE}/upload`, // /upload endpoint'i
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          data: formData
        };

        console.log(" Görsel yükleme isteği:", {
          url: config.url,
          fileName: fileName
        });

        const response = await axios(config);
        
        if (response.data) {
          uploadedImages.push({
            id: response.data.imageId || "",
            url: response.data.imageUrl || "",
            fileName: fileName
          });
        }
      } catch (error) {
        logApiError(error, "GÖRSEL YÜKLEME");
        throw new Error(`${image.name || 'Görsel'} yüklenirken hata oluştu: ${error.message}`);
      }
    }
    
    return uploadedImages;
  };

  // Apartman bilgilerini sıfırla
  const resetApartment = async () => {
    try {
      await AsyncStorage.removeItem('savedApartment');
      // Tüm state'leri sıfırla
      setApartmentName('');
      setNumberOfFloors('');
      setTotalApartments('');
      // ... diğer state'leri sıfırla
      Alert.alert('Başarılı', 'Apartman bilgileri sıfırlandı');
    } catch (error) {
      console.error('Apartman bilgileri sıfırlanırken hata:', error);
    }
  };

  // State tanımlamalarına ekleyin
  const [isLoading, setIsLoading] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        enabled
      >
        <ScrollView
          ref={scrollViewRef}
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
          ) : apartments.length === 0 ? (
            renderNoApartmentMessage()
          ) : (
            renderApartmentList()
          )}
        </ScrollView>

        {!showForm && !showApartmentDetails && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setShowForm(true);
            }}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
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
    color: colors.primary,
    textAlign: "center",
  },
  formContainer: {
    padding: 20,
    width: '100%',
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
    borderRadius: 10,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: "70%",
    alignSelf: "center",
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
    flex: 1,
    paddingHorizontal: 16, // Yatay padding ekleyerek kenarlardan boşluk bırak
    marginVertical: 20,
  },
  apartmentCard: {
    width: '100%', // Kartın genişliğini tam ekran yap
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
  detailsContainer: {
    flex: 1,
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 1.84,
    elevation: 5,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 10,
    textAlign: "center",
  },
  unitCard: {
    borderRadius: 10,
    padding: 15,
   
    width: 330,
  },
  unitHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  unitTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: colors.black,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: 10,
  },
  counterLabel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    color: colors.darkGray,
  },
  counterButtons: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.textPrimary,
    borderRadius: 8,
  },
  counterButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 15,
    opacity: 1,
  },
  counterButtonText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: "bold",
  },
  counterValue: {
    marginHorizontal: 5,
    fontSize: 14,
    fontWeight: "normal",
    color: colors.primary,
  },
  dropdownContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownLabel: {
    fontSize: 16,
    color: colors.darkGray,
  },
  dropdown: {
    borderColor: colors.primary,
    borderRadius: 5,
  },
  unitInput: {
    marginBottom: 10,
    backgroundColor: colors.white,
  },
  notesInput: {
    backgroundColor: colors.white,
    height: 100,
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
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
    elevation: 2,
  },
  utilitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,  
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
    alignItems: 'center',
  },
  navigationButton: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  noApartmentText: {
    textAlign: 'center',
    fontSize: 18,
    color: colors.gray,
   
  },
  disabledButtonText: {
    color: colors.darkGray,
    opacity: 0.5,
  },
  smallText: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 6,
  },
  dropdownWrapper: {
    flex: 1,
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.textPrimary,
    borderRadius: 4,
    
    zIndex: 1000,
    elevation: 5,
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 10,
    marginVertical: 3,

    backgroundColor:colors.lightGray,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.white,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownLabel: {
    fontSize: 16,
    color: colors.darkGray,
    marginRight: 10,
  },
  dropdownButton: {
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: colors.white,
    elevation: 2,
  },
  typeSelectionContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.primary,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    opacity: (props) => props.disabled ? 0.5 : 1,
  },
  selectedTypeButton: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: colors.white,
  },
  unitSelectorContainer: {
    padding: 15,
  },
  quickSelectContainer: {
    marginBottom: 15,
  },
  quickSelectTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: colors.darkGray,
  },
  quickSelectButton: {
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  quickSelectButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  unitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginVertical: 20,
  },
  unitButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  selectedUnitButton: {
    backgroundColor: colors.primary,
  },
  alreadySetUnit: {
    borderColor: colors.success,
    backgroundColor: colors.lightGreen,
  },
  unitButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedUnitButtonText: {
    color: colors.white,
  },
  existingTypeText: {
    fontSize: 12,
    color: colors.success,
    marginTop: 2,
  },
  bulkInputContainer: {
    padding: 15,
    borderRadius: 8,
  },
  selectedCountText: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  bulkInput: {
    backgroundColor: colors.white,
    marginBottom: 10,
  },
  updateButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
  },

  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
  },
  stepItem: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 5,
  },
  stepTitle: {
    fontSize: 14,
    color: colors.darkGray,
  },
  completedUnitButton: {
    borderColor: colors.success,
    backgroundColor: colors.lightGreen,
  },
  inactiveUnitButton: {
    opacity: 0.5,
    backgroundColor: colors.lightGray,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  completedUnitButtonText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: 'bold',
  },
  unitTypeText: {
    fontSize: 12,
    color: colors.success,
    marginTop: 2,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
  },
  stepItem: {
    flex: 1,
    flexWrap: 'wrap',

    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  stepTitle: {
    fontSize: 14,
    color: colors.darkGray,
  },
  completedUnitButton: {
    borderColor: colors.success,
    backgroundColor: colors.lightGreen,
  },
  inactiveUnitButton: {
    opacity: 0.5,
    backgroundColor: colors.lightGray,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  completedUnitButtonText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: 'bold',
  },
  unitTypeText: {
    fontSize: 12,
    color: colors.success,
    marginTop: 2,
  },
  inputHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  remainingText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  amountInputContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  amountInput: {
    backgroundColor: colors.white,
  },
  notesInputContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  notesInput: {
    backgroundColor: colors.white,
    height: 100,
  },
  unitAmountText: {
    fontSize: 12,
    color: colors.success,
    marginTop: 2,
  },
  applyButton: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: colors.primary,
  },
  floorContainer: {
    padding: 15,
   

    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 20,
   
  },
  floorsGrid: {
    padding: 10,
  },
  floorUnits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    padding: 15,
  },
  unitButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  balconyUnitButton: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.success,
  },
  balconyUnitText: {
    color: colors.success,
  },
  unitDetailText: {
    fontSize: 10,
    color: colors.darkGray,
    marginTop: 2,
  },
  selectedFloorRow: {
    backgroundColor: colors.lightBlue,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  floorNumberContainer: {
    width: 80,
    padding: 5,
    borderRadius: 4,
  },
  selectedFloorNumber: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  unitFloorText: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 10,
    color: colors.darkGray,
    backgroundColor: colors.lightGray,
    padding: 2,
    borderRadius: 4,
  },
  floorSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    padding: 10,
  },
  floorArrowButton: {
    padding: 10,
  },
  currentFloorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginHorizontal: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  currentFloorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addBasementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.lightBlue,
    marginLeft: 10,
  },
  addBasementText: {
    marginLeft: 5,
    color: colors.primary,
    fontSize: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.lightRed,
    alignSelf: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    marginLeft: 5,
    color: colors.error,
    fontSize: 12,
  },
  basementSelectorContainer: {
    position: 'absolute',
    right: 40,
    top: 45,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 15,
    elevation: 4,
    minWidth: 120,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  basementSelectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  basementOptionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 4,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selectedBasementButton: {
    backgroundColor: colors.primary,
  },
  basementOptionText: {
    color: colors.primary,
    fontSize: 14,
    textAlign: 'center',
  },
  selectedBasementText: {
    color: colors.white,
  },
  addBasementButton: {
    padding: 5,
    marginLeft: 5,
    backgroundColor: colors.lightBlue,
    borderRadius: 20,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: colors.lightGray,
  },
  confirmBasementButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    marginLeft: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 8,
    backgroundColor: colors.lightBlue,
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: colors.lightRed,
    borderRadius: 8,
  },
  cardContent: {
    gap: 12,
  },
  utilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGreen,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  utilityText: {
    fontSize: 12,
    color: colors.success,
  },
  unitsSection: {
    marginBottom: 20,
  },
  unitsScrollView: {
    marginTop: 8,
  },
  unitSummary: {
    marginRight: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  unitNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  unitType: {
    fontSize: 14,
    color: colors.success,
    marginTop: 2,
  },
  unitFloor: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 2,
  },
  unitRent: {
    fontSize: 12,
    color: colors.success,
    marginTop: 2,
  },
  unitDeposit: {
    fontSize: 12,
    color: colors.success,
    marginTop: 2,
  },
  balconyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  balconyText: {
    fontSize: 12,
    color: colors.success,
    marginTop: 2,
  },
  unitNotes: {
    fontSize: 12,
    color: colors.darkGray,
    fontStyle: 'italic',
    marginTop: 4,
  },
  stepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Satır sonunda alt satıra geçmesi için
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8, // Adımlar arası boşluk
  },
  stepItemCompleted: {
    backgroundColor: colors.lightBlue, // Tamamlanan adımlar için arka plan
  },
  stepIcon: {
    marginRight: 4,
    color: colors.darkGray, // Tamamlanmamış adımlar için
  },
  stepIconCompleted: {
    color: colors.primary, // Tamamlanan adımlar için
  },
  stepText: {
    fontSize: 12, // Yazı boyutunu küçült
    color: colors.darkGray,
    fontWeight: '500',
  },
  stepTextCompleted: {
    color: colors.primary, // Tamamlanan adımlar için
  },
  // Seçili kat için
  selectedFloorButton: {
    backgroundColor: "#4A90E2", // Orta mavi
  },
  // Seçili olmayan katlar için
  floorButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#4A90E2",
  },
  // Kat numarası text rengi
  floorButtonText: {
    color: "#4A90E2", // Normal durumda
  },
  selectedFloorButtonText: {
    color: "#FFFFFF", // Seçili durumda
  },
  featuresContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
    elevation: 2,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingRight: 10, // Switch için sağ tarafta boşluk bırak
  },
  featureLabel: {
    fontSize: 16,
    color: colors.darkGray,
    flex: 1,
  },
  featureControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Sağa hizala
    flex: 1,
    gap: 15, // Switch ile radio butonlar arası mesafe
  },
  radioGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 10, // Switch'ten önce boşluk bırak
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  radioButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: colors.primary,
  },
  radioText: {
    color: colors.primary,
    fontSize: 14,
  },
  radioTextSelected: {
    color: colors.white,  // Seçili durumda metin rengi beyaz
  },
  switchGroup: {
    marginTop: 10,
  },
  ageInput: {
    width: 80,
    height: 40,
    backgroundColor: colors.white,
  },
  datePickerContainer: {
    alignItems: 'flex-end',
  },
  datePickerButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  datePickerButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
  buildingAgeText: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
    fontStyle: 'italic',
  },
  iosDatePickerContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  iosDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  iosDatePickerButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
  confirmText: {
    fontWeight: 'bold',
  },
  imageUploadContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
    elevation: 2,
    minHeight: 300, // Container'a minimum yükseklik ekleyelim
  },
  imagePreviewContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 15,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    color: colors.darkGray,
    fontSize: 14,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 8,
  },
  imageButtonSelected: {
    backgroundColor: colors.primary,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  uploadingButton: {
    opacity: 0.7,
  },
  imageListContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  addImageCard: {
    width: 150,
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: 'transparent',
  },
  addImageText: {
    color: colors.primary,
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  imageItemContainer: {
    width: 150,
    height: 200,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    padding: 6,
    zIndex: 1,
  },
  uploadedBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 4,
    zIndex: 1,
  },
});

export default ApartmentInfoScreen;
