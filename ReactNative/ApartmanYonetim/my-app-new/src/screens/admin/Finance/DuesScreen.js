import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import axios from 'axios';

const DuesScreen = () => {
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDues = async () => {
    try {
      const response = await axios.get('api/Admin/dues');
      setDues(response.data.data);
    } catch (error) {
      console.error('Aidat bilgileri çekilemedi:', error);
      Alert.alert('Hata', 'Aidat bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDues();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDues();
  };

  const renderDueItem = ({ item }) => (
    <View style={styles.dueItem}>
      <View style={styles.dueHeader}>
        <Text style={styles.apartmentNumber}>Daire {item.apartmentNumber}</Text>
        <Text style={[styles.status, { color: item.isPaid ? '#28a745' : '#dc3545' }]}>
          {item.isPaid ? 'Ödendi' : 'Ödenmedi'}
        </Text>
      </View>
      <View style={styles.dueDetails}>
        <Text style={styles.dueLabel}>Sakin: {item.residentName}</Text>
        <Text style={styles.dueLabel}>Tutar: {item.amount}₺</Text>
        <Text style={styles.dueLabel}>Son Ödeme: {new Date(item.dueDate).toLocaleDateString()}</Text>
      </View>
      {!item.isPaid && (
        <TouchableOpacity 
          style={styles.paymentButton}
          onPress={() => Alert.alert('Ödeme', 'Ödeme işlemi başlatılacak')}
        >
          <Text style={styles.paymentButtonText}>Ödeme Al</Text>
        </TouchableOpacity>
      )}
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
        <Text style={styles.headerText}>Aidat Takibi</Text>
      </View>
      <FlatList
        data={dues}
        renderItem={renderDueItem}
        keyExtractor={(item) => item.id.toString()}
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
    padding: 10,
  },
  dueItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  apartmentNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
  },
  dueDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  dueLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  paymentButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DuesScreen;
