import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, axiosConfig, handleApiError } from '../../../config/apiConfig';
import colors from '../../../styles/colors';
import axios from 'axios';

const AdminSettings = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('Türkçe');
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    const getUserData = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        setUserId(id);
        if (id) {
          fetchProfile(id);
        }
      } catch (error) {
        console.error('Error getting user ID:', error);
        Alert.alert('Hata', 'Kullanıcı bilgileri alınamadı');
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const fetchProfile = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.USER_PROFILE.DETAIL(id), axiosConfig);
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      const apiError = handleApiError(error);
      Alert.alert('Hata', apiError.message || 'Profil bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      await axios.put(API_ENDPOINTS.USER_PROFILE.UPDATE(userId), formData, axiosConfig);
      setProfile(formData);
      setIsEditing(false);
      Alert.alert('Başarılı', 'Profil bilgileri güncellendi');
    } catch (error) {
      const apiError = handleApiError(error);
      Alert.alert('Hata', apiError.message || 'Profil güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    // Şifre değiştirme işlemi için API çağrısı
    Alert.alert(
      'Şifre Değiştir',
      'Şifrenizi değiştirmek için e-posta adresinize bir bağlantı göndereceğiz.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Gönder', 
          onPress: () => Alert.alert('Bilgi', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.') 
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      "Çıkış Yap",
      "Oturumu kapatmak istediğinize emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Çıkış Yap",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'userId',
                'userEmail',
                'userRole'
              ]);

              navigation.reset({
                index: 0,
                routes: [
                  { 
                    name: 'LoginScreen',
                    params: { role: 'admin' }
                  }
                ],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const renderProfileSection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: profile.profileImage || 'https://via.placeholder.com/150' }} 
            style={styles.profileImage} 
          />
          <TouchableOpacity style={styles.editImageButton}>
            <MaterialIcons name="edit" size={20} color={colors.palette.background.paper} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileInfo}>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.displayName}
              onChangeText={(text) => setFormData({ ...formData, displayName: text })}
              placeholder="İsim Soyisim"
            />
          ) : (
            <Text style={styles.name}>{profile.displayName || 'İsim Soyisim'}</Text>
          )}
          <Text style={styles.role}>Yönetici</Text>
          <Text style={styles.email}>{profile.email || 'email@example.com'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {isEditing ? (
        <View style={styles.formContainer}>
          <Text style={styles.formLabel}>Telefon</Text>
          <TextInput
            style={styles.formInput}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Telefon Numarası"
            keyboardType="phone-pad"
          />
          
          <Text style={styles.formLabel}>Adres</Text>
          <TextInput
            style={[styles.formInput, styles.textArea]}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Adres"
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => {
                setFormData(profile);
                setIsEditing(false);
              }}
            >
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={updateProfile}
            >
              <Text style={styles.buttonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.profileDetails}>
          <View style={styles.detailItem}>
            <MaterialIcons name="phone" size={20} color={colors.palette.primary.main} />
            <Text style={styles.detailText}>{profile.phone || 'Telefon numarası eklenmemiş'}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <MaterialIcons name="location-on" size={20} color={colors.palette.primary.main} />
            <Text style={styles.detailText}>{profile.address || 'Adres eklenmemiş'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editProfileButton} 
            onPress={() => setIsEditing(true)}
          >
            <MaterialIcons name="edit" size={20} color={colors.white} />
            <Text style={styles.editProfileText}>Profili Düzenle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderSecuritySection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Güvenlik Ayarları</Text>
      
      <TouchableOpacity style={styles.settingItem} onPress={updatePassword}>
        <View style={styles.settingIconContainer}>
          <MaterialIcons name="lock" size={24} color={colors.palette.primary.main} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Şifre Değiştir</Text>
          <Text style={styles.settingDescription}>Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={colors.palette.grey[400]} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingIconContainer}>
          <MaterialIcons name="security" size={24} color={colors.palette.primary.main} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>İki Faktörlü Doğrulama</Text>
          <Text style={styles.settingDescription}>Hesabınıza ekstra güvenlik katmanı ekleyin</Text>
        </View>
        <Switch
          trackColor={{ false: colors.palette.grey[300], true: colors.palette.primary.light }}
          thumbColor={colors.palette.background.paper}
          value={false}
        />
      </TouchableOpacity>
    </View>
  );

  const renderNotificationSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Bildirim Ayarları</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingIconContainer}>
          <MaterialIcons name="notifications" size={24} color={colors.palette.primary.main} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Bildirimler</Text>
          <Text style={styles.settingDescription}>Uygulama bildirimlerini aç/kapat</Text>
        </View>
        <Switch
          trackColor={{ false: colors.palette.grey[300], true: colors.palette.primary.light }}
          thumbColor={colors.palette.background.paper}
          value={notifications}
          onValueChange={setNotifications}
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingIconContainer}>
          <MaterialIcons name="email" size={24} color={colors.palette.primary.main} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>E-posta Bildirimleri</Text>
          <Text style={styles.settingDescription}>Önemli güncellemeler için e-posta al</Text>
        </View>
        <Switch
          trackColor={{ false: colors.palette.grey[300], true: colors.palette.primary.light }}
          thumbColor={colors.palette.background.paper}
          value={true}
        />
      </View>
    </View>
  );

  const renderAppearanceSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Görünüm Ayarları</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingIconContainer}>
          <MaterialIcons name="brightness-6" size={24} color={colors.palette.primary.main} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Karanlık Mod</Text>
          <Text style={styles.settingDescription}>Uygulama temasını değiştir</Text>
        </View>
        <Switch
          trackColor={{ false: colors.palette.grey[300], true: colors.palette.primary.light }}
          thumbColor={colors.palette.background.paper}
          value={darkMode}
          onValueChange={setDarkMode}
        />
      </View>
      
      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingIconContainer}>
          <MaterialIcons name="language" size={24} color={colors.palette.primary.main} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Dil</Text>
          <Text style={styles.settingDescription}>Uygulama dilini değiştir</Text>
        </View>
        <View style={styles.languageSelector}>
          <Text style={styles.languageText}>{language}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.palette.grey[400]} />
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.palette.primary.main} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil ve Ayarlar</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeSection === 'profile' && styles.activeTab]} 
          onPress={() => setActiveSection('profile')}
        >
          <MaterialIcons 
            name="person" 
            size={24} 
            color={activeSection === 'profile' ? colors.palette.primary.main : colors.palette.grey[400]} 
          />
          <Text style={[styles.tabText, activeSection === 'profile' && styles.activeTabText]}>Profil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeSection === 'security' && styles.activeTab]} 
          onPress={() => setActiveSection('security')}
        >
          <MaterialIcons 
            name="security" 
            size={24} 
            color={activeSection === 'security' ? colors.palette.primary.main : colors.palette.grey[400]} 
          />
          <Text style={[styles.tabText, activeSection === 'security' && styles.activeTabText]}>Güvenlik</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeSection === 'notifications' && styles.activeTab]} 
          onPress={() => setActiveSection('notifications')}
        >
          <MaterialIcons 
            name="notifications" 
            size={24} 
            color={activeSection === 'notifications' ? colors.palette.primary.main : colors.palette.grey[400]} 
          />
          <Text style={[styles.tabText, activeSection === 'notifications' && styles.activeTabText]}>Bildirimler</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeSection === 'appearance' && styles.activeTab]} 
          onPress={() => setActiveSection('appearance')}
        >
          <MaterialIcons 
            name="palette" 
            size={24} 
            color={activeSection === 'appearance' ? colors.palette.primary.main : colors.palette.grey[400]} 
          />
          <Text style={[styles.tabText, activeSection === 'appearance' && styles.activeTabText]}>Görünüm</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {activeSection === 'profile' && renderProfileSection()}
        {activeSection === 'security' && renderSecuritySection()}
        {activeSection === 'notifications' && renderNotificationSection()}
        {activeSection === 'appearance' && renderAppearanceSection()}
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color={colors.white} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.palette.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.palette.background.default,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.palette.text.secondary,
  },
  header: {
    backgroundColor: colors.palette.primary.main,
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.palette.background.paper,
    marginHorizontal: 15,
    marginTop: -20,
    borderRadius: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.palette.primary.main,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: colors.palette.grey[400],
  },
  activeTabText: {
    color: colors.palette.primary.main,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    marginTop: 15,
  },
  sectionContainer: {
    backgroundColor: colors.palette.background.paper,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.palette.text.primary,
    marginBottom: 15,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.palette.primary.light,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.palette.primary.main,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.palette.background.paper,
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.palette.text.primary,
  },
  role: {
    fontSize: 14,
    color: colors.palette.primary.main,
    fontWeight: '500',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.palette.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.palette.grey[200],
    marginVertical: 15,
  },
  profileDetails: {
    marginTop: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    color: colors.palette.text.secondary,
    marginLeft: 10,
    flex: 1,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.palette.primary.main,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  editProfileText: {
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  formContainer: {
    marginTop: 10,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.palette.text.primary,
    marginBottom: 5,
  },
  formInput: {
    backgroundColor: colors.palette.grey[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.palette.text.primary,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.palette.grey[300],
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: colors.palette.success.main,
    marginLeft: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.palette.grey[200],
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.palette.grey[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.palette.text.primary,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.palette.text.secondary,
    marginTop: 2,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 16,
    color: colors.palette.text.primary,
    marginRight: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.palette.error.main,
    padding: 15,
    margin: 20,
    borderRadius: 10,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default AdminSettings;