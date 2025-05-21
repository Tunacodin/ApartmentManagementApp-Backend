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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api, API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import { Fonts, Colors } from '../../../constants';

const { width } = Dimensions.get('window');

const CreateNotificationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    buildingIds: [],
    userId: 0
  });
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
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
      Alert.alert('Hata', 'Binalar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
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
    if (formData.buildingIds.length === 0 || !formData.title || !formData.message) {
      Alert.alert('Uyarı', 'Lütfen en az bir bina seçin ve tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);
    try {
      const adminId = await getCurrentAdminId();
      const notificationData = {
        title: formData.title,
        message: formData.message,
        buildingIds: formData.buildingIds,
        createdByAdminId: adminId
      };

      const response = await api.post(API_ENDPOINTS.ADMIN.NOTIFICATIONS, notificationData);
      
      if (response.data.success) {
        Alert.alert('Başarılı', response.data.message || 'Bildirim başarıyla oluşturuldu.', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      Alert.alert('Hata', 'Bildirim oluşturulurken bir hata oluştu.');
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
            <Text style={styles.label}>Bildirim Başlığı</Text>
            <View style={styles.inputWrapper}>
              <Icon name="format-title" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Bildirim başlığını girin"
              placeholderTextColor="#94A3B8"
            />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bildirim İçeriği</Text>
            <View style={styles.inputWrapper}>
              <Icon name="text" size={20} color="#6366F1" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.message}
              onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
              placeholder="Bildirim içeriğini girin"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
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
                <View style={styles.submitButtonContent}>
                <Text style={styles.submitButtonText}>Bildirim Oluştur</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
});

export default CreateNotificationScreen;
