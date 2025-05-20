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
  ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import Ionicons from '@expo/vector-icons/Ionicons';

const SurveysScreen = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState(1);
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    buildingId: '1',
    questions: []
  });

  const fetchSurveys = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SURVEY.BY_BUILDING(selectedBuildingId));
      console.log('Surveys data:', response.data);
      setSurveys(response.data.data || []);
    } catch (error) {
      console.error('Anketler yüklenirken hata:', error);
      Alert.alert('Hata', 'Anketler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, [selectedBuildingId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSurveys();
  };

  const handleCreateSurvey = async () => {
    if (!newSurvey.title || !newSurvey.description) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    try {
      const response = await axios.post(API_ENDPOINTS.SURVEY.CREATE, {
        ...newSurvey,
        buildingId: parseInt(newSurvey.buildingId)
      });

      if (response.data.success) {
        Alert.alert('Başarılı', 'Anket başarıyla oluşturuldu.');
        setModalVisible(false);
        setNewSurvey({
          title: '',
          description: '',
          startDate: new Date(),
          endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
          buildingId: '1',
          questions: []
        });
        fetchSurveys();
      }
    } catch (error) {
      console.error('Anket oluşturma hatası:', error);
      Alert.alert('Hata', 'Anket oluşturulurken bir hata oluştu.');
    }
  };

  const handleCloseSurvey = async (surveyId) => {
    try {
      await axios.post(API_ENDPOINTS.SURVEY.CLOSE(surveyId));
      Alert.alert('Başarılı', 'Anket kapatıldı.');
      fetchSurveys();
    } catch (error) {
      console.error('Anket kapatma hatası:', error);
      Alert.alert('Hata', 'Anket kapatılırken bir hata oluştu.');
    }
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setNewSurvey({ ...newSurvey, startDate: selectedDate });
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setNewSurvey({ ...newSurvey, endDate: selectedDate });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateParticipationRate = (totalResponses) => {
    // Assuming each survey has a target of 100 responses
    const rate = Math.min(100, Math.round((totalResponses / 100) * 100));
    return rate;
  };

  const getStatusColor = (isActive, endDate) => {
    if (!isActive) return '#8E8E93'; // Gri - Sona ermiş
    const now = new Date();
    const end = new Date(endDate);
    return now <= end ? '#34C759' : '#FF3B30'; // Yeşil - Aktif, Kırmızı - Süresi dolmuş
  };

  const getStatusText = (isActive, endDate) => {
    if (!isActive) return 'Sona Erdi';
    const now = new Date();
    const end = new Date(endDate);
    return now <= end ? 'Aktif' : 'Süresi Doldu';
  };

  const renderSurveyItem = ({ item }) => (
    <View style={styles.surveyCard}>
      <View style={styles.surveyHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.surveyTitle}>{item.title}</Text>
          <Text style={[
            styles.status,
            { color: getStatusColor(item.isActive, item.endDate) }
          ]}>
            {getStatusText(item.isActive, item.endDate)}
          </Text>
        </View>
        <Text style={styles.buildingName}>{item.buildingName}</Text>
        <Text style={styles.createdBy}>Oluşturan: {item.createdByAdminName}</Text>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          {' '}Başlangıç: {formatDate(item.startDate)}
        </Text>
        <Text style={styles.dateText}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          {' '}Bitiş: {formatDate(item.endDate)}
        </Text>
      </View>

      <View style={styles.participationContainer}>
        <Text style={styles.participationText}>
          Katılım Oranı: %{calculateParticipationRate(item.totalResponses)}
        </Text>
        <Text style={styles.responsesText}>
          Toplam Yanıt: {item.totalResponses}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
          onPress={() => navigation.navigate('SurveyResults', { surveyId: item.id })}
        >
          <Text style={styles.actionButtonText}>Sonuçları Gör</Text>
        </TouchableOpacity>

        {item.isActive && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
            onPress={() => handleCloseSurvey(item.id)}
          >
            <Text style={styles.actionButtonText}>Anketi Sonlandır</Text>
          </TouchableOpacity>
        )}
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
        <Text style={styles.headerText}>Anketler</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Anket Ekle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={surveys}
        renderItem={renderSurveyItem}
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
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Anket Oluştur</Text>

            <Text style={styles.label}>Anket Başlığı</Text>
            <TextInput
              style={styles.input}
              value={newSurvey.title}
              onChangeText={(text) => setNewSurvey({...newSurvey, title: text})}
              placeholder="Anket başlığını girin"
            />

            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newSurvey.description}
              onChangeText={(text) => setNewSurvey({...newSurvey, description: text})}
              placeholder="Anket açıklamasını girin"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Başlangıç Tarihi</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text>{newSurvey.startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showStartDatePicker && (
              <DateTimePicker
                value={newSurvey.startDate}
                mode="date"
                display="default"
                onChange={onStartDateChange}
                minimumDate={new Date()}
              />
            )}

            <Text style={styles.label}>Bitiş Tarihi</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text>{newSurvey.endDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showEndDatePicker && (
              <DateTimePicker
                value={newSurvey.endDate}
                mode="date"
                display="default"
                onChange={onEndDateChange}
                minimumDate={newSurvey.startDate}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewSurvey({
                    title: '',
                    description: '',
                    startDate: new Date(),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                    buildingId: '1',
                    questions: []
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCreateSurvey}
              >
                <Text style={styles.saveButtonText}>Oluştur</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    padding: 15,
  },
  surveyCard: {
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
  surveyHeader: {
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  surveyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  buildingName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  createdBy: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
    lineHeight: 22,
  },
  dateContainer: {
    marginVertical: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  participationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  participationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  responsesText: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
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
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SurveysScreen;
