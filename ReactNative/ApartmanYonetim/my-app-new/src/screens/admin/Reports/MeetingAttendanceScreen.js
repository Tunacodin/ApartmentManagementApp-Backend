import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';

const MeetingAttendanceScreen = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get('api/Admin/meetings');
      setMeetings(response.data.data);
    } catch (error) {
      console.error('Toplantı bilgileri çekilemedi:', error);
      Alert.alert('Hata', 'Toplantı bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMeetingAttendance = async () => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.ADMIN.MEETINGS.GET_ATTENDANCE);
      setAttendanceData(response.data.data);
    } catch (error) {
      console.error('Toplantı katılım bilgileri çekilemedi:', error);
      Alert.alert('Hata', 'Toplantı katılım bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExportAttendance = async (meetingId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN.MEETINGS.EXPORT_ATTENDANCE(meetingId), {
        responseType: 'blob'
      });
      // Handle export logic
    } catch (error) {
      Alert.alert('Hata', 'Katılım bilgileri dışa aktarılırken bir hata oluştu.');
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMeetings();
  };

  const calculateAttendanceRate = (attendance) => {
    if (!attendance || attendance.length === 0) return 0;
    const attended = attendance.filter(a => a.attended).length;
    return ((attended / attendance.length) * 100).toFixed(1);
  };

  const renderAttendanceList = (attendance) => {
    if (!attendance) return null;

    return (
      <View style={styles.attendanceList}>
        <View style={styles.attendanceHeader}>
          <Text style={styles.attendanceHeaderText}>Katılımcı</Text>
          <Text style={styles.attendanceHeaderText}>Durum</Text>
        </View>
        {attendance.map((item, index) => (
          <View key={index} style={styles.attendanceItem}>
            <Text style={styles.attendeeName}>{item.residentName}</Text>
            <Text style={[
              styles.attendanceStatus,
              { color: item.attended ? '#28a745' : '#dc3545' }
            ]}>
              {item.attended ? 'Katıldı' : 'Katılmadı'}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderMeetingItem = ({ item }) => (
    <View style={styles.meetingItem}>
      <View style={styles.meetingHeader}>
        <Text style={styles.meetingTitle}>{item.title}</Text>
        <Text style={styles.meetingDate}>
          {new Date(item.meetingDate).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.meetingDetails}>
        <Text style={styles.detailText}>Konum: {item.location}</Text>
        {item.attendance && (
          <Text style={styles.detailText}>
            Katılım Oranı: %{calculateAttendanceRate(item.attendance)}
          </Text>
        )}
      </View>

      <TouchableOpacity 
        style={styles.viewButton}
        onPress={() => {
          if (selectedMeeting === item.id) {
            setSelectedMeeting(null);
          } else {
            fetchMeetingAttendance();
          }
        }}
      >
        <Text style={styles.viewButtonText}>
          {selectedMeeting === item.id ? 'Katılım Listesini Gizle' : 'Katılım Listesini Göster'}
        </Text>
      </TouchableOpacity>

      {selectedMeeting === item.id && renderAttendanceList(item.attendance)}
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
        <Text style={styles.headerText}>Toplantı Katılım Raporları</Text>
      </View>

      <FlatList
        data={meetings}
        renderItem={renderMeetingItem}
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
  meetingItem: {
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
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  meetingDate: {
    fontSize: 14,
    color: '#666',
  },
  meetingDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  viewButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  attendanceList: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  attendanceHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  attendeeName: {
    fontSize: 14,
    color: '#333',
  },
  attendanceStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MeetingAttendanceScreen;
