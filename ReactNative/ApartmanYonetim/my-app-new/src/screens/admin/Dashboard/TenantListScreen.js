import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, FlatList, Dimensions, Image } from 'react-native';
import { Text, Card, useTheme, Divider, ActivityIndicator } from 'react-native-paper';
import { Fonts, Colors } from '../../../constants';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TenantListScreen = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const currentAdminId = await getCurrentAdminId();
        setAdminId(currentAdminId);
        
        const buildingsResponse = await axios.get(API_ENDPOINTS.ADMIN.BUILDINGS(currentAdminId));
        if (buildingsResponse.data.success) {
          const buildingsData = buildingsResponse.data.data.map(building => ({
            id: building.buildingId,
            name: building.buildingName
          }));
          setBuildings(buildingsData);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu.');
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (adminId) {
      fetchTenants();
    }
  }, [adminId, selectedBuilding]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const url = selectedBuilding 
        ? API_ENDPOINTS.TENANT.BY_BUILDING(selectedBuilding)
        : API_ENDPOINTS.TENANT.GET_ALL;
      
      const response = await axios.get(url);
      if (response.data.success) {
        console.log('Tenants data:', response.data.data);
        setTenants(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      Alert.alert('Hata', 'Kiracı bilgileri alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuildingPress = (buildingId) => {
    if (selectedBuilding === buildingId) {
      setSelectedBuilding(null);
    } else {
      setSelectedBuilding(buildingId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 ₺';
    return amount.toLocaleString('tr-TR') + ' ₺';
  };

  const BuildingItem = ({ building }) => (
    <TouchableOpacity
      onPress={() => handleBuildingPress(building.id)}
      style={[
        styles.buildingItem,
        selectedBuilding === building.id && styles.selectedBuildingItem
      ]}
    >
      <LinearGradient
        colors={selectedBuilding === building.id 
          ? ['#3B82F6', '#2563EB']
          : ['#EFF6FF', '#DBEAFE', '#BFDBFE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.buildingGradient}
      >
        <View style={styles.buildingItemContent}>
          <Icon 
            name="office-building" 
            size={24} 
            color={selectedBuilding === building.id ? '#FFFFFF' : '#3B82F6'} 
          />
          <Text 
            style={[
              styles.buildingItemText,
              { color: selectedBuilding === building.id ? '#FFFFFF' : '#1E293B' }
            ]}
            numberOfLines={1}
          >
            {building.name}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const TenantCard = ({ tenant }) => (
    <TouchableOpacity onPress={() => navigation.navigate('TenantDetail', { tenantId: tenant.id })}>
      <Card style={[styles.tenantCard]}>
        <LinearGradient
          colors={['#EFF6FF', '#DBEAFE', '#BFDBFE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.tenantCardContent}>
              {/* Sol taraf - Profil Resmi */}
              <View style={styles.profileImageContainer}>
                <Image
                  source={{ uri: tenant.profileImageUrl || 'https://via.placeholder.com/100' }}
                  style={styles.profileImage}
                />
                <View style={[styles.statusBadge, { backgroundColor: tenant.isActive ? '#10B981' : '#EF4444' }]}>
                  <Text style={styles.statusText}>
                    {tenant.isActive ? 'Aktif' : 'Pasif'}
                  </Text>
                </View>
              </View>

              {/* Sağ taraf - Kiracı Bilgileri */}
              <View style={styles.tenantInfoContainer}>
                <Text style={[styles.tenantName, { color: '#1E293B' }]}>
                  {tenant.fullName || '-'}
                </Text>
                
                <View style={styles.infoRow}>
                  <Icon name="office-building" size={16} color="#64748B" />
                  <Text style={[styles.infoText, { color: '#475569' }]}>
                    {tenant.buildingName || '-'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="door" size={16} color="#64748B" />
                  <Text style={[styles.infoText, { color: '#475569' }]}>
                    Daire {tenant.unitNumber || '-'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="email" size={16} color="#64748B" />
                  <Text style={[styles.infoText, { color: '#475569' }]}>
                    {tenant.email || '-'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="phone" size={16} color="#64748B" />
                  <Text style={[styles.infoText, { color: '#475569' }]}>
                    {tenant.phoneNumber || '-'}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </LinearGradient>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Kiracı Listesi</Text>
      </View>

      <View style={styles.buildingsContainer}>
        <FlatList
          data={buildings}
          renderItem={({ item }) => <BuildingItem building={item} />}
          keyExtractor={item => `building-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.buildingsList}
        />
      </View>

      {loading ? (
        <View style={[styles.loadingContainer, { backgroundColor: Colors.background }]}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={[styles.loadingText, { color: '#1E293B' }]}>Kiracılar yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={tenants}
          renderItem={({ item }) => <TenantCard tenant={item} />}
          keyExtractor={(item, index) => `tenant-${item.id || index}-${index}`}
          contentContainerStyle={styles.tenantList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="account-off" size={48} color="#94A3B8" />
              <Text style={[styles.emptyText, { color: '#64748B' }]}>
                Kiracı bulunamadı
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.lato.bold,
  },
  buildingsContainer: {
    marginVertical: 8,
  },
  buildingsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  buildingItem: {
    width: width * 0.4,
    height: 80,
    marginRight: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedBuildingItem: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  buildingGradient: {
    flex: 1,
    padding: 12,
  },
  buildingItemContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buildingItemText: {
    fontSize: 14,
    fontFamily: Fonts.lato.bold,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
  },
  tenantList: {
    padding: 16,
  },
  tenantCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  tenantCardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.lato.bold,
  },
  tenantInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  tenantName: {
    fontSize: 18,
    fontFamily: Fonts.lato.bold,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    textAlign: 'center',
  },
});

export default TenantListScreen;