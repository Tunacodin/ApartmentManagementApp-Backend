import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Card, useTheme, ProgressBar, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Fonts, Colors, Gradients } from '../../../constants';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import { useNavigation, useRoute } from '@react-navigation/native';

const BuildingCard = ({ building, onPress }) => {
  const theme = useTheme();

  const formatCurrency = (value) => {
    return value.toLocaleString('tr-TR') + ' ₺';
  };

  return (
    <TouchableOpacity onPress={() => onPress(building)}>
      <Card style={[styles.buildingCard, { backgroundColor: '#1E293B' }]}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        />
        <Card.Content style={styles.cardContentContainer}>
          <View style={styles.cardLeftContent}>
            <View style={styles.buildingHeader}>
              <View style={styles.buildingTitleContainer}>
                <View style={[styles.buildingIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
                  <Icon name="office-building" size={24} color="#6366F1" />
                </View>
                <View style={styles.buildingTitleWrapper}>
                  <Text style={[styles.buildingName, { color: '#F1F5F9', fontFamily: Fonts.lato.bold }]}>
                    {building.buildingName}
                  </Text>
                  <Text style={[styles.buildingAddress, { color: '#94A3B8' }]}>
                    {building.address || 'Adres bilgisi yok'}
                  </Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: building.occupancyRate > 50 ? '#10B981' : '#F59E0B' }]}>
                <Text style={styles.statusText}>
                  {building.occupancyRate.toFixed(1)}% Doluluk
                </Text>
              </View>
            </View>

            <View style={styles.buildingStats}>
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
                  <Icon name="door" size={20} color="#6366F1" />
                </View>
                <Text style={[styles.statLabel, { color: '#94A3B8' }]}>Toplam Daire</Text>
                <Text style={[styles.statValue, { color: '#F1F5F9' }]}>{building.totalApartments}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  <Icon name="account-group" size={20} color="#10B981" />
                </View>
                <Text style={[styles.statLabel, { color: '#94A3B8' }]}>Dolu Daire</Text>
                <Text style={[styles.statValue, { color: '#F1F5F9' }]}>{building.occupiedApartments}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                  <Icon name="alert-circle" size={20} color="#F59E0B" />
                </View>
                <Text style={[styles.statLabel, { color: '#94A3B8' }]}>Aktif Şikayet</Text>
                <Text style={[styles.statValue, { color: '#F1F5F9' }]}>{building.activeComplaints}</Text>
              </View>
            </View>

            <View style={styles.financialInfo}>
              <View style={styles.financialItem}>
                <View style={[styles.financialIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
                  <Icon name="cash-multiple" size={20} color="#6366F1" />
                </View>
                <View style={styles.financialTextContainer}>
                  <Text style={[styles.financialLabel, { color: '#94A3B8' }]}>Toplam Aidat</Text>
                  <Text style={[styles.financialValue, { color: '#F1F5F9' }]}>
                    {formatCurrency(building.totalDuesAmount)}
                  </Text>
                </View>
              </View>
              <View style={styles.financialItem}>
                <View style={[styles.financialIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                  <Icon name="clock-alert" size={20} color="#F59E0B" />
                </View>
                <View style={styles.financialTextContainer}>
                  <Text style={[styles.financialLabel, { color: '#94A3B8' }]}>Bekleyen Tutar</Text>
                  <Text style={[styles.financialValue, { color: '#F1F5F9' }]}>
                    {formatCurrency(building.pendingAmount)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <View style={styles.progressLabelContainer}>
                  <Icon name="chart-line" size={16} color="#94A3B8" />
                  <Text style={[styles.progressLabel, { color: '#94A3B8' }]}>Tahsilat Oranı</Text>
                </View>
                <Text style={[styles.progressValue, { color: '#F1F5F9' }]}>
                  {building.collectionRate.toFixed(1)}%
                </Text>
              </View>
              <ProgressBar
                progress={building.collectionRate / 100}
                color={building.collectionRate > 50 ? '#10B981' : '#F59E0B'}
                style={styles.progressBar}
              />
            </View>
          </View>
          
          <View style={styles.buildingImageContainer}>
            <Image 
              source={require('../../../assets/build.png')} 
              style={styles.buildingImage}
              resizeMode="contain"
            />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const BuildingsListScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleBuildingPress = (building) => {
    const { redirectTo } = route.params || {};
    
    if (redirectTo === 'BuildingTenants') {
      navigation.navigate('BuildingTenants', {
        buildingId: building.buildingId,
        buildingName: building.buildingName
      });
    } else {
      // Default navigation or other cases can be handled here
      navigation.navigate('BuildingTenants', {
        buildingId: building.buildingId,
        buildingName: building.buildingName
      });
    }
  };

  const fetchBuildings = async () => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.ADMIN.BUILDINGS(adminId));
      
      if (response.data.success) {
        setBuildings(response.data.data);
      } else {
        throw new Error(response.data.message || 'Binalar alınırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Binalar alınırken hata:', error);
      Alert.alert('Hata', 'Binalar alınırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBuildings();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: '#0F172A' }]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={[styles.loadingText, { color: '#F1F5F9' }]}>Binalar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#0F172A' }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: '#F1F5F9' }]}>Binalarınız</Text>
      </View>
      <FlatList
        data={buildings}
        renderItem={({ item }) => <BuildingCard building={item} onPress={handleBuildingPress} />}
        keyExtractor={(item) => item.buildingId.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#6366F1']}
            tintColor="#6366F1"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="office-building-off" size={48} color="#94A3B8" />
            <Text style={[styles.emptyText, { color: '#94A3B8' }]}>
              Henüz bina bulunmuyor
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'left',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.lato.bold,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  buildingCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cardLeftContent: {
    flex: 1,
    marginRight: 16,
  },
  buildingImageContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingImage: {
    width: '100%',
    height: '100%',
  },
  gradientBorder: {
    height: 4,
    width: '100%',
  },
  buildingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  buildingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buildingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buildingTitleWrapper: {
    flex: 1,
  },
  buildingName: {
    fontSize: 18,
    marginBottom: 4,
  },
  buildingAddress: {
    fontSize: 12,
    fontFamily: Fonts.lato.regular,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontFamily: Fonts.lato.bold,
    fontSize: 12,
  },
  buildingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: Fonts.lato.regular,
  },
  statValue: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
  },
  financialInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  financialItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  financialIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  financialTextContainer: {
    flex: 1,
  },
  financialLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: Fonts.lato.regular,
  },
  financialValue: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    marginLeft: 4,
    fontFamily: Fonts.lato.regular,
  },
  progressValue: {
    fontSize: 12,
    fontFamily: Fonts.lato.bold,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  divider: {
    height: 16,
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

export default BuildingsListScreen; 