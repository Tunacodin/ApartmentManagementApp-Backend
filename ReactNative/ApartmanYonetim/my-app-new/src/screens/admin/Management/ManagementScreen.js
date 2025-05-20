import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, StyleSheet, FlatList, TouchableOpacity, Dimensions, TextInput, Linking, Animated, Modal, Clipboard } from 'react-native';
import { 
  Card, 
  Text, 
  Avatar, 
  ProgressBar, 
  Surface, 
  ActivityIndicator, 

  Chip, 

} from 'react-native-paper';
import { Colors, Gradients } from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';
import Theme from '../../../constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const CustomBadge = ({ children, style, textStyle }) => (
  <View style={[styles.customBadge, style]}>
    <Text style={[styles.customBadgeText, textStyle]}>{children}</Text>
  </View>
);

// BuildingSelector Component (Updated to FlatList)
const BuildingSelector = ({ buildings = [], selectedBuilding, onSelectBuilding }) => {
  const renderBuildingItem = ({ item }) => {
    if (!item) return null;

    const isSelected = selectedBuilding?.id === item.id;

    return (
      <TouchableOpacity
        onPress={() => onSelectBuilding(item)}
        activeOpacity={0.8}
        style={[
          styles.buildingCard,
          isSelected && styles.selectedBuildingCard
        ]}
      >
        {!isSelected && (
          <BlurView
            intensity={10}
            tint="light"
            style={[
              StyleSheet.absoluteFill,
              { 
                borderRadius: 20,
                borderWidth: 2,
                borderColor: 'rgba(125, 211, 252, 0.5)'
              }
            ]}
          />
        )}
        <LinearGradient
          colors={isSelected ? ['#2C3E50', '#3498DB'] : ['transparent', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.buildingCardGradient,
            !isSelected && {
              backgroundColor: 'transparent',
              position: 'relative',
            }
          ]}
        >
          <View style={styles.buildingCardHeader}>
            <View style={[
              styles.buildingIconContainer,
              { backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent' }
            ]}>
              <Icon 
                name="office-building" 
                size={24} 
                color={isSelected ? '#FFFFFF' : Colors.primary}
              />
            </View>
            <CustomBadge
              style={[
                styles.occupancyBadge,
                { backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent' }
              ]}
              textStyle={{ color: isSelected ? '#FFFFFF' : Colors.success }}
            >
              {item?.occupancyRate || 0}% Dolu
            </CustomBadge>
          </View>
          
          <Text style={[
            styles.buildingCardName,
            { color: isSelected ? '#FFFFFF' : Colors.text }
          ]}>
            {item?.name || 'Bina'}
          </Text>
          
          <View style={styles.buildingCardFooter}>
            <View style={styles.buildingStatItem}>
              <Icon 
                name="door" 
                size={16} 
                color={isSelected ? 'rgba(255,255,255,0.8)' : Colors.textSecondary}
              />
              <Text style={[
                styles.buildingStatText,
                { color: isSelected ? 'rgba(255,255,255,0.8)' : Colors.textSecondary }
              ]}>
                {item?.totalApartments || 0} Daire
              </Text>
            </View>
            <View style={styles.buildingStatItem}>
              <Icon 
                name="office-building-outline" 
                size={16} 
                color={isSelected ? 'rgba(255,255,255,0.8)' : Colors.textSecondary}
              />
              <Text style={[
                styles.buildingStatText,
                { color: isSelected ? 'rgba(255,255,255,0.8)' : Colors.textSecondary }
              ]}>
                {item?.floorCount || 0} Kat
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyBuildingContainer}>
      <Icon name="office-building-outline" size={32} color={Colors.textSecondary} />
      <Text style={styles.emptyBuildingText}>Bina bulunamadı</Text>
    </View>
  );

  // buildings prop'u undefined veya null ise boş dizi kullan
  const safeBuildings = buildings || [];

  return (
    <FlatList
      horizontal
      data={safeBuildings}
      renderItem={renderBuildingItem}
      keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.buildingSelectorContainer,
        !safeBuildings.length && styles.emptyBuildingSelectorContainer,
        { paddingHorizontal: width * 0.075 }
      ]}
      snapToInterval={width * 0.85 + 16}
      decelerationRate={0.2}
      snapToAlignment="center"
      ListEmptyComponent={renderEmptyComponent}
      getItemLayout={(data, index) => ({
        length: width * 0.85 + 16,
        offset: (width * 0.85 + 16) * index,
        index,
      })}
    />
  );
};

// ApartmentsList Component
const ApartmentsList = ({ apartments, navigation, buildingId }) => {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    status: 'all',
    floor: 'all',
    type: 'all'
  });
  const [floorInput, setFloorInput] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apartmentsData, setApartmentsData] = useState([]);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchApartments = async () => {
      if (!buildingId) {
        console.log('=== ApartmentsList: No buildingId provided ===');
        setLoading(false);
        return;
      }
      
      try {
        console.log('=== ApartmentsList: Fetching apartments ===');
        console.log('Building ID:', buildingId);
        
        setLoading(true);
        const url = API_ENDPOINTS.BUILDING.APARTMENTS(buildingId);
        console.log('API Endpoint Configuration:', {
          endpoint: 'API_ENDPOINTS.BUILDING.APARTMENTS',
          fullUrl: url,
          buildingId: buildingId
        });
        
        const response = await axios.get(url);
        
        console.log('=== ApartmentsList: API Response ===');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.data) {
          setApartmentsData(response.data.data);
          setError(null);
          console.log('Apartments data set successfully');
        } else {
          throw new Error('Geçersiz veri formatı');
        }
      } catch (err) {
        console.error('=== ApartmentsList: Error fetching apartments ===');
        console.error('Error Type:', err.name);
        console.error('Error Message:', err.message);
        if (err.response) {
          console.error('Error Response:', JSON.stringify(err.response.data, null, 2));
          console.error('Error Status:', err.response.status);
        }
        setError('Daire verileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, [buildingId]);

  // Benzersiz kat ve daire tiplerini bul
  const uniqueFloors = [...new Set(apartmentsData?.map(apt => apt.floor))].sort((a, b) => a - b);
  const uniqueTypes = [...new Set(apartmentsData?.map(apt => apt.type))];

  // Maksimum kat sayısını bul
  const maxFloor = Math.max(...apartmentsData?.map(apt => apt.floor) || [0]);

  const filteredApartments = apartmentsData?.filter(apt => {
    const matchesStatus = activeFilters.status === 'all' || 
      (activeFilters.status === 'empty' ? apt.status === 'Boş' : apt.status === 'Dolu');
    
    const matchesFloor = activeFilters.floor === 'all' || 
      (floorInput && apt.floor.toString() === floorInput);
    
    const matchesType = activeFilters.type === 'all' || 
      apt.type === activeFilters.type;

    const matchesSearch = searchText === '' ||
      apt.unitNumber.toString().includes(searchText) ||
      (apt.tenantName && apt.tenantName.toLowerCase().includes(searchText.toLowerCase()));

    return matchesStatus && matchesFloor && matchesType && matchesSearch;
  });

  const paginatedApartments = filteredApartments?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil((filteredApartments?.length || 0) / itemsPerPage);

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPage(1); // Filtre değiştiğinde ilk sayfaya dön
  };

  const handleViewDetails = (apartmentId) => {
    navigation.navigate('ApartmentDetails', { apartmentId });
  };

  const renderApartmentItem = ({ item }) => {
    const isOccupied = item.status === 'Dolu';
    return (
      <Surface 
        style={[
          styles.apartmentItemNew, 
          { 
            backgroundColor: '#F8FAFC',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            borderWidth: 1,
            borderColor: '#E2E8F0'
          }
        ]} 
      >
        <View style={[styles.apartmentItemContentNew]}>
          {/* Üst Kısım - Daire No ve Durum */}
          <View style={styles.apartmentHeaderNew}>
              <View style={styles.apartmentHeaderLeft}>
              <View style={{
                backgroundColor: isOccupied ? '#DCF5E8' : '#FFF0DB',
                padding: 8,
                borderRadius: 10
              }}>
                  <Icon 
                    name={isOccupied ? "home" : "home-outline"} 
                    size={24} 
                    color={isOccupied ? '#1B874B' : '#D97706'}
                  />
              </View>
              <Text style={[
                styles.apartmentNumberNew,
                { color: '#334155', marginLeft: 12 }
              ]}>
                Daire {item.unitNumber}
              </Text>
            </View>
            <CustomBadge
              style={[
                styles.statusBadgeNew,
                { 
                  backgroundColor: isOccupied ? '#DCF5E8' : '#FFF0DB',
                  borderWidth: 1,
                  borderColor: isOccupied ? '#86EFAC' : '#FCD34D'
                }
              ]}
              textStyle={{ 
                color: isOccupied ? '#1B874B' : '#D97706',
                fontFamily: Fonts.urbanist.semiBold,
                fontSize: 13
              }}
            >
              {item.status}
            </CustomBadge>
          </View>

          {/* Daire Bilgileri */}
          <View style={[
            styles.apartmentInfoRow, 
            { 
              backgroundColor: '#FFFFFF',
              padding: 12,
              borderRadius: 10,
              marginVertical: 12,
              borderWidth: 1,
              borderColor: '#E2E8F0'
            }
          ]}>
            <View style={styles.infoItem}>
              <Icon name="floor-plan" size={16} color="#475569" />
              <Text style={[styles.infoText, { color: '#475569', marginLeft: 6 }]}>
                {item.floor}. Kat
              </Text>
            </View>
            <View style={[styles.infoItemDivider, { backgroundColor: '#E2E8F0' }]} />
            <View style={styles.infoItem}>
              <Icon name="home-variant" size={16} color="#475569" />
              <Text style={[styles.infoText, { color: '#475569', marginLeft: 6 }]}>
                {item.type}
              </Text>
            </View>
            {isOccupied && (
              <>
                <View style={[styles.infoItemDivider, { backgroundColor: '#E2E8F0' }]} />
                <View style={styles.infoItem}>
                  <Icon name="account" size={16} color="#475569" />
                  <Text style={[styles.infoText, { color: '#475569', marginLeft: 6 }]}>
                    {item.tenantName}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Alt Kısım - Detay Butonu */}
          <TouchableOpacity 
            style={[
              styles.apartmentActionButtonNew,
              {
                backgroundColor: '#E0F2FE',
                borderWidth: 1,
                borderColor: '#7DD3FC',
                padding: 12,
                borderRadius: 10,
                marginTop: 4
              }
            ]}
            onPress={() => handleViewDetails(item.id)}
          >
            <Text style={[
              styles.apartmentActionTextNew,
              { color: '#0369A1', fontFamily: Fonts.urbanist.semiBold }
            ]}>
              Detayları Görüntüle
            </Text>
            <Icon name="chevron-right" size={20} color="#0369A1" />
          </TouchableOpacity>
        </View>
      </Surface>
    );
  };

  return (
    <Card style={[styles.sectionCardNew]}>
      <LinearGradient
        colors={Gradients.indigo}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
      
        }}
      >
      <Card.Title 
        title="Daireler" 
          titleStyle={[styles.sectionTitleNew, { color: '#FFFFFF' }]}
        subtitle={`Toplam: ${filteredApartments?.length || 0}`}
          subtitleStyle={[styles.sectionSubtitleNew, { color: 'rgba(255,255,255,0.8)' }]}
        left={(props) => (
            <View key="icon" style={[styles.sectionIconContainerNew, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Icon {...props} name="door" size={24} color="#FFFFFF" />
            </View>
          )}
          right={(props) => (
            <View key="filters" style={styles.headerFiltersContainer}>
              <TextInput
                key="floorInput"
                style={[styles.floorFilterInput, {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: '#FFFFFF',
                }]}
                placeholder={`1-${maxFloor} kat`}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={floorInput}
                onChangeText={(text) => {
                  const numValue = parseInt(text);
                  if (text === '' || (numValue >= 1 && numValue <= maxFloor)) {
                    setFloorInput(text);
                    handleFilterChange('floor', text === '' ? 'all' : text);
                  }
                }}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          )}
        />
        <Card.Content>
          {/* Arama Çubuğu */}
          <View style={[styles.searchBarContainerNew, {
            backgroundColor: '#F8FAFC',
            borderColor: '#E2E8F0'
          }]}>
            <Icon name="magnify" size={20} color="#3498DB" style={styles.searchIconNew} />
            <TextInput
              placeholder="Daire no ara..."
              placeholderTextColor="#94A3B8"
              style={[styles.searchInputNew, { color: '#2C3E50' }]}
              onChangeText={text => {
                setSearchText(text);
                setPage(1);
              }}
              value={searchText}
            />
            {searchText !== '' && (
              <TouchableOpacity 
                onPress={() => {
                  setSearchText('');
                  setPage(1);
                }} 
                style={styles.clearSearchNew}
              >
                <Icon name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filtre Grupları */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
          >
            {/* Durum Filtreleri */}
            <View style={styles.filterGroupNew}>
              <Text style={[styles.filterGroupLabelNew, { color: '#FFFFFF',marginLeft: 16 }]}>Durum:</Text>
              <View style={styles.filterButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.filterButtonNew,
                    { backgroundColor: '#F8FAFC' },
                    activeFilters.status === 'all' && { 
                      backgroundColor: '#EBF5FB',
                      borderColor: '#3498DB'
                    }
                  ]}
                  onPress={() => handleFilterChange('status', 'all')}
                >
                  <Icon 
                    name="view-grid" 
                    size={20} 
                    color={activeFilters.status === 'all' ? '#3498DB' : '#94A3B8'} 
                  />
                  <Text style={[
                    styles.filterTextNew,
                    { color: '#64748B' },
                    activeFilters.status === 'all' && { 
                      color: '#3498DB',
                      fontFamily: Fonts.urbanist.bold 
                    }
                  ]}>Tümü</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterButtonNew,
                    { backgroundColor: '#F8FAFC' },
                    activeFilters.status === 'empty' && { 
                      backgroundColor: '#EBF5FB',
                      borderColor: '#3498DB'
                    }
                  ]}
                  onPress={() => handleFilterChange('status', 'empty')}
                >
                  <Icon 
                    name="home-outline" 
                    size={20} 
                    color={activeFilters.status === 'empty' ? '#3498DB' : '#94A3B8'} 
                  />
                  <Text style={[
                    styles.filterTextNew,
                    { color: '#64748B' },
                    activeFilters.status === 'empty' && { 
                      color: '#3498DB',
                      fontFamily: Fonts.urbanist.bold 
                    }
                  ]}>Boş</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterButtonNew,
                    { backgroundColor: '#F8FAFC' },
                    activeFilters.status === 'occupied' && { 
                      backgroundColor: '#EBF5FB',
                      borderColor: '#3498DB'
                    }
                  ]}
                  onPress={() => handleFilterChange('status', 'occupied')}
                >
                  <Icon 
                    name="home" 
                    size={20} 
                    color={activeFilters.status === 'occupied' ? '#3498DB' : '#94A3B8'} 
                  />
                  <Text style={[
                    styles.filterTextNew,
                    { color: '#64748B' },
                    activeFilters.status === 'occupied' && { 
                      color: '#3498DB',
                      fontFamily: Fonts.urbanist.bold 
                    }
                  ]}>Dolu</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Daire Tipi - Dropdown ile */}
        
          </ScrollView>

          {/* Aktif Filtreler */}
          {(activeFilters.status !== 'all' || activeFilters.floor !== 'all' || activeFilters.type !== 'all' || searchText !== '') && (
            <View style={styles.activeFiltersContainer}>
              <Text style={[styles.activeFiltersLabel, { color: '#64748B' }]}>
                Aktif Filtreler:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {activeFilters.status !== 'all' && (
                  <Chip 
                    mode="outlined" 
                    onClose={() => handleFilterChange('status', 'all')}
                    style={[styles.activeFilterChip, {
                      backgroundColor: '#EBF5FB',
                      borderColor: '#3498DB'
                    }]}
                    textStyle={{ color: '#3498DB' }}
                  >
                    {activeFilters.status === 'empty' ? 'Boş Daireler' : 'Dolu Daireler'}
                  </Chip>
                )}
                {activeFilters.floor !== 'all' && (
                  <Chip 
                    mode="outlined" 
                    onClose={() => handleFilterChange('floor', 'all')}
                    style={[styles.activeFilterChip, {
                      backgroundColor: '#EBF5FB',
                      borderColor: '#3498DB'
                    }]}
                    textStyle={{ color: '#3498DB' }}
                  >
                    {activeFilters.floor}. Kat
                  </Chip>
                )}
                {activeFilters.type !== 'all' && (
                  <Chip 
                    mode="outlined" 
                    onClose={() => handleFilterChange('type', 'all')}
                    style={[styles.activeFilterChip, {
                      backgroundColor: '#EBF5FB',
                      borderColor: '#3498DB'
                    }]}
                    textStyle={{ color: '#3498DB' }}
                  >
                    {activeFilters.type}
                  </Chip>
                )}
                {searchText !== '' && (
                  <Chip 
                    mode="outlined" 
                    onClose={() => setSearchText('')}
                    style={[styles.activeFilterChip, {
                      backgroundColor: '#EBF5FB',
                      borderColor: '#3498DB'
                    }]}
                    textStyle={{ color: '#3498DB' }}
                  >
                    Arama: {searchText}
                  </Chip>
                )}
              </ScrollView>
            </View>
          )}

          {/* Daire Listesi */}
          <FlatList
            data={paginatedApartments}
            renderItem={renderApartmentItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => (
              <View style={[styles.separatorNew, { backgroundColor: '#F1F5F9' }]} />
            )}
            contentContainerStyle={styles.listContainerNew}
            ListEmptyComponent={() => (
              <View style={styles.emptyListContainer}>
                <Icon name="home-search" size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyListText}>Filtrelere uygun daire bulunamadı</Text>
              </View>
            )}
          />

          {/* Sayfalama */}
          {totalPages > 1 && (
            <View style={styles.paginationContainerNew}>
              <TouchableOpacity 
                onPress={() => setPage(1)}
                disabled={page === 1}
                style={[
                  styles.pageButtonNew,
                  page === 1 && styles.pageButtonDisabledNew
                ]}
              >
                <Icon 
                  name="chevron-double-left" 
                  size={18} 
                  color={page === 1 ? '#94A3B8' : Colors.primary} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={[
                  styles.pageButtonNew,
                  page === 1 && styles.pageButtonDisabledNew
                ]}
              >
                <Icon 
                  name="chevron-left" 
                  size={18} 
                  color={page === 1 ? '#94A3B8' : Colors.primary} 
                />
              </TouchableOpacity>

              <View style={styles.paginationSeparator} />
              
              <Text style={styles.paginationInfoText}>
                Sayfa {page} / {totalPages}
              </Text>

              <View style={styles.paginationSeparator} />

              <TouchableOpacity 
                onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={[
                  styles.pageButtonNew,
                  page === totalPages && styles.pageButtonDisabledNew
                ]}
              >
                <Icon 
                  name="chevron-right" 
                  size={18} 
                  color={page === totalPages ? '#94A3B8' : Colors.primary} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setPage(totalPages)}
                disabled={page === totalPages}
                style={[
                  styles.pageButtonNew,
                  page === totalPages && styles.pageButtonDisabledNew
                ]}
              >
                <Icon 
                  name="chevron-double-right" 
                  size={18} 
                  color={page === totalPages ? '#94A3B8' : Colors.primary} 
                />
              </TouchableOpacity>
            </View>
          )}
        </Card.Content>
      </LinearGradient>
    </Card>
  );
};

// ContractModal Component
const ContractModal = ({ visible, onClose, contractFile }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    if (!contractFile) return;
    
    try {
      setLoading(true);
      setError(null);
      await Linking.openURL(contractFile);
    } catch (err) {
      console.error('Error opening contract:', err);
      setError('Sözleşme açılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView
          intensity={20}
          tint="dark"
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sözleşme Detayları</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#475569" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {contractFile ? (
                <View style={styles.contractContainer}>
                  <View style={styles.contractIconContainer}>
                    <Icon name="file-document" size={48} color="#0369A1" />
                  </View>
                  <Text style={styles.contractTitle}>Sözleşme Dosyası</Text>
                  <Text style={styles.contractSubtitle}>
                    Sözleşmeyi görüntülemek veya indirmek için aşağıdaki butonu kullanabilirsiniz.
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={handleDownload}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Icon name="download" size={20} color="#FFFFFF" />
                        <Text style={styles.downloadButtonText}>Sözleşmeyi Aç</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {error && (
                    <View style={styles.errorContainer}>
                      <Icon name="alert-circle" size={20} color="#EF4444" />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconContainer}>
                    <Icon name="file-alert" size={48} color="#EF4444" />
                  </View>
                  <Text style={styles.emptyTitle}>Sözleşme Bulunamadı</Text>
                  <Text style={styles.emptySubtitle}>
                    Bu kiracı için henüz bir sözleşme yüklenmemiş.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

// ComplaintsModal Component
const ComplaintsModal = ({ visible, onClose, buildingId }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingComplaint, setProcessingComplaint] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!buildingId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(API_ENDPOINTS.COMPLAINT.BY_BUILDING(buildingId));
        
        if (response.data && response.data.success) {
          setComplaints(response.data.data);
          setError(null);
        } else {
          throw new Error('Şikayet verileri alınamadı');
        }
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Şikayet verileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchComplaints();
    }
  }, [buildingId, visible]);

  const handleTakeComplaint = async (complaintId) => {
    try {
      setProcessingComplaint(complaintId);
      const adminId = getCurrentAdminId();
      const url = API_ENDPOINTS.COMPLAINT.TAKE(complaintId, adminId);
      
      console.log('Taking complaint with URL:', url);
      
      const response = await axios.put(url, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.success) {
        // Refresh complaints list
        const complaintsResponse = await axios.get(API_ENDPOINTS.COMPLAINT.BY_BUILDING(buildingId));
        if (complaintsResponse.data && complaintsResponse.data.success) {
          setComplaints(complaintsResponse.data.data);
        }
      } else {
        throw new Error('İşlem başarısız oldu');
      }
    } catch (error) {
      console.error('Error taking complaint:', error);
      if (error.response) {
        console.error('Error Response:', error.response.data);
        alert(`Şikayet işleme alınamadı: ${error.response.data.message || 'Bir hata oluştu'}`);
      } else {
        alert('Şikayet işleme alınırken bir hata oluştu');
      }
    } finally {
      setProcessingComplaint(null);
    }
  };

  const handleResolveComplaint = async (complaintId) => {
    try {
      setProcessingComplaint(complaintId);
      const adminId = getCurrentAdminId();
      const url = API_ENDPOINTS.COMPLAINT.RESOLVE(complaintId, adminId);
      
      await axios.post(url, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh complaints list
      const response = await axios.get(API_ENDPOINTS.COMPLAINT.BY_BUILDING(buildingId));
      if (response.data && response.data.success) {
        setComplaints(response.data.data);
      }
    } catch (error) {
      console.error('Error resolving complaint:', error);
      if (error.response) {
        console.error('Error Response:', error.response.data);
      }
    } finally {
      setProcessingComplaint(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 0: // Open
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <Text style={[styles.statusText, { color: '#B45309' }]}>Yeni</Text>
          </View>
        );
      case 1: // InProgress
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' }]}>
            <Text style={[styles.statusText, { color: '#1D4ED8' }]}>İşleme Alındı</Text>
          </View>
        );
      case 2: // Resolved
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5', borderColor: '#10B981' }]}>
            <Text style={[styles.statusText, { color: '#047857' }]}>Çözüldü</Text>
          </View>
        );
      case 3: // Closed
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#E5E7EB', borderColor: '#6B7280' }]}>
            <Text style={[styles.statusText, { color: '#374151' }]}>Kapatıldı</Text>
          </View>
        );
      case 4: // Rejected
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
            <Text style={[styles.statusText, { color: '#B91C1C' }]}>Reddedildi</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const complaintDate = new Date(date);
    const diffInSeconds = Math.floor((now - complaintDate) / 1000);
    
    if (diffInSeconds < 60) return 'Az önce';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} gün önce`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} ay önce`;
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 0: // Low
        return (
          <View style={[styles.priorityBadge, { backgroundColor: '#E0F2FE', borderColor: '#7DD3FC' }]}>
            <Icon name="alert-circle-outline" size={14} color="#0369A1" />
            <Text style={[styles.priorityText, { color: '#0369A1' }]}>Düşük</Text>
          </View>
        );
      case 1: // Medium
        return (
          <View style={[styles.priorityBadge, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <Icon name="alert-circle" size={14} color="#B45309" />
            <Text style={[styles.priorityText, { color: '#B45309' }]}>Orta</Text>
          </View>
        );
      case 2: // High
        return (
          <View style={[styles.priorityBadge, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
            <Icon name="alert-circle" size={14} color="#B91C1C" />
            <Text style={[styles.priorityText, { color: '#B91C1C' }]}>Yüksek</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderComplaintItem = ({ item }) => (
    <Surface style={[styles.complaintItem, { elevation: 2 }]}>
      <View style={styles.complaintHeader}>
        <View style={styles.complaintTitleContainer}>
          <Icon name="alert-circle" size={20} color="#EF4444" />
          <Text style={styles.complaintSubject}>{item.subject}</Text>
        </View>
        {getStatusBadge(item.status)}
      </View>
      
      <View style={styles.complaintMetaInfo}>
        <View style={styles.metaItem}>
          <Icon name="home" size={16} color="#64748B" />
          <Text style={styles.metaText}>Daire {item.apartmentNumber || 'Belirtilmemiş'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="clock-outline" size={16} color="#64748B" />
          <Text style={styles.metaText}>{getTimeAgo(item.createdAt)}</Text>
        </View>
        {getPriorityBadge(item.priority)}
      </View>
      
      <Text style={styles.complaintDescription}>{item.description}</Text>
      
      <View style={styles.complaintFooter}>
        <View style={styles.complaintUserInfo}>
          {item.createdByProfileImage ? (
            <Avatar.Image 
              size={24} 
              source={{ uri: item.createdByProfileImage }}
              style={{ backgroundColor: 'transparent', marginRight: 8 }}
            />
          ) : (
            <Avatar.Text 
              size={24} 
              label={item.createdByName?.split(' ').map(n => n[0]).join('')}
              style={{ backgroundColor: '#E0F2FE', marginRight: 8 }}
              labelStyle={{ color: '#0369A1', fontSize: 12 }}
            />
          )}
          <Text style={styles.complaintUserName}>{item.createdByName}</Text>
          <Text style={styles.complaintDate}>
            {new Date(item.createdAt).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        {/* Action Buttons */}
        {(item.status === 0 || item.status === 1) && (
          <View style={styles.complaintActions}>
            {item.status === 0 && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#DBEAFE', marginRight: 8 }]}
                onPress={() => handleTakeComplaint(item.id)}
                disabled={processingComplaint === item.id}
              >
                {processingComplaint === item.id ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <>
                    <Icon name="play-circle" size={16} color="#3B82F6" />
                    <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>İşleme Al</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            {item.status === 1 && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#D1FAE5' }]}
                onPress={() => handleResolveComplaint(item.id)}
                disabled={processingComplaint === item.id}
              >
                {processingComplaint === item.id ? (
                  <ActivityIndicator size="small" color="#10B981" />
                ) : (
                  <>
                    <Icon name="check-circle" size={16} color="#10B981" />
                    <Text style={[styles.actionButtonText, { color: '#10B981' }]}>Çözüldü</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Surface>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose} 
        style={StyleSheet.absoluteFill}
      >
        <BlurView
          intensity={20}
          tint="dark"
          style={[
            StyleSheet.absoluteFill,
            styles.modalOverlay,
          ]}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalContent, { 
              width: '95%', 
              maxHeight: '80%',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }]}
          >
            <View style={[styles.modalHeader, { 
              borderBottomColor: 'rgba(226, 232, 240, 0.6)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }]}>
              <Text style={styles.modalTitle}>Aktif Şikayetler</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#475569" />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.modalBody, { padding: 12 }]}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle-outline" size={48} color={Colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : complaints.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="check-circle" size={48} color={Colors.success} />
                  <Text style={styles.emptyText}>Aktif şikayet bulunmuyor</Text>
                </View>
              ) : (
                <FlatList
                  data={complaints}
                  renderItem={renderComplaintItem}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ padding: 4 }}
                  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                  style={{ maxHeight: 460 }}
                />
              )}
            </View>
          </TouchableOpacity>
        </BlurView>
      </TouchableOpacity>
    </Modal>
  );
};

// TenantsList Component
const TenantsList = ({ navigation, buildingId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchTenants = async () => {
      if (!buildingId) return;
      
      try {
        setLoading(true);
        const adminId = getCurrentAdminId();
        const url = API_ENDPOINTS.ADMIN.MANAGEMENT.GET_BUILDING_DATA(adminId, buildingId);
        console.log('=== TenantsList: API Request ===');
        console.log('API Endpoint:', url);
        
        const response = await axios.get(url);
        
        if (response.data && response.data.data && response.data.data.tenants) {
          // API'den gelen kiracı verilerini işle
          const tenantsData = response.data.data.tenants.map(tenant => ({
            id: tenant.id,
            fullName: tenant.fullName,
            apartmentNumber: tenant.apartmentNumber,
            phoneNumber: tenant.phoneNumber,
            email: tenant.email,
            contractFile: tenant.contractFile,
            profileImage: tenant.profileImage
          }));
          setTenants(tenantsData);
          setError(null);
        } else {
          throw new Error('Geçersiz veri formatı');
        }
      } catch (err) {
        console.error('Error fetching tenants:', err);
        setError('Kiracı verileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [buildingId]);

  const handleCall = async (phoneNumber) => {
    try {
      await Clipboard.setString(phoneNumber);
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      console.error('Error making phone call:', error);
    }
  };

  const handleEmail = async (email) => {
    try {
      const gmailUrl = `gmail://co?to=${email}`;
      const canOpenGmail = await Linking.canOpenURL(gmailUrl);
      
      if (canOpenGmail) {
        await Linking.openURL(gmailUrl);
      } else {
        // Eğer Gmail uygulaması yoksa varsayılan mail uygulamasını aç
        await Linking.openURL(`mailto:${email}`);
      }
    } catch (error) {
      console.error('Error opening email:', error);
    }
  };

  const handleContract = (contractFile) => {
    setSelectedContract(contractFile);
    setModalVisible(true);
  };

  const filteredTenants = tenants?.filter(tenant => {
    const matchesSearch = searchQuery === '' ||
      tenant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.apartmentNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const paginatedTenants = filteredTenants?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil((filteredTenants?.length || 0) / itemsPerPage);

  const renderTenantItem = ({ item }) => (
    <Surface style={[styles.tenantItemNew]}>
      <View style={styles.tenantItemContentNew}>
        {/* Tenant Header */}
        <View style={styles.tenantHeaderNew}>
          <View style={styles.tenantAvatarContainerNew}>
            {item.profileImage ? (
              <Avatar.Image 
                size={48} 
                source={{ uri: item.profileImage }}
                style={styles.tenantAvatarNew}
              />
            ) : (
              <Avatar.Text 
                size={48} 
                label={item.fullName?.split(' ').map(n => n[0]).join('')}
                style={styles.tenantAvatarNew}
                labelStyle={styles.tenantAvatarLabelNew}
              />
            )}
          </View>
          <View style={styles.tenantMainInfoNew}>
            <Text style={styles.tenantNameNew}>{item.fullName}</Text>
            <View style={styles.tenantBadgeContainerNew}>
              <View style={styles.tenantBadgeNew}>
                <Text style={styles.tenantBadgeTextNew}>Daire {item.apartmentNumber}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.tenantContactInfo}>
          <View style={styles.contactItem}>
            <Icon name="phone" size={20} color="#0369A1" />
            <Text style={styles.contactText}>{item.phoneNumber}</Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="email" size={20} color="#0369A1" />
            <Text style={styles.contactText}>{item.email}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.tenantActionsNew}>
          <TouchableOpacity
            style={[styles.actionButtonNew, { backgroundColor: '#E0F2FE' }]}
            onPress={() => handleCall(item.phoneNumber)}
          >
            <Icon name="phone" size={20} color="#0369A1" />
            <Text style={[styles.actionButtonTextNew, { color: '#0369A1' }]}>Ara</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButtonNew, { backgroundColor: '#E0F2FE' }]}
            onPress={() => handleEmail(item.email)}
          >
            <Icon name="email" size={20} color="#0369A1" />
            <Text style={[styles.actionButtonTextNew, { color: '#0369A1' }]}>E-posta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButtonNew, { backgroundColor: '#E0F2FE' }]}
            onPress={() => handleContract(item.contractFile)}
          >
            <Icon name="file-document" size={20} color="#0369A1" />
            <Text style={[styles.actionButtonTextNew, { color: '#0369A1' }]}>Sözleşme</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Surface>
  );

  return (
    <Card style={[styles.sectionCardNew]} elevation={2}>
      <ContractModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        contractFile={selectedContract}
      />
      
      <LinearGradient
        colors={Gradients.indigo}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
        }}
      >
        <Card.Title 
          title="Apartman Sakinleri" 
          titleStyle={[styles.sectionTitleNew, { color: '#FFFFFF' }]}
          subtitle={`Toplam: ${filteredTenants?.length || 0}`}
          subtitleStyle={[styles.sectionSubtitleNew, { color: 'rgba(255,255,255,0.8)' }]}
          left={(props) => (
            <View style={[styles.sectionIconContainerNew, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Icon {...props} name="account-group" size={24} color="#FFFFFF" />
            </View>
          )}
        />
        <Card.Content>
          <View style={[styles.searchBarContainerNew, {
            backgroundColor: '#F8FAFC',
            borderColor: '#E2E8F0'
          }]}>
            <Icon name="magnify" size={20} color="#3498DB" style={styles.searchIconNew} />
            <TextInput
              placeholder="Apartman sakini ara..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchInputNew}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchNew}>
                <Icon name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Liste */}
          <FlatList
            data={paginatedTenants}
            renderItem={renderTenantItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => (
              <View style={[styles.separatorNew, { backgroundColor: '#F1F5F9' }]} />
            )}
            contentContainerStyle={styles.listContainerNew}
            ListEmptyComponent={() => (
              <View style={styles.emptyListContainer}>
                <Icon name="account-search" size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyListText}>Apartman sakini bulunamadı</Text>
              </View>
            )}
          />

          {/* Sayfalama */}
          {totalPages > 1 && (
            <View style={styles.paginationContainerNew}>
              <TouchableOpacity 
                onPress={() => setPage(1)}
                disabled={page === 1}
                style={[
                  styles.pageButtonNew,
                  page === 1 && styles.pageButtonDisabledNew
                ]}
              >
                <Icon 
                  name="chevron-double-left" 
                  size={18} 
                  color={page === 1 ? '#94A3B8' : Colors.primary} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={[
                  styles.pageButtonNew,
                  page === 1 && styles.pageButtonDisabledNew
                ]}
              >
                <MaterialCommunityIcons 
                  name="chevron-left" 
                  size={18} 
                  color={page === 1 ? '#94A3B8' : Colors.primary} 
                />
              </TouchableOpacity>

              <View style={styles.paginationSeparator} />
              
              <Text style={styles.paginationInfoText}>
                Sayfa {page} / {totalPages}
              </Text>

              <View style={styles.paginationSeparator} />

              <TouchableOpacity 
                onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={[
                  styles.pageButtonNew,
                  page === totalPages && styles.pageButtonDisabledNew
                ]}
              >
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={18} 
                  color={page === totalPages ? '#94A3B8' : Colors.primary} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setPage(totalPages)}
                disabled={page === totalPages}
                style={[
                  styles.pageButtonNew,
                  page === totalPages && styles.pageButtonDisabledNew
                ]}
              >
                <Icon 
                  name="chevron-double-right" 
                  size={18} 
                  color={page === totalPages ? '#94A3B8' : Colors.primary} 
                />
              </TouchableOpacity>
            </View>
          )}
        </Card.Content>
      </LinearGradient>
    </Card>
  );
};

// Main ManagementScreen Component
const ManagementScreen = ({ navigation }) => {
  const [buildingData, setBuildingData] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAnimationPlayed, setHasAnimationPlayed] = useState(false);
  const [showComplaints, setShowComplaints] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const fetchBuildingData = async () => {
    try {
      const adminId = getCurrentAdminId();
      const url = `${API_ENDPOINTS.ADMIN.BASE}/management/${adminId}`;
      
      console.log('=== Management Screen API Request ===');
      console.log('Request URL:', url);
      console.log('Admin ID:', adminId);
      
      const response = await axios.get(url);
      
      console.log('=== Management Screen API Response ===');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        setBuildingData(response.data.data);
        // Eğer selectedBuilding yoksa ve binalar varsa ilk binayı seç
        if (!selectedBuilding && response.data.data.buildings.length > 0) {
          console.log('=== Setting Initial Building ===');
          console.log('First Building:', JSON.stringify(response.data.data.buildings[0], null, 2));
          setSelectedBuilding(response.data.data.buildings[0]);
        }
        setError(null);

        // Veri yüklendikten sonra animasyonu başlat (sadece bir kez)
        if (!hasAnimationPlayed) {
          setTimeout(() => {
            Animated.sequence([
              Animated.timing(scrollX, {
                toValue: -50,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(scrollX, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              })
            ]).start(() => {
              setHasAnimationPlayed(true);
            });
          }, 500);
        }
      } else {
        throw new Error(response.data.message || 'Veri alınamadı');
      }
    } catch (err) {
      console.error('=== Management Screen API Error ===');
      console.error('Error Type:', err.name);
      console.error('Error Message:', err.message);
      if (err.response) {
        console.error('Error Response:', JSON.stringify(err.response.data, null, 2));
        console.error('Error Status:', err.response.status);
      }
      setError('Bina verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('=== Management Screen Initial Load ===');
    console.log('Loading initial building data');
    fetchBuildingData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!buildingData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Bina verisi bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <BuildingSelector
        buildings={buildingData.buildings}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={(building) => {
          setSelectedBuilding(building);
        }}
      />
      
      <ComplaintsModal
        visible={showComplaints}
        onClose={() => setShowComplaints(false)}
        buildingId={selectedBuilding?.id}
      />

      <Animated.FlatList
        ref={flatListRef}
        horizontal
        data={[
          { key: 'apartments', component: <ApartmentsList navigation={navigation} buildingId={selectedBuilding?.id} /> },
          { key: 'tenants', component: <TenantsList navigation={navigation} buildingId={selectedBuilding?.id} /> }
        ]}
        renderItem={({ item }) => (
          <View style={[
            styles.horizontalCardWrapper,
            { marginLeft: item.key === 'apartments' ? 16 : 0 }
          ]}>
            {item.component}
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width - 32}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.horizontalListContainer}
        style={{ transform: [{ translateX: scrollX }] }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  horizontalCardWrapper: {
    width: width - 32,
    marginRight: 16,
  },
  horizontalListContainer: {
    paddingRight: width * 0.15,
    marginTop: 24, // Add top margin to move components down
  },
  buildingSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 16,
  },
  buildingCard: {
    width: width * 0.85,
    marginHorizontal: 4,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
  },
  selectedBuildingCard: {
    transform: [{ scale: 1.02 }],
  },
  buildingCardGradient: {
    padding: 20,
    height: 160,
  },
  buildingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buildingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  occupancyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  buildingCardName: {
    fontSize: 24,
    fontFamily: Fonts.urbanist.bold,
    marginBottom: 20,
  },
  buildingCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  buildingStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buildingStatText: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
  },
  buildingOverviewCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  buildingOverviewHeader: {
    padding: 20,
  },
  buildingOverviewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  buildingOverviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,

    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  buildingInfo: {
    flex: 1,
  },
  buildingName: {
    fontSize: 24,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  buildingDetails: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.regular,
    color: Colors.text,
    opacity: 0.9,
  },
  occupancyContainer: {
    alignItems: 'flex-end',
  },
  occupancyLabel: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.text,
    opacity: 0.9,
    marginBottom: 4,
  },
  occupancyRate: {
    fontSize: 28,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.text,
    marginBottom: 8,
  },
  progressBarContainer: {
    width: 100,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  maintenanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  maintenanceText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.text,
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  dataCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dataCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dataCardTitle: {
    fontFamily: Fonts.urbanist.bold,
    fontSize: 18,
    color: Colors.text,
    marginLeft: 12,
  },
  dataCardContent: {
    padding: 16,
  },
  quickStatCard: {
    width: '48%', // Takes up roughly half the width with margins
    marginHorizontal: '1%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickStatGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  quickStatIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickStatValue: {
    fontSize: 24,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  quickStatTitle: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.text,
    opacity: 0.9,
    textAlign: 'center',
  },
  loadingContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  errorContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.error,
    textAlign: 'center'
  },
  sectionCardNew: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitleNew: {
    fontFamily: Fonts.urbanist.bold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  sectionSubtitleNew: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionIconContainerNew: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterScrollView: {
    marginBottom: 16,
  },
  filterGroupNew: {
    marginRight: 8,
    marginBottom: 6,
    
  },
  filterGroupLabelNew: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
    marginBottom: 8,
    
  },
  filterButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFiltersContainer: {
    marginBottom: 16,
    
  },
  activeFiltersLabel: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
    marginBottom: 8,
  },
  activeFilterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  emptyListContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyListText: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  filterButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 8,
  },
  filterTextNew: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: '#64748B',
  },
  searchBarContainerNew: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchIconNew: {
    marginRight: 8,
  },
  searchInputNew: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
  },
  clearSearchNew: {
    padding: 8,
  },
  apartmentItemNew: {
    borderRadius: 12,
    backgroundColor: Colors.surface,
    marginHorizontal: 2,
    marginVertical: 4,
    overflow: 'hidden',
    height: 170,
  },
  apartmentItemContentNew: {
    padding: 12,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  apartmentHeaderNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
   
  },
  apartmentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  apartmentNumberNew: {
    fontSize: 15,
    fontFamily: Fonts.urbanist.bold,
    color: Colors.text,
  },
  statusBadgeNew: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  apartmentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  infoItem: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 80,
  },
  infoItemDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.surfaceVariant,
  
  },
  infoText: {
    fontSize: 13,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.text,
    marginLeft: 4,
  },
  apartmentActionButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
 
  },
  apartmentActionTextNew: {
    fontSize: 13,
    fontFamily: Fonts.urbanist.semiBold,
    color: Colors.primary,
    textAlign: 'center',
  },
  customBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  customBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.semiBold,
    textAlign: 'center',
  },
  floorInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    paddingHorizontal: 12,
    height: 40,
  },
  floorInput: {
    flex: 1,
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: Colors.text,
    padding: 0,
  },
  clearFloorInput: {
    padding: 4,
  },
  typeDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
  typeDropdownButtonText: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: Colors.text,
  },
  typeDropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    marginTop: 4,
    zIndex: 1000,
    elevation: 3,
    maxHeight: 200,
  },
  typeDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
  },
  typeDropdownItemText: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  typeDropdownItemTextSelected: {
    color: Colors.primary,
    fontFamily: Fonts.urbanist.bold,
  },
  headerFiltersContainer: {
    marginRight: 16,
    position: 'relative',
  },
  filterInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floorFilterInput: {
    width: 80,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    backgroundColor: Colors.surface,
    textAlign: 'center',
  },
  typeDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.surface,
    minWidth: 120,
    maxWidth: 150,
    justifyContent: 'space-between',
  },
  typeDropdownTriggerActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  typeDropdownContainer: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    width: 160,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 3,
  },
  typeDropdownItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  typeDropdownItemText: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.textSecondary,
  },
  typeDropdownItemTextSelected: {
    color: Colors.primary,
    fontFamily: Fonts.urbanist.bold,
  },
  paginationContainerNew: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pageButtonNew: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pageButtonDisabledNew: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  pageButtonActiveNew: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pageTextNew: {
    fontFamily: Fonts.urbanist.semiBold,
    fontSize: 14,
    color: '#64748B',
    paddingHorizontal: 8,
  },
  pageTextActiveNew: {
    color: '#FFFFFF',
  },
  paginationInfoText: {
    fontFamily: Fonts.urbanist.medium,
    fontSize: 14,
    color: '#64748B',
    marginHorizontal: 12,
  },
  paginationSeparator: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  tenantItemNew: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 2,
    marginVertical: 4,
    overflow: 'hidden',
    height: 200,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tenantItemContentNew: {
    padding: 16,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  tenantHeaderNew: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tenantAvatarContainerNew: {
    marginRight: 12,
  },
  tenantAvatarNew: {
    backgroundColor: '#E0F2FE',
  },
  tenantAvatarLabelNew: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
    color: '#0369A1',
  },
  tenantMainInfoNew: {
    flex: 1,
  },
  tenantNameNew: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
    color: '#1E293B',
    marginBottom: 4,
  },
  tenantBadgeContainerNew: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tenantBadgeNew: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tenantBadgeTextNew: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.semiBold,
    color: '#0369A1',
  },
  tenantContactInfo: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#475569',
    marginLeft: 8,
  },
  tenantActionsNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButtonNew: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonTextNew: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.semiBold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    margin: 'auto',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.urbanist.bold,
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  contractContainer: {
    alignItems: 'center',
  },
  contractIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  contractTitle: {
    fontSize: 20,
    fontFamily: Fonts.urbanist.bold,
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  contractSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.regular,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0369A1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.semiBold,
    color: '#FFFFFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: Fonts.urbanist.bold,
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.regular,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF5FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingListContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  errorListContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  errorListText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.error,
    textAlign: 'center'
  },
  complaintItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  complaintTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  complaintSubject: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
    color: '#334155',
  },
  complaintDate: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  complaintDescription: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.regular,
    color: '#475569',
    marginBottom: 12,
  },
  complaintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complaintUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  complaintUserName: {
    fontSize: 13,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.urbanist.medium,
    color: Colors.success,
    marginTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.semiBold,
  },
  complaintActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.semiBold,
  },
  complaintDate: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
    marginLeft: 8,
  },
  complaintMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontFamily: Fonts.urbanist.medium,
    color: '#64748B',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: Fonts.urbanist.semiBold,
  },
});

export default ManagementScreen;