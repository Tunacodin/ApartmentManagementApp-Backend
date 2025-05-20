import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { api, API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import { Fonts, Colors } from '../../../constants';

const CreateNotificationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    userId: 0 // 0 means send to all users
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.message) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);
    try {
      const adminId = await getCurrentAdminId();
      const notificationData = {
        ...formData,
        createdByAdminId: adminId
      };

      const response = await api.post(API_ENDPOINTS.ADMIN.NOTIFICATIONS, notificationData);
      
      if (response.data.success) {
        Alert.alert('Başarılı', 'Bildirim başarıyla oluşturuldu.', [
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <BlurView intensity={90} tint="light" style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bildirim Başlığı</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Bildirim başlığını girin"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bildirim İçeriği</Text>
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

          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={20} color="#6366F1" />
            <Text style={styles.infoText}>
              Bu bildirim tüm kullanıcılara gönderilecektir.
            </Text>
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
                <Text style={styles.submitButtonText}>Bildirim Oluştur</Text>
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
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: Fonts.lato.regular,
  },
  textArea: {
    height: 180,
    textAlignVertical: 'top',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Fonts.lato.regular,
    color: '#6366F1',
    flex: 1,
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

export default CreateNotificationScreen;
