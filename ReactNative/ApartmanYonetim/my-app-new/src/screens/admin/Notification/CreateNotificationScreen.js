import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CreateNotificationScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateNotification = async () => {
    if (!title || !message) {
      Alert.alert('Uyarı', 'Lütfen başlık ve mesaj alanlarını doldurun.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.NOTIFICATION.BASE, {
        title,
        message,
        isUrgent,
      });

      if (response.data.success) {
        Alert.alert('Başarılı', 'Bildirim başarıyla gönderildi.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Bildirim gönderme hatası:', error);
      Alert.alert('Hata', 'Bildirim gönderilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Bildirim Başlığı</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Bildirim başlığını girin"
        />

        <Text style={styles.label}>Mesaj</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={message}
          onChangeText={setMessage}
          placeholder="Bildirim mesajını girin"
          multiline
          numberOfLines={4}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Acil Bildirim</Text>
          <Switch
            value={isUrgent}
            onValueChange={setIsUrgent}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isUrgent ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreateNotification}
          disabled={loading}
        >
          <MaterialCommunityIcons name="bell-plus" size={24} color="white" />
          <Text style={styles.buttonText}>
            {loading ? 'Gönderiliyor...' : 'Bildirimi Gönder'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CreateNotificationScreen; 