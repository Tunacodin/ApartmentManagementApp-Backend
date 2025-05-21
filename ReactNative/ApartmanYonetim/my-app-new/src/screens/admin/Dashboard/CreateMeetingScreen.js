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
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api, API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import { Fonts, Colors } from '../../../constants';

const { width } = Dimensions.get('window');

const CreateMeetingScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    buildingIds: route.params?.buildingId ? [route.params.buildingId] : [], // Çoklu bina seçimi için array
    title: '',
    description: '',
    meetingDate: new Date(),
    location: '',
    status: 'Scheduled'
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);

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
        if (route.params?.buildingId) {
          setFormData(prev => ({ ...prev, buildingIds: [route.params.buildingId] }));
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
    if (Platform.OS === 'android') {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    } else {
    setShowDatePicker(false);
    if (selectedDate) {
        const now = new Date();
        if (selectedDate < now) {
          Alert.alert('Uyarı', 'Geçmiş bir tarih seçemezsiniz.');
          return;
        }
      setFormData(prev => ({ ...prev, meetingDate: selectedDate }));
    }
    }
  };

  const handleConfirmDate = () => {
    const now = new Date();
    if (tempDate < now) {
      Alert.alert('Uyarı', 'Geçmiş bir tarih seçemezsiniz.');
      return;
    }
    setFormData(prev => ({ ...prev, meetingDate: tempDate }));
    setShowDatePicker(false);
    setTempDate(new Date()); // Reset temp date
  };

  const handleCancelDate = () => {
    setTempDate(formData.meetingDate);
    setShowDatePicker(false);
  };

  const formatDateTime = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const toggleBuildingSelection = (buildingId) => {
    setFormData(prev => {
      const currentBuildingIds = [...prev.buildingIds];
      const index = currentBuildingIds.indexOf(buildingId);
      
      if (index === -1) {
        currentBuildingIds.push(buildingId);
      } else {
        currentBuildingIds.splice(index, 1);
      }
      
      return { ...prev, buildingIds: currentBuildingIds };
    });
  };

  const handleSubmit = async () => {
    if (formData.buildingIds.length === 0 || !formData.title || !formData.description || !formData.location) {
      Alert.alert('Uyarı', 'Lütfen en az bir bina seçin ve tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);
    try {
      const adminId = await getCurrentAdminId();
      const meetingData = {
        id: 0,
        buildingId: formData.buildingIds[0],
        title: formData.title,
        description: formData.description,
        meetingDate: formData.meetingDate.toISOString(),
        createdAt: new Date().toISOString(),
        organizedById: adminId,
        organizedByName: "Admin",
        location: formData.location,
        status: "Scheduled",
        isCancelled: false,
        cancellationReason: ""
      };

      const response = await api.post(API_ENDPOINTS.MEETING.CREATE, meetingData);
      
      if (response.data.success) {
        Alert.alert('Başarılı', response.data.message || 'Toplantı başarıyla oluşturuldu.', [
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

  const cancelMeeting = async (meetingId, reason) => {
    try {
      const response = await api.post(API_ENDPOINTS.MEETING.CANCEL(meetingId), {
        reason: reason
      });
      
      if (response.data.success) {
        Alert.alert('Başarılı', response.data.message || 'Toplantı başarıyla iptal edildi.', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      Alert.alert('Hata', 'Toplantı iptal edilirken bir hata oluştu.');
    }
  };

  const handleCancelPress = (meetingId) => {
    setSelectedMeetingId(meetingId);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = () => {
    if (!cancelReason.trim()) {
      Alert.alert('Uyarı', 'Lütfen iptal nedenini belirtin.');
      return;
    }
    cancelMeeting(selectedMeetingId, cancelReason);
    setShowCancelModal(false);
    setCancelReason('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Binalar</Text>
            <View style={styles.selectContainer}>
              <FlatList
                data={buildings}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => toggleBuildingSelection(item.id)}
                    style={[
                      styles.buildingItem,
                      formData.buildingIds.includes(item.id) && styles.selectedBuildingItem
                    ]}
                  >
                    <LinearGradient
                      colors={formData.buildingIds.includes(item.id) 
                        ? ['#6366F1', '#8B5CF6']
                        : ['#F1F5F9', '#E2E8F0']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buildingGradient}
                    >
                      <View style={styles.buildingItemContent}>
                        <Icon 
                          name="office-building" 
                          size={24} 
                          color={formData.buildingIds.includes(item.id) ? '#FFFFFF' : '#6366F1'} 
                        />
                        <Text 
                          style={[
                            styles.buildingItemText,
                            { color: formData.buildingIds.includes(item.id) ? '#FFFFFF' : '#1E293B' }
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
            <View style={styles.inputWrapper}>
              <Icon name="format-title" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Toplantı başlığını girin"
              placeholderTextColor="#94A3B8"
            />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Açıklama</Text>
            <View style={styles.inputWrapper}>
              <Icon name="text" size={20} color="#6366F1" style={styles.inputIcon} />
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
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Toplantı Tarihi</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                setTempDate(formData.meetingDate);
                setShowDatePicker(true);
              }}
            >
              <View style={styles.dateButtonContent}>
                <Icon name="calendar-clock" size={24} color="#6366F1" />
              <Text style={styles.dateButtonText}>
                  {formatDateTime(formData.meetingDate)}
              </Text>
              </View>
              <Icon name="chevron-right" size={24} color="#6366F1" />
            </TouchableOpacity>
            {showDatePicker && (
              <View style={styles.datePickerContainer}>
              <DateTimePicker
                  value={tempDate}
                mode="datetime"
                is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                  textColor="#FFFFFF"
                  themeVariant="dark"
                  style={styles.datePicker}
                  minimumDate={new Date()}
                  locale="tr-TR"
                />
                {Platform.OS === 'android' && (
                  <View style={styles.androidButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.androidButton, styles.cancelButton]}
                      onPress={handleCancelDate}
                    >
                      <Text style={styles.androidButtonText}>İptal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.androidButton, styles.confirmButton]}
                      onPress={handleConfirmDate}
                    >
                      <Text style={styles.androidButtonText}>Onayla</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Toplantı Yeri</Text>
            <View style={styles.inputWrapper}>
              <Icon name="map-marker" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              placeholder="Toplantı yerini girin"
              placeholderTextColor="#94A3B8"
            />
            </View>
          </View>

          <View style={styles.buttonContainer}>
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
                  <View style={styles.submitButtonContent}>
                <Text style={styles.submitButtonText}>Toplantı Oluştur</Text>
                  </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

            {route.params?.meetingId && (
              <TouchableOpacity
                style={[styles.cancelButton]}
                onPress={() => handleCancelPress(route.params.meetingId)}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cancelButtonGradient}
                >
                  <View style={styles.submitButtonContent}>
                    <Icon name="calendar-remove" size={24} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Toplantıyı İptal Et</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Toplantı İptali</Text>
            <Text style={styles.modalSubtitle}>İptal nedenini belirtiniz:</Text>
            
            <TextInput
              style={styles.modalInput}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="İptal nedenini giriniz"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
              >
                <Text style={styles.modalButtonText}>Vazgeç</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleCancelConfirm}
              >
                <Text style={styles.modalButtonText}>İptal Et</Text>
              </TouchableOpacity>
            </View>
          </View>
    </View>
      </Modal>
    </KeyboardAvoidingView>
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
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  formContainer: {
    borderRadius: 20,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#000000',
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
    fontFamily: Fonts.lato.bold,
    textAlign: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    color: '#000000',
  },
  datePickerContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  datePicker: {
    height: 200,
    width: '100%',
  },
  androidButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  androidButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmButton: {
    backgroundColor: '#6366F1',
  },
  androidButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
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
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 20,
  },
  cancelButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.lato.bold,
    color: '#1E293B',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: Fonts.lato.regular,
    color: '#64748B',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: Fonts.lato.regular,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#E2E8F0',
  },
  modalConfirmButton: {
    backgroundColor: '#EF4444',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: Fonts.lato.bold,
    color: '#FFFFFF',
  },
});

export default CreateMeetingScreen;
