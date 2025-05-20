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

const ExpensesScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString()
  });

  const fetchExpenses = async () => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.ADMIN.EXPENSES.GET_ALL);
      setExpenses(response.data.data);
    } catch (error) {
      console.error('Giderler çekilemedi:', error);
      Alert.alert('Hata', 'Giderler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.category) {
      Alert.alert('Hata', 'Lütfen gerekli alanları doldurun.');
      return;
    }

    try {
      const response = await axios.post(API_ENDPOINTS.ADMIN.EXPENSES.CREATE, newExpense);
      if (response.data.success) {
        Alert.alert('Başarılı', 'Gider başarıyla eklendi.');
        setModalVisible(false);
        fetchExpenses();
        setNewExpense({
          title: '',
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString()
        });
      }
    } catch (error) {
      Alert.alert('Hata', 'Gider eklenirken bir hata oluştu.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const response = await axios.delete(API_ENDPOINTS.ADMIN.EXPENSES.DELETE(expenseId));
      if (response.data.success) {
        Alert.alert('Başarılı', 'Gider başarıyla silindi.');
        fetchExpenses();
      }
    } catch (error) {
      Alert.alert('Hata', 'Gider silinirken bir hata oluştu.');
    }
  };

  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseHeader}>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        <Text style={styles.expenseAmount}>-{item.amount}₺</Text>
      </View>
      <View style={styles.expenseDetails}>
        <Text style={styles.expenseCategory}>Kategori: {item.category}</Text>
        <Text style={styles.expenseDescription}>{item.description}</Text>
        <Text style={styles.expenseDate}>
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
        <Text style={styles.headerText}>Gider Takibi</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Gider Ekle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
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
            <Text style={styles.modalTitle}>Yeni Gider Ekle</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Gider Başlığı"
              value={newExpense.title}
              onChangeText={(text) => setNewExpense({...newExpense, title: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Kategori"
              value={newExpense.category}
              onChangeText={(text) => setNewExpense({...newExpense, category: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Tutar"
              value={newExpense.amount}
              onChangeText={(text) => setNewExpense({...newExpense, amount: text})}
              keyboardType="numeric"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Açıklama"
              value={newExpense.description}
              onChangeText={(text) => setNewExpense({...newExpense, description: text})}
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
                onPress={handleAddExpense}
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
    backgroundColor: '#dc3545',
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
  expenseItem: {
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
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  expenseDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 5,
  },
  expenseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  expenseDate: {
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

export default ExpensesScreen;
