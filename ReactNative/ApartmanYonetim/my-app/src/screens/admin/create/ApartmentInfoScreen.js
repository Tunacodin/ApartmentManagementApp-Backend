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

      // Yeni daire bilgileri oluştur
      const units = Array.from(
        { length: parseInt(totalApartments) },
        (_, index) => ({
          unitNumber: index + 1,
          floor: undefined,
          rentAmount: '',
          depositAmount: '',
          type: '',
          hasBalcony: false,
          notes: '',
        })
      );

      // Daire bilgilerini ayarla
      setApartmentUnits(units);
      setUnassignedUnits([]);  // Hiçbir daire seçili olmasın
      setSelectedUnits([]);
      
      // Seçili apartmanı ayarla
      setSelectedApartment(apartmentData);
      
      // Form ekranını kapat
      setShowForm(false);
      
      // Daire bilgileri ekranını aç
      setShowApartmentDetails(true);
      setCurrentStep('type');
      
      // Kat bilgileri için gerekli state'leri ayarla
      setSelectedType('');
      setSelectedFloor(0);
      setSelectedBasementFloor(null);
      setAvailableFloors([
        0,
        ...Array.from(
          { length: parseInt(numberOfFloors) - 1 },
          (_, i) => i + 1
        )
      ]);

      Alert.alert(
        "Başarılı", 
        "Apartman bilgileri kaydedildi. Şimdi daire bilgilerini girebilirsiniz."
      );
    } catch (error) {
      console.error("Hata:", error);
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
            <View style={styles.stepContent}>
              <MaterialIcons
                name={step.icon}
                size={24}
                color={completionStatus[step.id] ? colors.primary : colors.darkGray}
              />
              <Text style={[
                styles.stepTitle,
                completionStatus[step.id] && styles.stepTitleCompleted
              ]}>
                {step.title}
              </Text>
            </View>
            {completionStatus[step.id] && (
              <MaterialIcons 
                name="check-circle" 
                size={16} 
                color={colors.primary}
                style={styles.stepCheckIcon}
              />
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
                <Text style={styles.sectionTitle}>Dahil Hizmetler</Text>
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

  // resetForm fonksiyonunu ekleyin
  const resetForm = () => {
    setApartmentName('');
    setNumberOfFloors('');
    setTotalApartments('');
    setCity('');
    setDistrict('');
    setNeighborhood('');
    setStreet('');
    setBuildingNumber('');
    setPostalCode('');
    setDuesAmount('');
    setIncludedUtilities({
      electric: false,
      water: false,
      gas: false,
      internet: false
    });
    setSelectedApartment(null);
    setApartmentUnits([]);
    setCompletionStatus({
      type: false,
      floor: false,
      balcony: false,
      rent: false,
      deposit: false,
      notes: false
    });
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
    alignItems: 'center',
    height: 80, // Sabit yükseklik ver
  },
  stepContent: {
    alignItems: 'center',
    height: 60, // İçerik için sabit yükseklik
  },
  stepTitle: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginTop: 4,
    height: 36, // İki satırlı başlıklar için yeterli yükseklik
  },
  stepTitleCompleted: {
    color: colors.primary,
    fontWeight: '500',
  },
  stepCheckIcon: {
    position: 'absolute',
    bottom: 0, // stepItem'ın en altına yerleştir
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
});

export default ApartmentInfoScreen;
