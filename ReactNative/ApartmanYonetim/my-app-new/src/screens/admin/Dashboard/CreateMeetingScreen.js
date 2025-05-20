import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api, API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import { Fonts, Colors } from '../../../constants';

const { width } = Dimensions.get('window');

const CreateMeetingScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    buildingId: route.params?.buildingId || '',
    title: '',
    description: '',
    meetingDate: new Date(),
    location: '',
    status: 'Scheduled'
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const adminId = await getCurrentAdminId();
      const response = await api.get(`${API_ENDPOINTS.ADMIN.BASE}/management/${adminId}`);
      
      if (response.data && response.data.success) {
        setBuildings(response.data.data.buildings || []);
        // Eğer route.params'dan buildingId geldiyse, o binayı seç
        if (route.params?.buildingId) {
          setFormData(prev => ({ ...prev, buildingId: route.params.buildingId }));
        }
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
      Alert.alert('Hata', 'Binalar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, meetingDate: selectedDate }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.buildingId || !formData.title || !formData.description || !formData.location) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);
    try {
      const adminId = await getCurrentAdminId();
      const meetingData = {
        ...formData,
        organizedById: adminId,
        organizedByName: 'Admin', // This should come from admin profile
        meetingDate: formData.meetingDate.toISOString()
      };

      const response = await api.post(API_ENDPOINTS.MEETING.CREATE, meetingData);
      
      if (response.data.success) {
        Alert.alert('Başarılı', 'Toplantı başarıyla oluşturuldu.', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      Alert.alert('Hata', 'Toplantı oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <BlurView intensity={90} tint="light" style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bina Seçin</Text>
            <View style={styles.selectContainer}>
              <FlatList
                data={buildings}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setFormData(prev => ({ ...prev, buildingId: item.id }))}
                    style={[
                      styles.buildingItem,
                      formData.buildingId === item.id && styles.selectedBuildingItem
                    ]}
                  >
                    <LinearGradient
                      colors={formData.buildingId === item.id 
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
                          color={formData.buildingId === item.id ? '#FFFFFF' : '#3B82F6'} 
                        />
                        <Text 
                          style={[
                            styles.buildingItemText,
                            { color: formData.buildingId === item.id ? '#FFFFFF' : '#1E293B' }
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                keyExtractor={item => `building-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.buildingsList}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Toplantı Başlığı</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Toplantı başlığını girin"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Toplantı açıklamasını girin"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Toplantı Tarihi</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {formData.meetingDate.toLocaleString('tr-TR')}
              </Text>
              <Ionicons name="calendar" size={20} color="#6366F1" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.meetingDate}
                mode="datetime"
                is24Hour={true}
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Toplantı Yeri</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              placeholder="Toplantı yerini girin"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Toplantı Oluştur</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: Fonts.lato.regular,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    color: '#1E293B',
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
});

export default CreateMeetingScreen;
