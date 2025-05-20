import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import Ionicons from '@expo/vector-icons/Ionicons';

const ApartmentsScreen = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const fetchBuildings = async () => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.ADMIN.BUILDINGS(adminId));
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setBuildings(response.data.data);
      } else {
        Alert.alert('Hata', response.data.message || 'Bina bilgileri alınamadı');
      }
    } catch (error) {
      console.error('Bina bilgileri çekilemedi:', error);
      Alert.alert('Hata', 'Bina bilgileri yüklenirken bir hata oluştu.');
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

  const renderBuildingItem = ({ item }) => (
    <View style={styles.buildingCard}>
      <View style={styles.buildingHeader}>
        <Text style={styles.buildingName}>{item.buildingName}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Daire Sayısı</Text>
            <Text style={styles.statValue}>{item.totalApartments}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Doluluk Oranı</Text>
            <Text style={styles.statValue}>%{item.occupancyRate.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="home" size={20} color="#666" />
            <Text style={styles.detailText}>Dolu: {item.occupiedApartments}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="warning" size={20} color="#666" />
            <Text style={styles.detailText}>Şikayet: {item.activeComplaints}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="cash" size={20} color="#666" />
            <Text style={styles.detailText}>Aidat: {item.totalDuesAmount}₺</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="trending-up" size={20} color="#666" />
            <Text style={styles.detailText}>Tahsilat: %{item.collectionRate.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={20} color="#666" />
            <Text style={styles.detailText}>
              Bakım: {new Date(item.lastMaintenanceDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="alert-circle" size={20} color="#666" />
            <Text style={styles.detailText}>Bekleyen: {item.pendingPayments}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.manageButton}
        onPress={() => setSelectedBuilding(item)}
      >
        <Text style={styles.manageButtonText}>Daireyi Yönet</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Daire Yönetimi</Text>
      </View>

      <FlatList
        data={buildings}
        renderItem={renderBuildingItem}
        keyExtractor={(item) => item.buildingId.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  buildingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buildingHeader: {
    marginBottom: 15,
  },
  buildingName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  detailsContainer: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  manageButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ApartmentsScreen;
