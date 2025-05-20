import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Switch,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api, API_ENDPOINTS } from '../../../config/apiConfig';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const ApartmentInfoScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('BUILDING'); // BUILDING, UNIT_NUMBERS, FLOORS, RENT, FINAL
  const [buildingData, setBuildingData] = useState({
    buildingName: 'Test Bina',
    numberOfFloors: '5',
    totalApartments: '10',
    occupancyRate: '0',
    city: 'İstanbul',
    district: 'Kadıköy',
    neighborhood: 'Caferağa',
    street: 'Moda Caddesi',
    buildingNumber: '123',
    postalCode: '34710',
    duesAmount: '500',
    includedElectric: false,
    includedWater: false,
    includedGas: false,
    includedInternet: false,
    parkingType: 'Yer Altı',
    hasElevator: true,
    hasPlayground: false,
    heatingType: 'Doğalgaz',
    poolType: 'Yok',
    hasGym: false,
    buildingAge: '5',
    hasGarden: false,
    hasThermalInsulation: true,
    adminId: 4,
    isActive: true,
    image: null,
  });

  const [apartments, setApartments] = useState([]);
  const [selectedApartmentIndex, setSelectedApartmentIndex] = useState(null);
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedApartments, setSelectedApartments] = useState([]);

  useEffect(() => {
    if (currentStep === 'UNIT_NUMBERS') {
      const totalApartments = parseInt(buildingData.totalApartments) || 0;
      if (totalApartments > 0) {
        const initialApartments = Array(totalApartments).fill().map(() => ({
          unitNumber: '',
          floor: '',
          type: '2+1',
          rentAmount: '5000',
          depositAmount: '10000',
          hasBalcony: true,
          notes: '',
        }));
        setApartments(initialApartments);
      } else {
        Alert.alert('Hata', 'Lütfen geçerli bir daire sayısı girin.');
        setCurrentStep('BUILDING');
      }
    }
  }, [currentStep, buildingData.totalApartments]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setBuildingData(prev => ({
          ...prev,
          image: result.assets[0],
        }));
      }
    } catch (error) {
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu.');
    }
  };

  const handleApartmentInput = (value) => {
    if (selectedApartmentIndex === null || !apartments[selectedApartmentIndex]) return;

    const newApartments = [...apartments];
    switch (currentStep) {
      case 'UNIT_NUMBERS':
        newApartments[selectedApartmentIndex] = {
          ...newApartments[selectedApartmentIndex],
          unitNumber: value
        };
        break;
      case 'FLOORS':
        newApartments[selectedApartmentIndex] = {
          ...newApartments[selectedApartmentIndex],
          floor: value
        };
        break;
      case 'RENT':
        newApartments[selectedApartmentIndex] = {
          ...newApartments[selectedApartmentIndex],
          rentAmount: value
        };
        break;
      case 'DEPOSIT':
        newApartments[selectedApartmentIndex] = {
          ...newApartments[selectedApartmentIndex],
          depositAmount: value
        };
        break;
      case 'TYPE':
        newApartments[selectedApartmentIndex] = {
          ...newApartments[selectedApartmentIndex],
          type: value
        };
        break;
    }
    setApartments(newApartments);
  };

  const handleCellPress = (index) => {
    if (selectedApartmentIndex !== null && selectedApartmentIndex !== index) {
      handleApartmentInput(currentInputValue);
    }
    
    const apartment = apartments[index] || {
      unitNumber: '',
      floor: '',
      type: '2+1',
      rentAmount: '5000',
      depositAmount: '10000',
      hasBalcony: true,
      notes: '',
    };

    let displayValue = '';
    let subText = '';
    
    switch (currentStep) {
      case 'UNIT_NUMBERS':
        displayValue = apartment.unitNumber;
        break;
      case 'FLOORS':
        displayValue = apartment.floor;
        subText = apartment.unitNumber;
        break;
      case 'RENT':
        displayValue = apartment.rentAmount;
        subText = `Daire ${apartment.unitNumber} - Kat ${apartment.floor}`;
        break;
      case 'DEPOSIT':
        displayValue = apartment.depositAmount;
        subText = `Daire ${apartment.unitNumber} - Kat ${apartment.floor}`;
        break;
      case 'TYPE':
        displayValue = apartment.type;
        subText = `Daire ${apartment.unitNumber} - Kat ${apartment.floor}`;
        break;
    }

    setSelectedApartmentIndex(index);
    setCurrentInputValue(displayValue);
  };

  const handleBuildingSubmit = async () => {
    try {
      const isComplete = apartments.every(apt => 
        apt.unitNumber && 
        apt.floor && 
        apt.type && 
        apt.rentAmount && 
        apt.depositAmount
      );

      if (!isComplete) {
        Alert.alert('Hata', 'Lütfen tüm daireler için gerekli bilgileri girin.');
        return;
      }

      setLoading(true);

      // Bina verilerini logla
      console.log('=== BİNA VERİLERİ ===');
      console.log('Bina Adı:', buildingData.buildingName);
      console.log('Kat Sayısı:', buildingData.numberOfFloors);
      console.log('Toplam Daire:', buildingData.totalApartments);
      console.log('Şehir:', buildingData.city);
      console.log('İlçe:', buildingData.district);
      console.log('Mahalle:', buildingData.neighborhood);
      console.log('Sokak:', buildingData.street);
      console.log('Bina No:', buildingData.buildingNumber);
      console.log('Posta Kodu:', buildingData.postalCode);
      console.log('Aidat:', buildingData.duesAmount);
      console.log('Parking Tipi:', buildingData.parkingType);
      console.log('Isıtma Tipi:', buildingData.heatingType);
      console.log('Havuz Tipi:', buildingData.poolType);
      console.log('Bina Yaşı:', buildingData.buildingAge);
      console.log('Elektrik Dahil:', buildingData.includedElectric);
      console.log('Su Dahil:', buildingData.includedWater);
      console.log('Doğalgaz Dahil:', buildingData.includedGas);
      console.log('İnternet Dahil:', buildingData.includedInternet);
      console.log('Asansör:', buildingData.hasElevator);
      console.log('Oyun Alanı:', buildingData.hasPlayground);
      console.log('Spor Salonu:', buildingData.hasGym);
      console.log('Bahçe:', buildingData.hasGarden);
      console.log('Isı Yalıtımı:', buildingData.hasThermalInsulation);
      console.log('Admin ID:', buildingData.adminId);
      console.log('Aktif:', buildingData.isActive);
      console.log('Resim:', buildingData.image ? 'Var' : 'Yok');

      const formDataToSend = new FormData();
      
      Object.keys(buildingData).forEach(key => {
        if (key === 'image' && buildingData[key]) {
          formDataToSend.append('image', {
            uri: buildingData[key].uri,
            type: 'image/jpeg',
            name: 'building_image.jpg',
          });
        } else if (key !== 'image') {
          formDataToSend.append(key, buildingData[key]);
        }
      });

      console.log('\n=== GÖNDERİLEN FORMDATA ===');
      console.log('FormData içeriği:', formDataToSend);

      const buildingResponse = await api.post(API_ENDPOINTS.BUILDING.CREATE, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('\n=== API YANITI ===');
      console.log('Bina oluşturma yanıtı:', buildingResponse.data);

      if (buildingResponse.data.success) {
        // Daire verilerini logla
        console.log('\n=== DAİRE VERİLERİ ===');
        apartments.forEach((apt, index) => {
          console.log(`\nDaire ${index + 1}:`);
          console.log('Daire No:', apt.unitNumber);
          console.log('Kat:', apt.floor);
          console.log('Tip:', apt.type);
          console.log('Kira:', apt.rentAmount);
          console.log('Depozito:', apt.depositAmount);
          console.log('Balkon:', apt.hasBalcony);
          console.log('Notlar:', apt.notes);
        });

        const apartmentPromises = apartments.map(async (apartment) => {
          const apartmentData = {
            ...apartment,
            buildingId: buildingResponse.data.data.id,
            floor: parseInt(apartment.floor),
            unitNumber: parseInt(apartment.unitNumber),
            rentAmount: parseFloat(apartment.rentAmount),
            depositAmount: parseFloat(apartment.depositAmount),
            ownerId: 2, // Varsayılan owner ID
            isActive: true,
            isAvailable: true,
            isRented: false
          };
          
          console.log('\nGönderilen daire verisi:', apartmentData);
          
          try {
            const response = await api.post(API_ENDPOINTS.APARTMENT.CREATE, apartmentData);
            console.log('Daire oluşturma yanıtı:', response.data);
            return response;
          } catch (error) {
            console.error('Daire oluşturma hatası:', error);
            throw error;
          }
        });

        const apartmentResponses = await Promise.all(apartmentPromises);
        console.log('\n=== DAİRE OLUŞTURMA YANITLARI ===');
        apartmentResponses.forEach((response, index) => {
          console.log(`Daire ${index + 1} yanıtı:`, response.data);
        });
        
        Alert.alert('Başarılı', 'Bina ve daireler başarıyla oluşturuldu.', [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error('\n=== HATA ===');
      console.error('API Hatası:', error);
      console.error('Hata Detayı:', error.response?.data);
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const renderApartmentGrid = () => {
    const totalApartments = parseInt(buildingData.totalApartments) || 0;
    if (totalApartments === 0) return null;

    const columns = 4;
    const rows = Math.ceil(totalApartments / columns);

    return (
      <View style={styles.gridContainer}>
        {Array(rows).fill().map((_, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {Array(columns).fill().map((_, colIndex) => {
              const index = rowIndex * columns + colIndex;
              if (index >= totalApartments) return null;

              const apartment = apartments[index] || {
                unitNumber: '',
                floor: '',
                type: '2+1',
                rentAmount: '5000',
                depositAmount: '10000',
                hasBalcony: true,
                notes: '',
              };

              let placeholder = '';
              let keyboardType = 'default';
              let value = '';
              
              switch (currentStep) {
                case 'UNIT_NUMBERS':
                  placeholder = 'Daire No';
                  keyboardType = 'numeric';
                  value = apartment.unitNumber;
                  break;
                case 'FLOORS':
                  placeholder = 'Kat No';
                  keyboardType = 'numeric';
                  value = apartment.floor;
                  break;
                case 'RENT':
                  placeholder = 'Kira';
                  keyboardType = 'numeric';
                  value = apartment.rentAmount;
                  break;
                case 'DEPOSIT':
                  placeholder = 'Depozito';
                  keyboardType = 'numeric';
                  value = apartment.depositAmount;
                  break;
                case 'TYPE':
                  placeholder = 'Tip';
                  keyboardType = 'default';
                  value = apartment.type;
                  break;
              }

              return (
                <View
                  key={colIndex}
                  style={[
                    styles.gridCell,
                    selectedApartmentIndex === index && styles.selectedCell
                  ]}
                >
                  <View style={styles.cellContent}>
                    <Text style={styles.cellNumber}>Daire {index + 1}</Text>
                    <TextInput
                      style={styles.cellInput}
                      placeholder={placeholder}
                      value={value}
                      onChangeText={(text) => {
                        const newApartments = [...apartments];
                        switch (currentStep) {
                          case 'UNIT_NUMBERS':
                            newApartments[index] = { ...newApartments[index], unitNumber: text };
                            break;
                          case 'FLOORS':
                            newApartments[index] = { ...newApartments[index], floor: text };
                            break;
                          case 'RENT':
                            newApartments[index] = { ...newApartments[index], rentAmount: text };
                            break;
                          case 'DEPOSIT':
                            newApartments[index] = { ...newApartments[index], depositAmount: text };
                            break;
                          case 'TYPE':
                            newApartments[index] = { ...newApartments[index], type: text };
                            break;
                        }
                        setApartments(newApartments);
                      }}
                      keyboardType={keyboardType}
                      maxLength={currentStep === 'TYPE' ? 10 : 5}
                      textAlign="center"
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const renderApartmentForm = () => {
    let title = '';
    let placeholder = '';
    let keyboardType = 'default';

    switch (currentStep) {
      case 'UNIT_NUMBERS':
        title = 'Daire Numaraları';
        placeholder = 'Daire No';
        keyboardType = 'numeric';
        break;
      case 'FLOORS':
        title = 'Kat Bilgileri';
        placeholder = 'Kat No';
        keyboardType = 'numeric';
        break;
      case 'RENT':
        title = 'Kira Bedelleri';
        placeholder = 'Kira Bedeli';
        keyboardType = 'numeric';
        break;
      case 'DEPOSIT':
        title = 'Depozito Tutarları';
        placeholder = 'Depozito';
        keyboardType = 'numeric';
        break;
      case 'TYPE':
        title = 'Daire Tipleri';
        placeholder = 'Daire Tipi (1+1, 2+1 vb.)';
        break;
    }

    return (
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        
        {selectedApartmentIndex !== null && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              value={currentInputValue}
              onChangeText={(text) => {
                setCurrentInputValue(text);
                handleApartmentInput(text);
              }}
              keyboardType={keyboardType}
              onBlur={() => {
                handleApartmentInput(currentInputValue);
                setSelectedApartmentIndex(null);
              }}
              autoFocus
            />
          </View>
        )}

        {renderApartmentGrid()}

        <View style={styles.buttonContainer}>
          {currentStep !== 'UNIT_NUMBERS' && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => {
                const steps = ['UNIT_NUMBERS', 'FLOORS', 'RENT', 'DEPOSIT', 'TYPE'];
                const currentIndex = steps.indexOf(currentStep);
                setCurrentStep(steps[currentIndex - 1]);
              }}
            >
              <Text style={styles.buttonText}>Geri</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              const steps = ['UNIT_NUMBERS', 'FLOORS', 'RENT', 'DEPOSIT', 'TYPE'];
              const currentIndex = steps.indexOf(currentStep);
              
              if (currentIndex === steps.length - 1) {
                handleBuildingSubmit();
              } else {
                setCurrentStep(steps[currentIndex + 1]);
              }
            }}
          >
            <Text style={styles.buttonText}>
              {currentStep === 'TYPE' ? 'Kaydet' : 'İleri'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBuildingForm = () => (
    <View style={styles.formContainer}>
      <TouchableOpacity style={styles.imageUploadContainer} onPress={pickImage}>
        {buildingData.image ? (
          <Image source={{ uri: buildingData.image.uri }} style={styles.uploadedImage} />
        ) : (
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.uploadPlaceholder}
          >
            <Ionicons name="camera" size={32} color="#FFFFFF" />
            <Text style={styles.uploadText}>Bina Fotoğrafı Ekle</Text>
          </LinearGradient>
        )}
      </TouchableOpacity>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Bina Adı"
          value={buildingData.buildingName}
          onChangeText={(text) => setBuildingData(prev => ({ ...prev, buildingName: text }))}
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Kat Sayısı</Text>
            <TextInput
              style={styles.input}
              placeholder="Kat Sayısı"
              keyboardType="numeric"
              value={buildingData.numberOfFloors}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, '');
                setBuildingData(prev => ({ ...prev, numberOfFloors: numericValue }));
              }}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Daire Sayısı</Text>
            <TextInput
              style={styles.input}
              placeholder="Daire Sayısı"
              keyboardType="numeric"
              value={buildingData.totalApartments}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, '');
                setBuildingData(prev => ({ ...prev, totalApartments: numericValue }));
              }}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <TextInput
              style={styles.input}
              placeholder="Şehir"
              value={buildingData.city}
              onChangeText={(text) => setBuildingData(prev => ({ ...prev, city: text }))}
            />
          </View>
          <View style={styles.halfInput}>
            <TextInput
              style={styles.input}
              placeholder="İlçe"
              value={buildingData.district}
              onChangeText={(text) => setBuildingData(prev => ({ ...prev, district: text }))}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <TextInput
              style={styles.input}
              placeholder="Mahalle"
              value={buildingData.neighborhood}
              onChangeText={(text) => setBuildingData(prev => ({ ...prev, neighborhood: text }))}
            />
          </View>
          <View style={styles.halfInput}>
            <TextInput
              style={styles.input}
              placeholder="Sokak"
              value={buildingData.street}
              onChangeText={(text) => setBuildingData(prev => ({ ...prev, street: text }))}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <TextInput
              style={styles.input}
              placeholder="Bina No"
              value={buildingData.buildingNumber}
              onChangeText={(text) => setBuildingData(prev => ({ ...prev, buildingNumber: text }))}
            />
          </View>
          <View style={styles.halfInput}>
            <TextInput
              style={styles.input}
              placeholder="Posta Kodu"
              value={buildingData.postalCode}
              onChangeText={(text) => setBuildingData(prev => ({ ...prev, postalCode: text }))}
            />
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Aidat Tutarı"
          keyboardType="numeric"
          value={buildingData.duesAmount}
          onChangeText={(text) => setBuildingData(prev => ({ ...prev, duesAmount: text }))}
        />

        <TextInput
          style={styles.input}
          placeholder="Parking Tipi"
          value={buildingData.parkingType}
          onChangeText={(text) => setBuildingData(prev => ({ ...prev, parkingType: text }))}
        />

        <TextInput
          style={styles.input}
          placeholder="Isıtma Tipi"
          value={buildingData.heatingType}
          onChangeText={(text) => setBuildingData(prev => ({ ...prev, heatingType: text }))}
        />

        <TextInput
          style={styles.input}
          placeholder="Havuz Tipi"
          value={buildingData.poolType}
          onChangeText={(text) => setBuildingData(prev => ({ ...prev, poolType: text }))}
        />

        <TextInput
          style={styles.input}
          placeholder="Bina Yaşı"
          keyboardType="numeric"
          value={buildingData.buildingAge}
          onChangeText={(text) => setBuildingData(prev => ({ ...prev, buildingAge: text }))}
        />

        {renderSwitch('Elektrik Dahil', buildingData.includedElectric, 
          (value) => setBuildingData(prev => ({ ...prev, includedElectric: value })))}
        
        {renderSwitch('Su Dahil', buildingData.includedWater,
          (value) => setBuildingData(prev => ({ ...prev, includedWater: value })))}
        
        {renderSwitch('Doğalgaz Dahil', buildingData.includedGas,
          (value) => setBuildingData(prev => ({ ...prev, includedGas: value })))}
        
        {renderSwitch('İnternet Dahil', buildingData.includedInternet,
          (value) => setBuildingData(prev => ({ ...prev, includedInternet: value })))}
        
        {renderSwitch('Asansör', buildingData.hasElevator,
          (value) => setBuildingData(prev => ({ ...prev, hasElevator: value })))}
        
        {renderSwitch('Oyun Alanı', buildingData.hasPlayground,
          (value) => setBuildingData(prev => ({ ...prev, hasPlayground: value })))}
        
        {renderSwitch('Spor Salonu', buildingData.hasGym,
          (value) => setBuildingData(prev => ({ ...prev, hasGym: value })))}
        
        {renderSwitch('Bahçe', buildingData.hasGarden,
          (value) => setBuildingData(prev => ({ ...prev, hasGarden: value })))}
        
        {renderSwitch('Isı Yalıtımı', buildingData.hasThermalInsulation,
          (value) => setBuildingData(prev => ({ ...prev, hasThermalInsulation: value })))}
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => setCurrentStep('UNIT_NUMBERS')}
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Daire Bilgilerini Gir</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderSwitch = (label, value, onValueChange) => (
    <View style={styles.switchContainer}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E2E8F0', true: '#6366F1' }}
        thumbColor={value ? '#FFFFFF' : '#F4F3F4'}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Kaydediliyor...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="business" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>
              {currentStep === 'BUILDING' ? 'Yeni Bina Oluştur' : 'Daire Bilgileri'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {currentStep === 'BUILDING' ? 'Bina bilgilerini girin' : 'Daire detaylarını belirleyin'}
            </Text>
          </View>
        </LinearGradient>

        {currentStep === 'BUILDING' ? renderBuildingForm() : renderApartmentForm()}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  formContainer: {
    padding: 20,
  },
  imageUploadContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  inputGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#334155',
  },
  button: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  gridContainer: {
    marginTop: 10,
    paddingHorizontal: 5,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gridCell: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedCell: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
  },
  cellContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  cellInput: {
    width: '100%',
    height: 30,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 4,
    paddingHorizontal: 4,
    fontSize: 14,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  inputButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  inputButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  floorInputContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  floorInput: {
    width: '80%',
    height: 30,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 4,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: '#fff',
  },
  floorSelectionContainer: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  floorOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  selectedFloorOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  floorOptionText: {
    fontSize: 14,
    color: '#212529',
  },
  selectedFloorOptionText: {
    color: '#fff',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  floorAssignmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  floorAssignmentText: {
    fontSize: 14,
    color: '#666',
  },
  finishButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  floorCountText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  floorVisualContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  floorVisualOption: {
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selectedFloorVisualOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
  },
  floorVisualContent: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floorVisualText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  selectedFloorVisualText: {
    color: '#2196f3',
  },
  floorVisualLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#dee2e6',
    marginLeft: 15,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  floorHeaderContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  floorHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  floorInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floorInfoText: {
    fontSize: 14,
    color: '#495057',
  },
  floorInfoHighlight: {
    color: '#2196f3',
    fontWeight: '600',
  },
  floorAssignmentButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  floorButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  floorButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  unitNumberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
    marginTop: 8,
  },
});

export default ApartmentInfoScreen;
