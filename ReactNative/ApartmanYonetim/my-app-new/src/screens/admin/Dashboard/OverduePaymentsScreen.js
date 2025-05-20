import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, Dimensions, Alert, Image } from 'react-native';
import { Text, Card, useTheme, ActivityIndicator, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../../constants/Colors';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';

const { width } = Dimensions.get('window');

const OverduePaymentsScreen = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [overduePayments, setOverduePayments] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1
  });

  useEffect(() => {
    fetchBuildings();
    fetchOverduePayments();
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      fetchOverduePayments(selectedBuilding.id);
    }
  }, [selectedBuilding]);

  const fetchBuildings = async () => {
    try {
      const adminId = await getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.ADMIN.BUILDINGS(adminId));
      if (response.data.success) {
        const buildingsData = response.data.data.map(building => ({
          id: building.buildingId,
          name: building.buildingName
        }));
        setBuildings(buildingsData);
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
      Alert.alert('Hata', 'Binalar alınırken bir hata oluştu.');
    }
  };

  const fetchOverduePayments = async (buildingId = null) => {
    try {
      setLoading(true);
      const params = {
        pageNumber: pagination?.currentPage || 1,
        pageSize: pagination?.pageSize || 10
      };

      const response = await axios.get(API_ENDPOINTS.FINANCE.PAYMENTS.OVERDUE(buildingId), { params });
      
      if (response.data.success) {
        setOverduePayments(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching overdue payments:', error);
      Alert.alert('Hata', 'Gecikmiş ödemeler alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const BuildingItem = ({ building }) => (
    <TouchableOpacity
      onPress={() => setSelectedBuilding(building)}
      style={[
        styles.buildingItem,
        selectedBuilding?.id === building.id && styles.selectedBuildingItem
      ]}
    >
      <LinearGradient
        colors={selectedBuilding?.id === building.id 
          ? ['#3B82F6', '#2563EB']
          : ['#E0F2FE', '#DBEAFE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.buildingGradient}
      >
        <View style={styles.buildingItemContent}>
          <Icon 
            name="office-building" 
            size={24} 
            color={selectedBuilding?.id === building.id ? '#FFFFFF' : '#3B82F6'} 
          />
          <Text 
            style={[
              styles.buildingItemText,
              { color: selectedBuilding?.id === building.id ? '#FFFFFF' : '#1E293B' }
            ]}
            numberOfLines={1}
          >
            {building.name}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const PaymentCard = ({ payment }) => (
    <Card style={styles.paymentCard}>
      <LinearGradient
        colors={['#EFF6FF', '#DBEAFE', '#BFDBFE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.apartmentInfo}>
                {payment.buildingName} - Daire {payment.apartmentNumber}
              </Text>
              <Text style={styles.date}>
                {new Date(payment.dueDate).toLocaleDateString('tr-TR')}
              </Text>
            </View>
            <View style={styles.delayBadge}>
              <Text style={styles.delayText}>{payment.delayedDays} gün gecikme</Text>
            </View>
          </View>

          <View style={styles.paymentDetails}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Orijinal Tutar:</Text>
              <Text style={styles.amountValue}>{payment.originalAmount.toLocaleString('tr-TR')} ₺</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Ceza Tutarı:</Text>
              <Text style={styles.penaltyAmount}>{payment.penaltyAmount.toLocaleString('tr-TR')} ₺</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Toplam Tutar:</Text>
              <Text style={styles.totalAmount}>{payment.totalAmount.toLocaleString('tr-TR')} ₺</Text>
            </View>
          </View>
        </Card.Content>
      </LinearGradient>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Gecikmiş Ödemeler</Text>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Gecikmiş ödemeler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={overduePayments}
          renderItem={({ item }) => <PaymentCard payment={item} />}
          keyExtractor={(item) => `payment-${item.paymentId}`}
          contentContainerStyle={styles.paymentsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="cash-remove" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>
                Gecikmiş ödeme bulunamadı
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    textAlign: 'center',
  },
  paymentsList: {
    padding: 16,
    gap: 16,
  },
  paymentCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  apartmentInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  date: {
    fontSize: 14,
    color: '#64748B',
  },
  delayBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
  },
  delayText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  paymentDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  penaltyAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7E22CE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
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
    color: '#64748B',
    textAlign: 'center',
  },
});

export default OverduePaymentsScreen; 