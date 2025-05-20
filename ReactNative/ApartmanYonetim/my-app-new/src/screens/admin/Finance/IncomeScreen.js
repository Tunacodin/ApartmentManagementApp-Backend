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

const IncomeScreen = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newIncome, setNewIncome] = useState({
    title: '',
    amount: '',
    description: '',
    date: new Date().toISOString()
  });

  const fetchIncomes = async () => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.ADMIN.INCOMES.GET_ALL);
      setIncomes(response.data.data);
    } catch (error) {
      console.error('Gelirler çekilemedi:', error);
      Alert.alert('Hata', 'Gelirler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchIncomes();
  };

  const handleAddIncome = async () => {
    if (!newIncome.title || !newIncome.amount) {
      Alert.alert('Hata', 'Lütfen gerekli alanları doldurun.');
      return;
    }

    try {
      const response = await axios.post(API_ENDPOINTS.ADMIN.INCOMES.CREATE, newIncome);
      if (response.data.success) {
        Alert.alert('Başarılı', 'Gelir başarıyla eklendi.');
        setModalVisible(false);
        fetchIncomes();
        setNewIncome({
          title: '',
          amount: '',
          description: '',
          date: new Date().toISOString()
        });
      }
    } catch (error) {
      Alert.alert('Hata', 'Gelir eklenirken bir hata oluştu.');
    }
  };

  const handleDeleteIncome = async (incomeId) => {
    try {
      const response = await axios.delete(API_ENDPOINTS.ADMIN.INCOMES.DELETE(incomeId));
      if (response.data.success) {
        Alert.alert('Başarılı', 'Gelir başarıyla silindi.');
        fetchIncomes();
      }
    } catch (error) {
      Alert.alert('Hata', 'Gelir silinirken bir hata oluştu.');
    }
  };

  const renderIncomeItem = ({ item }) => (
    <View style={styles.incomeItem}>
      <View style={styles.incomeHeader}>
        <Text style={styles.incomeTitle}>{item.title}</Text>
        <Text style={styles.incomeAmount}>{item.amount}₺</Text>
      </View>
      <View style={styles.incomeDetails}>
        <Text style={styles.incomeLabel}>{item.description}</Text>
        <Text style={styles.incomeDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
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
        <Text style={styles.headerText}>Gelir Takibi</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Gelir Ekle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={incomes}
        renderItem={renderIncomeItem}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Gelir Ekle</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Gelir Başlığı"
              value={newIncome.title}
              onChangeText={(text) => setNewIncome({...newIncome, title: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Tutar"
              value={newIncome.amount}
              onChangeText={(text) => setNewIncome({...newIncome, amount: text})}
              keyboardType="numeric"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Açıklama"
              value={newIncome.description}
              onChangeText={(text) => setNewIncome({...newIncome, description: text})}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddIncome}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  listContainer: {
    padding: 10,
  },
  incomeItem: {
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
  incomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  incomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  incomeDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  incomeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  incomeDate: {
    fontSize: 12,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  cancelButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default IncomeScreen;
