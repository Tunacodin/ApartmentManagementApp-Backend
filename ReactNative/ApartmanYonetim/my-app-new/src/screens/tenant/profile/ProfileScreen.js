import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api, API_ENDPOINTS } from '../../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Surface, 
  Text, 
  TextInput, 
  Button, 
  Chip, 
  Avatar, 
  Card, 
  Paragraph,
  IconButton,
  useTheme,
  SegmentedButtons,
  Divider
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form states
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');

  const scrollViewRef = React.useRef(null);

  const fetchProfileData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('Kullanıcı ID bulunamadı');
      }

      const response = await api.get(API_ENDPOINTS.TENANT.GET_DETAILS(userId));
      
      if (response.data.success) {
        const profileData = response.data.data;
        setProfileData(profileData);
        setEmail(profileData.email || '');
        setPhoneNumber(profileData.phoneNumber || '');
        setDescription(profileData.description || '');
      }
    } catch (error) {
      console.error('Profil bilgileri alınamadı:', error);
      Alert.alert('Hata', 'Profil bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('Kullanıcı ID bulunamadı');
      }

      const response = await api.put(
        API_ENDPOINTS.USER_PROFILE.UPDATE_DESCRIPTION(userId),
        { description }
      );

      if (response.data.success) {
        Alert.alert('Başarılı', 'Profil bilgileri güncellendi');
        setIsEditingDescription(false);
        fetchProfileData();
      }
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu');
    }
  };

  const handleUpdateContact = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('Kullanıcı ID bulunamadı');
      }

      const response = await api.put(
        API_ENDPOINTS.USER_PROFILE.UPDATE(userId),
        { email, phoneNumber }
      );

      if (response.data.success) {
        Alert.alert('Başarılı', 'İletişim bilgileri güncellendi');
        setIsEditingContact(false);
        fetchProfileData();
      }
    } catch (error) {
      Alert.alert('Hata', 'İletişim bilgileri güncellenirken bir hata oluştu');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          throw new Error('Kullanıcı ID bulunamadı');
        }

        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile-image.jpg',
        });

        const response = await api.put(
          API_ENDPOINTS.USER_PROFILE.UPDATE_IMAGE(userId),
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data.success) {
          setProfileData(prevData => ({
            ...prevData,
            profileImageUrl: response.data.data.imageUrl
          }));
        }
      }
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      Alert.alert('Hata', 'Profil fotoğrafı güncellenirken bir hata oluştu');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'userId',
                'userEmail',
                'userRole',
                'adminId'
              ]);
              
              navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
              });
            } catch (error) {
              console.error('Çıkış yapma hatası:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar style="light" />
      
      {/* Header with blurred background and profile image */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileImageOuterContainer}>
            <TouchableOpacity style={styles.profileImageWrapper} onPress={pickImage}>
              {profileData?.profileImageUrl ? (
                <Avatar.Image
                  size={100}
                  source={{ uri: profileData.profileImageUrl }}
                  style={styles.profileImage}
                />
              ) : (
                <Avatar.Text
                  size={100}
                  label={getInitials(profileData?.fullName)}
                  style={styles.profileImage}
                  labelStyle={styles.initialsText}
                />
              )}
              <View style={styles.editImageButtonContainer}>
                <IconButton
                  icon="camera"
                  size={18}
                  iconColor="#fff"
                  style={styles.editImageButton}
                  onPress={pickImage}
                />
              </View>
            </TouchableOpacity>
          </View>
          
          <Text variant="headlineSmall" style={styles.name}>{profileData?.fullName}</Text>
          
          <Chip 
            icon="home"
            style={styles.roleBadge}
            textStyle={styles.roleBadgeText}
          >
            {profileData?.apartmentNumber} - {profileData?.buildingName}
          </Chip>
          
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, profileData?.isActive ? styles.statusActive : styles.statusInactive]} />
            <Text style={styles.statusText}>{profileData?.isActive ? 'Aktif' : 'Pasif'}</Text>
          </View>
        </View>
      </LinearGradient>
      
      {/* Tab navigation */}
      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          { value: 'profile', label: 'Profil', icon: 'account' },
          { value: 'contact', label: 'İletişim', icon: 'phone' },
        ]}
        style={styles.segmentedButtons}
      />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          enabled
        >
          {activeTab === 'profile' ? (
            /* Profile Tab */
            <Card style={styles.mainCard}>
              <Card.Content style={styles.cardContent}>
                {/* Profile Description */}
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="text-box-outline" size={22} color="#6366F1" />
                    <Text style={styles.sectionTitle}>Profil Açıklaması</Text>
                    <IconButton
                      icon="pencil-outline"
                      size={18}
                      onPress={() => setIsEditingDescription(true)}
                      style={styles.editIconButton}
                      iconColor="#6366F1"
                    />
                  </View>
                  
                  {isEditingDescription ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        mode="outlined"
                        label="Profil Açıklaması"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        style={styles.textArea}
                        outlineColor="rgba(99, 102, 241, 0.5)"
                        activeOutlineColor="#6366F1"
                        textColor="#1E293B"
                      />
                      <Button
                        mode="contained"
                        onPress={handleUpdateProfile}
                        style={styles.saveButton}
                        contentStyle={styles.buttonContent}
                      >
                        Kaydet
                      </Button>
                    </View>
                  ) : (
                    <Paragraph style={styles.descriptionText}>
                      {profileData?.description || 'Henüz bir açıklama eklenmemiş.'}
                    </Paragraph>
                  )}
                </View>
                
                <Divider style={styles.divider} />
                
                {/* Contract Information */}
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="file-document-outline" size={22} color="#6366F1" />
                    <Text style={styles.sectionTitle}>Sözleşme Bilgileri</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Başlangıç Tarihi</Text>
                    <Text style={styles.infoValue}>
                      {new Date(profileData?.leaseStartDate).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Bitiş Tarihi</Text>
                    <Text style={styles.infoValue}>
                      {new Date(profileData?.leaseEndDate).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Kalan Gün</Text>
                    <Text style={styles.infoValue}>{profileData?.remainingDays} gün</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Kalan Ay</Text>
                    <Text style={styles.infoValue}>{profileData?.remainingMonths} ay</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ) : (
            /* Contact Tab */
            <Card style={styles.mainCard}>
              <Card.Content style={styles.cardContent}>
                {isEditingContact ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      mode="outlined"
                      label="E-posta"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      style={styles.input}
                      outlineColor="rgba(99, 102, 241, 0.5)"
                      activeOutlineColor="#6366F1"
                      textColor="#1E293B"
                      left={<TextInput.Icon icon="email-outline" color="#6366F1" />}
                    />
                    <TextInput
                      mode="outlined"
                      label="Telefon"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      style={styles.input}
                      outlineColor="rgba(99, 102, 241, 0.5)"
                      activeOutlineColor="#6366F1"
                      textColor="#1E293B"
                      left={<TextInput.Icon icon="phone-outline" color="#6366F1" />}
                    />
                    <Button
                      mode="contained"
                      onPress={handleUpdateContact}
                      style={styles.saveButton}
                      contentStyle={styles.buttonContent}
                    >
                      Kaydet
                    </Button>
                  </View>
                ) : (
                  <View style={styles.contactContainer}>
                    <View style={styles.contactItem}>
                      <View style={styles.contactIconContainer}>
                        <MaterialCommunityIcons name="email-outline" size={22} color="#6366F1" />
                      </View>
                      <View style={styles.contactTextContainer}>
                        <Text style={styles.contactLabel}>E-posta Adresi</Text>
                        <Text style={styles.contactValue}>{profileData?.email}</Text>
                      </View>
                    </View>
                    
                    <Divider style={styles.contactDivider} />
                    
                    <View style={styles.contactItem}>
                      <View style={styles.contactIconContainer}>
                        <MaterialCommunityIcons name="phone-outline" size={22} color="#6366F1" />
                      </View>
                      <View style={styles.contactTextContainer}>
                        <Text style={styles.contactLabel}>Telefon Numarası</Text>
                        <Text style={styles.contactValue}>{profileData?.phoneNumber}</Text>
                      </View>
                    </View>
                    
                    <Button
                      mode="outlined"
                      onPress={() => setIsEditingContact(true)}
                      style={styles.editContactButton}
                      contentStyle={styles.buttonContent}
                      icon="pencil-outline"
                    >
                      İletişim Bilgilerini Düzenle
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Logout Button */}
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            contentStyle={styles.logoutButtonContent}
            icon="logout"
          >
            Çıkış Yap
          </Button>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 90,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileImageOuterContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
  },
  initialsText: {
    fontSize: 36,
    fontFamily: 'System',
  },
  editImageButtonContainer: {
    position: 'absolute',
    right: -5,
    bottom: -5,
  },
  editImageButton: {
    backgroundColor: '#6366F1',
    borderWidth: 2,
    borderColor: 'white',
    margin: 0,
  },
  name: {
    fontFamily: 'System',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    marginBottom: 8,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusActive: {
    backgroundColor: '#10B981',
  },
  statusInactive: {
    backgroundColor: '#F43F5E',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'System',
  },
  segmentedButtons: {
    marginHorizontal: 16,
    marginTop: -16,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  mainCard: {
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardContent: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 10,
  },
  editIconButton: {
    margin: 0,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(203, 213, 225, 0.5)',
    marginVertical: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'System',
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'System',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'System',
    fontWeight: '500',
  },
  contactContainer: {
    paddingVertical: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 12,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'System',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: 'System',
    fontWeight: '500',
  },
  contactDivider: {
    height: 1,
    backgroundColor: 'rgba(203, 213, 225, 0.5)',
    marginVertical: 12,
  },
  editContainer: {
    gap: 16,
    marginVertical: 8,
  },
  input: {
    backgroundColor: 'white',
  },
  textArea: {
    backgroundColor: 'white',
    minHeight: 100,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  buttonContent: {
    height: 48,
  },
  editContactButton: {
    marginTop: 24,
    borderRadius: 12,
    borderColor: '#6366F1',
    borderWidth: 1.5,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutButtonContent: {
    height: 48,
  },
});

export default ProfileScreen; 