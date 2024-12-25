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
  const [bulkRentAmount, setBulkRentAmount] = useState('');
  const [bulkDepositAmount, setBulkDepositAmount] = useState('');
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
      console.log('Updated districts for selected city:', cityData.districts);
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
      console.log('Filtered districts:', filtered);
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
    return (
      apartmentName.trim() &&
      !isNaN(numberOfFloors) && numberOfFloors > 0 &&
      !isNaN(totalApartments) && totalApartments > 0 &&
      city.trim() && district.trim() &&
      neighborhood.trim() && street.trim() && 
      /^\d+$/.test(buildingNumber.trim()) &&
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

      // Input alanların temizle
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
      console.log('Cities API Response:', response.data);
      
      if (response.data.status === "OK") {
        const cityData = response.data.data.map(city => ({
          name: city.name,
          districts: city.districts.map(district => ({
            districtId: district.id,
            name: district.name
          }))
        }));
        setCities(cityData);
        console.log('Processed city data:', cityData);
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
      console.log('Neighborhoods API Response:', response.data);
      
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
          right={<PaperInput.Affix text="₺" />}
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
                onPress={() => handleTypeSelection(type)}
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
            <Text style={styles.inputTitle}>Kat Bilgisi</Text>
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
    <Text style={styles.noApartmentText}>Henüz bir apartman eklemediniz</Text>
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
    const updatedApartment = {
      ...selectedApartment,
      units: apartmentUnits.map(unit => ({
        ...unit,
        floor: unit.floor || 0, // Eğer kat bilgisi yoksa 0 olarak ayarla
        notes: unit.notes || '' // Eğer not yoksa boş string olarak ayarla
      }))
    };

    // Mevcut apartmanı güncelle
    const updatedApartments = apartments.map(apt => 
      apt === selectedApartment ? updatedApartment : apt
    );
    setApartments(updatedApartments);

    // Detay ekranını kapat
    setShowApartmentDetails(false);

    // Başarı mesajı göster
    Alert.alert(
      "Başarılı",
      "Daire bilgileri başarıyla kaydedildi.",
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

  const renderApartmentList = () => (
    <View style={styles.listContainer}>
      {apartments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noApartmentText}>Henüz apartman eklenmedi</Text>
        </View>
      ) : (
        <ScrollView style={styles.apartmentList}>
          {apartments.map((apartment, index) => (
            <View key={index} style={styles.apartmentCard}>
              <View style={styles.apartmentHeader}>
                <Text style={styles.apartmentName}>{apartment.apartmentName}</Text>
                <MaterialIcons name="apartment" size={24} color={colors.primary} />
              </View>
              
              <View style={styles.apartmentDetails}>
                <View style={styles.detailRow}>
                  <MaterialIcons name="location-on" size={20} color={colors.darkGray} />
                  <Text style={styles.detailText}>
                    {apartment.street} No:{apartment.buildingNumber}, {apartment.neighborhood}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <MaterialIcons name="place" size={20} color={colors.darkGray} />
                  <Text style={styles.detailText}>
                    {apartment.district}/{apartment.city}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialIcons name="layers" size={20} color={colors.darkGray} />
                  <Text style={styles.detailText}>
                    {apartment.numberOfFloors} Kat | {apartment.totalApartments} Daire
                  </Text>
                </View>

                <View style={styles.utilitiesRow}>
                  <Text style={styles.utilitiesTitle}>Dahil Hizmetler:</Text>
                  <View style={styles.utilitiesIcons}>
                    {apartment.includedUtilities.electric && (
                      <MaterialIcons name="flash-on" size={20} color={colors.success} />
                    )}
                    {apartment.includedUtilities.water && (
                      <MaterialIcons name="water-drop" size={20} color={colors.success} />
                    )}
                    {apartment.includedUtilities.gas && (
                      <MaterialIcons name="local-fire-department" size={20} color={colors.success} />
                    )}
                    {apartment.includedUtilities.internet && (
                      <MaterialIcons name="wifi" size={20} color={colors.success} />
                    )}
                  </View>
                </View>
              </View>

              <PaperButton
                mode="outlined"
                onPress={() => handleAddApartmentDetails(apartment)}
                style={styles.detailsButton}
                icon="arrow-right"
              >
                Daire Bilgilerini Düzenle
              </PaperButton>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity 
        style={styles.fabButton}
        onPress={() => setShowForm(true)}
      >
        <MaterialIcons name="add" size={30} color={colors.white} />
      </TouchableOpacity>
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
          ) : renderApartmentList()}
        </ScrollView>
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
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  animation: {
    width: 150,
    height: 150,
  },
  titleContainer: {
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  fabButton: {
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  apartmentList: {
    paddingHorizontal: 15,
  },
  apartmentCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  apartmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  apartmentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  apartmentDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.darkGray,
  },
  utilitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  utilitiesTitle: {
    fontSize: 16,
    color: colors.darkGray,
    marginRight: 10,
  },
  utilitiesIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  detailsButton: {
    marginTop: 10,
    borderColor: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noApartmentText: {
    fontSize: 18,
    color: colors.darkGray,
    textAlign: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
  listContainer: {
    flex: 1,
    padding: 15,
  },
  apartmentList: {
    flex: 1,
  },
  apartmentCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  apartmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  apartmentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  apartmentDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.darkGray,
  },
  utilitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  utilitiesTitle: {
    fontSize: 16,
    color: colors.darkGray,
    marginRight: 10,
  },
  utilitiesIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  detailsButton: {
    marginTop: 10,
    borderColor: colors.primary,
  }
});

export default ApartmentInfoScreen;
