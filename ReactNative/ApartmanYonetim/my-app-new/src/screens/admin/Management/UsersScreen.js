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
  Image
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/apiConfig';

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    profileImageUrl: '',
    description: ''
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN.GET_ALL);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Kullanıcı bilgileri çekilemedi:', error);
      Alert.alert('Hata', 'Kullanıcı bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleAddUser = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.password) {
      Alert.alert('Hata', 'Lütfen gerekli alanları doldurun.');
      return;
    }

    try {
      const response = await axios.post(API_ENDPOINTS.ADMIN.CREATE, newUser);
      if (response.data.success) {
        Alert.alert('Başarılı', 'Yönetici başarıyla eklendi.');
        setModalVisible(false);
        fetchUsers();
        setNewUser({
          fullName: '',
          email: '',
          phoneNumber: '',
          password: '',
          profileImageUrl: '',
          description: ''
        });
      }
    } catch (error) {
      Alert.alert('Hata', 'Yönetici eklenirken bir hata oluştu.');
    }
  };

  const handleDeleteUser = async (userId) => {
    Alert.alert(
      'Onay',
      'Bu yöneticiyi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(API_ENDPOINTS.ADMIN.DELETE(userId));
              if (response.data.success) {
                Alert.alert('Başarılı', 'Yönetici başarıyla silindi.');
                fetchUsers();
              }
            } catch (error) {
              Alert.alert('Hata', 'Yönetici silinirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const renderUserItem = ({ item }) => {
    if (!item) return null;

    const getInitials = (name) => {
      if (!name) return '??';
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    };

    return (
      <View style={styles.userItem}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            {item.profileImage ? (
              <Image
                source={{ uri: item.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.initialsContainer}>
                <Text style={styles.initialsText}>
                  {getInitials(item.fullName)}
                </Text>
              </View>
            )}
            <View style={styles.textContainer}>
              <Text style={styles.userName}>{item.fullName || 'İsimsiz Kullanıcı'}</Text>
              <Text style={styles.userEmail}>{item.email || 'E-posta yok'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteUser(item.id)}
          >
            <Text style={styles.deleteButtonText}>Sil</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.detailText}>Telefon: {item.phoneNumber || 'Belirtilmemiş'}</Text>
          {item.description && (
            <Text style={styles.detailText}>Açıklama: {item.description}</Text>
          )}
        </View>
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
        <Text style={styles.headerText}>Yöneticiler</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Yönetici Ekle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
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
            <Text style={styles.modalTitle}>Yeni Yönetici Ekle</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Ad Soyad"
              value={newUser.fullName}
              onChangeText={(text) => setNewUser({...newUser, fullName: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="E-posta"
              value={newUser.email}
              onChangeText={(text) => setNewUser({...newUser, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Telefon"
              value={newUser.phoneNumber}
              onChangeText={(text) => setNewUser({...newUser, phoneNumber: text})}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Şifre"
              value={newUser.password}
              onChangeText={(text) => setNewUser({...newUser, password: text})}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Profil Resmi URL"
              value={newUser.profileImageUrl}
              onChangeText={(text) => setNewUser({...newUser, profileImageUrl: text})}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Açıklama"
              value={newUser.description}
              onChangeText={(text) => setNewUser({...newUser, description: text})}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddUser}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
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
    padding: 10,
  },
  userItem: {
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
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  placeholderImage: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
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
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
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
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default UsersScreen;
