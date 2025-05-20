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
  TextInput,
  ScrollView,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Şikayet durumları için enum
const ComplaintStatus = {
  Open: 0,
  InProgress: 1,
  Resolved: 2,
  Cancelled: 3
};

const ComplaintsScreen = () => {
  const navigation = useNavigation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [response, setResponse] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState(1);
  const [newComplaint, setNewComplaint] = useState({
    subject: '',
    description: '',
  });

  const fetchComplaints = async () => {
    try {
      console.log('Fetching complaints for building:', selectedBuildingId);
      setLoading(true);
      
      const result = await axios.get(API_ENDPOINTS.COMPLAINT.BY_BUILDING(selectedBuildingId));
      console.log('Raw API Response:', result);
      console.log('API Response Data:', result.data);
      
      // API yanıtını kontrol et ve işle
      if (result && result.data) {
        console.log('API Response Success:', result.data.success);
        console.log('API Response Data Type:', typeof result.data.data);
        console.log('API Response Data is Array:', Array.isArray(result.data.data));
        
        if (result.data.success && Array.isArray(result.data.data)) {
          console.log('Setting complaints with data:', result.data.data);
          setComplaints(result.data.data);
        } else {
          console.log('Setting empty complaints array due to invalid data');
          setComplaints([]);
        }
      } else {
        console.log('Setting empty complaints array due to missing data');
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      setComplaints([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('ComplaintsScreen mounted');
    fetchComplaints();
    return () => {
      console.log('ComplaintsScreen unmounted');
    };
  }, [selectedBuildingId]);

  const onRefresh = () => {
    console.log('Refreshing complaints');
    setRefreshing(true);
    fetchComplaints();
  };

  const handleRespond = async () => {
    if (!response.trim()) {
      Alert.alert('Hata', 'Lütfen bir yanıt girin.');
      return;
    }

    try {
      await axios.post(API_ENDPOINTS.COMPLAINT.ADD_COMMENT(selectedComplaint.id), {
        comment: response,
        adminId: getCurrentAdminId()
      });

      setModalVisible(false);
      setResponse('');
      setSelectedComplaint(null);
      fetchComplaints();
      Alert.alert('Başarılı', 'Yanıtınız kaydedildi.');
    } catch (error) {
      console.error('Yanıt gönderilirken hata:', error);
      Alert.alert('Hata', 'Yanıt gönderilirken bir hata oluştu.');
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await axios.put(API_ENDPOINTS.COMPLAINT.UPDATE(complaintId), {
        status: newStatus
      });
      fetchComplaints();
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      Alert.alert('Hata', 'Durum güncellenirken bir hata oluştu.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ComplaintStatus.Open:
        return '#FFA500'; // Turuncu
      case ComplaintStatus.InProgress:
        return '#4169E1'; // Mavi
      case ComplaintStatus.Resolved:
        return '#32CD32'; // Yeşil
      default:
        return '#808080'; // Gri
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case ComplaintStatus.Open:
        return 'Açık';
      case ComplaintStatus.InProgress:
        return 'İşlemde';
      case ComplaintStatus.Resolved:
        return 'Çözüldü';
      default:
        return 'Bilinmiyor';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tarih yok';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComplaintItem = ({ item, index }) => {
    console.log(`Rendering complaint item ${index}:`, item);
    return (
      <TouchableOpacity
        style={styles.complaintItem}
        onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item.id })}
      >
        <View style={styles.complaintHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.subject}>{item.subject || 'Konu belirtilmemiş'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>
          <Text style={styles.createdBy}>Oluşturan: {item.createdByName || 'Bilinmiyor'}</Text>
          <Text style={styles.date}>Tarih: {formatDate(item.createdAt)}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description || 'Açıklama yok'}
        </Text>

        <View style={styles.actionButtons}>
          {item.status === ComplaintStatus.Open && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
              onPress={() => {
                console.log('Selected complaint for response:', item);
                setSelectedComplaint(item);
                setModalVisible(true);
              }}
            >
              <Text style={styles.actionButtonText}>Yanıtla</Text>
            </TouchableOpacity>
          )}

          {item.status === ComplaintStatus.InProgress && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#34C759' }]}
              onPress={() => {
                console.log('Marking complaint as resolved:', item);
                handleStatusChange(item.id, ComplaintStatus.Resolved);
              }}
            >
              <Text style={styles.actionButtonText}>Çözüldü Olarak İşaretle</Text>
            </TouchableOpacity>
          )}

          {item.status === ComplaintStatus.Open && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#8E8E93' }]}
              onPress={() => {
                console.log('Cancelling complaint:', item);
                handleStatusChange(item.id, ComplaintStatus.Cancelled);
              }}
            >
              <Text style={styles.actionButtonText}>İptal Et</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    console.log('Showing loading indicator');
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  console.log('Current complaints state:', complaints);
  console.log('Rendering FlatList with data length:', complaints.length);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Şikayetler</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle" size={24} color="#4169E1" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={complaints}
        renderItem={renderComplaintItem}
        keyExtractor={(item) => {
          console.log('KeyExtractor item:', item);
          return item.id.toString();
        }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz şikayet bulunmamaktadır.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Şikayeti Yanıtla</Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder="Yanıtınızı yazın..."
              value={response}
              onChangeText={setResponse}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#FF3B30' }]}
                onPress={() => {
                  setModalVisible(false);
                  setResponse('');
                  setSelectedComplaint(null);
                }}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#34C759' }]}
                onPress={handleRespond}
              >
                <Text style={styles.modalButtonText}>Gönder</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  listContainer: {
    padding: 15,
  },
  complaintItem: {
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
  complaintHeader: {
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  subject: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  createdBy: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ComplaintsScreen;
