import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import axios from 'axios';

const CreateAnnouncementScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [buildingId, setBuildingId] = useState('1'); // Varsayılan bina ID'si
  const [loading, setLoading] = useState(false);

  const handleCreateAnnouncement = async () => {
    if (!title || !content) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('api/Admin/announcements', {
        buildingId: parseInt(buildingId),
        title,
        content,
        createdAt: new Date().toISOString()
      });

      if (response.data.success) {
        Alert.alert('Başarılı', 'Duyuru başarıyla oluşturuldu.');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Hata', 'Duyuru oluşturulurken bir hata oluştu.');
      console.error('Duyuru oluşturma hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Duyuru Oluştur</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Duyuru Başlığı</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Duyuru başlığını girin"
        />

        <Text style={styles.label}>Duyuru İçeriği</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={content}
          onChangeText={setContent}
          placeholder="Duyuru içeriğini girin"
          multiline
          numberOfLines={6}
        />

        <Text style={styles.label}>Bina ID</Text>
        <TextInput
          style={styles.input}
          value={buildingId}
          onChangeText={setBuildingId}
          placeholder="Bina ID'sini girin"
          keyboardType="numeric"
        />

        <TouchableOpacity 
          style={[
            styles.button,
            loading && styles.disabledButton
          ]}
          onPress={handleCreateAnnouncement}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Oluşturuluyor...' : 'Duyuru Oluştur'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
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
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateAnnouncementScreen;
