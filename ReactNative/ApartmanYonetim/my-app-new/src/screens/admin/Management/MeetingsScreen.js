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

const MeetingsScreen = () => {
  const [meetings, setMeetings] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [meetingStats, setMeetingStats] = useState({
    total: 0,
    completed: 0,
    upcomingMeetings: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    location: '',
    meetingDate: new Date(),
    buildingId: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState('1'); // Varsayılan bina ID'si

  const fetchMeetingData = async () => {
    try {
      const [meetingsResponse, upcomingResponse, statsResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.ADMIN.MEETINGS.BY_BUILDING(selectedBuildingId)),
        axios.get(API_ENDPOINTS.ADMIN.MEETINGS.UPCOMING(selectedBuildingId)),
        axios.get(API_ENDPOINTS.ADMIN.REPORTS.MEETINGS(getCurrentAdminId()))
      ]);
      
      if (meetingsResponse.data.success) {
        setMeetings(meetingsResponse.data.data);
      }
      
      if (upcomingResponse.data.success) {
        setUpcomingMeetings(upcomingResponse.data.data);
      }
      
      if (statsResponse.data.success) {
        setMeetingStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error('Toplantı bilgileri çekilemedi:', error);
      console.error('Hata detayı:', error.response?.data || error.message);
      Alert.alert('Hata', 'Toplantı bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMeetingData();
  }, [selectedBuildingId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMeetingData();
  };

  const handleAddMeeting = async () => {
    if (!newMeeting.title || !newMeeting.description || !newMeeting.location || !newMeeting.buildingId) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      const response = await axios.post(API_ENDPOINTS.ADMIN.MEETINGS.CREATE, {
        ...newMeeting,
        buildingId: parseInt(newMeeting.buildingId),
        meetingDate: newMeeting.meetingDate.toISOString()
      });

      if (response.data.success) {
        Alert.alert('Başarılı', 'Toplantı başarıyla oluşturuldu.');
        setModalVisible(false);
        setNewMeeting({
          title: '',
          description: '',
          location: '',
          meetingDate: new Date(),
          buildingId: '',
        });
        fetchMeetingData();
      }
    } catch (error) {
      console.error('Toplantı oluşturma hatası:', error);
      Alert.alert('Hata', 'Toplantı oluşturulurken bir hata oluştu.');
    }
  };

  const handleCancelMeeting = async (meetingId) => {
    try {
      const response = await axios.post(API_ENDPOINTS.ADMIN.MEETINGS.CANCEL(meetingId));
      if (response.data.success) {
        Alert.alert('Başarılı', 'Toplantı başarıyla iptal edildi.');
        fetchMeetingData();
      }
    } catch (error) {
      console.error('Toplantı iptal hatası:', error);
      Alert.alert('Hata', 'Toplantı iptal edilirken bir hata oluştu.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewMeeting({ ...newMeeting, meetingDate: selectedDate });
    }
  };

  const getMeetingStatusColor = (status, isCancelled) => {
    if (isCancelled) return '#dc3545';
    
    switch (status) {
      case 'Completed':
        return '#28a745';
      case 'Planned':
        return '#007bff';
      case 'InProgress':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getMeetingStatusText = (status, isCancelled) => {
    if (isCancelled) return 'İptal Edildi';
    
    switch (status) {
      case 'Completed':
        return 'Tamamlandı';
      case 'Planned':
        return 'Planlandı';
      case 'InProgress':
        return 'Devam Ediyor';
      default:
        return 'Belirsiz';
    }
  };

  const renderMeetingItem = ({ item }) => (
    <View style={styles.meetingCard}>
      <View style={styles.meetingHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.meetingTitle}>{item.title}</Text>
          <Text style={[
            styles.statusBadge,
            { backgroundColor: getMeetingStatusColor(item.status, item.isCancelled) }
          ]}>
            {getMeetingStatusText(item.status, item.isCancelled)}
          </Text>
        </View>
        <Text style={styles.buildingName}>{item.buildingName}</Text>
      </View>

      <View style={styles.meetingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={20} color="#666" />
          <Text style={styles.detailText}>
            {new Date(item.meetingDate).toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location" size={20} color="#666" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="person" size={20} color="#666" />
          <Text style={styles.detailText}>
            Düzenleyen: {item.organizedByName}
          </Text>
        </View>

        {item.attendanceRate > 0 && (
          <View style={styles.detailRow}>
            <Ionicons name="people" size={20} color="#666" />
            <Text style={styles.detailText}>
              Katılım Oranı: %{item.attendanceRate.toFixed(1)}
            </Text>
          </View>
        )}

        <Text style={styles.description}>{item.description}</Text>

        {item.isCancelled && item.cancellationReason && (
          <View style={styles.cancellationInfo}>
            <Text style={styles.cancellationText}>
              İptal Nedeni: {item.cancellationReason}
            </Text>
          </View>
        )}
      </View>

      {!item.isCancelled && item.status === 'Planned' && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => handleCancelMeeting(item.id)}
        >
          <Text style={styles.cancelButtonText}>Toplantıyı İptal Et</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStatistics = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{meetingStats.total}</Text>
        <Text style={styles.statLabel}>Toplam Toplantı</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{meetingStats.completed}</Text>
        <Text style={styles.statLabel}>Tamamlanan</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{meetingStats.upcomingMeetings}</Text>
        <Text style={styles.statLabel}>Yaklaşan</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>%{meetingStats.attendanceRate}</Text>
        <Text style={styles.statLabel}>Katılım Oranı</Text>
      </View>
    </View>
  );

  const renderUpcomingMeetings = () => {
    if (upcomingMeetings.length === 0) return null;

    return (
      <View style={styles.upcomingContainer}>
        <Text style={styles.sectionTitle}>Yaklaşan Toplantılar</Text>
        {upcomingMeetings.map((meeting) => (
          <View key={meeting.id} style={styles.upcomingCard}>
            <View style={styles.upcomingHeader}>
              <Text style={styles.upcomingTitle}>{meeting.title}</Text>
              <Text style={styles.upcomingDate}>
                {new Date(meeting.meetingDate).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.upcomingLocation}>
              <Ionicons name="location" size={16} color="#666" /> {meeting.location}
            </Text>
          </View>
        ))}
      </View>
    );
  };

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
        <Text style={styles.headerText}>Toplantılar</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Toplantı Ekle</Text>
        </TouchableOpacity>
      </View>

      {renderStatistics()}
      {renderUpcomingMeetings()}

      <FlatList
        data={meetings}
        renderItem={renderMeetingItem}
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
            <Text style={styles.modalTitle}>Yeni Toplantı Ekle</Text>

            <Text style={styles.label}>Bina ID</Text>
            <TextInput
              style={styles.input}
              value={newMeeting.buildingId}
              onChangeText={(text) => setNewMeeting({...newMeeting, buildingId: text})}
              placeholder="Bina ID'sini girin"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Başlık</Text>
            <TextInput
              style={styles.input}
              value={newMeeting.title}
              onChangeText={(text) => setNewMeeting({...newMeeting, title: text})}
              placeholder="Toplantı başlığını girin"
            />

            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newMeeting.description}
              onChangeText={(text) => setNewMeeting({...newMeeting, description: text})}
              placeholder="Toplantı açıklamasını girin"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Konum</Text>
            <TextInput
              style={styles.input}
              value={newMeeting.location}
              onChangeText={(text) => setNewMeeting({...newMeeting, location: text})}
              placeholder="Toplantı konumunu girin"
            />

            <Text style={styles.label}>Tarih ve Saat</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{newMeeting.meetingDate.toLocaleString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={newMeeting.meetingDate}
                mode="datetime"
                is24Hour={true}
                display="default"
                onChange={handleDateChange}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddMeeting}
              >
                <Text style={styles.buttonText}>Kaydet</Text>
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
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    padding: 15,
  },
  meetingCard: {
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
  meetingHeader: {
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  buildingName: {
    fontSize: 14,
    color: '#666',
  },
  meetingDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },
  cancellationInfo: {
    backgroundColor: '#fff3f3',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  cancellationText: {
    color: '#dc3545',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
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
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  upcomingContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  upcomingCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  upcomingDate: {
    fontSize: 14,
    color: '#666',
  },
  upcomingLocation: {
    fontSize: 14,
    color: '#666',
  },
});

export default MeetingsScreen;
