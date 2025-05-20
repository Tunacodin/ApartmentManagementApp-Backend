import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../../styles/colors';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, api, setCurrentAdminId, setCurrentUserId, setAuthToken } from '../../config/apiConfig';
import * as Animatable from 'react-native-animatable';

const LoginScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const role = route.params?.role || 'admin';

  // Daha önce girilen e-posta adreslerini yükle
  useEffect(() => {
    loadEmailSuggestions();
  }, []);

  const loadEmailSuggestions = async () => {
    try {
      const savedEmails = await AsyncStorage.getItem('savedEmails');
      if (savedEmails) {
        setEmailSuggestions(JSON.parse(savedEmails));
      }
    } catch (error) {
      console.error('E-posta önerileri yüklenirken hata:', error);
    }
  };

  const saveEmail = async (newEmail) => {
    try {
      const savedEmails = await AsyncStorage.getItem('savedEmails');
      let emails = savedEmails ? JSON.parse(savedEmails) : [];
      
      // Eğer e-posta zaten listede yoksa ekle
      if (!emails.includes(newEmail)) {
        emails = [newEmail, ...emails].slice(0, 5); // Son 5 e-postayı sakla
        await AsyncStorage.setItem('savedEmails', JSON.stringify(emails));
        setEmailSuggestions(emails);
      }
    } catch (error) {
      console.error('E-posta kaydedilirken hata:', error);
    }
  };

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    console.log('\n=== Giriş İşlemi Başladı ===');
    console.log('Giriş yapılmaya çalışılan email:', email.trim());
    console.log('Giriş yapılmaya çalışılan rol:', role);

    const loginData = {
      email: email.trim(),
      password: password
    };

    try {
      console.log('\n=== API İsteği Gönderiliyor ===');
      console.log('Endpoint:', API_ENDPOINTS.AUTH.LOGIN);
      console.log('Gönderilen veri:', { ...loginData, password: '********' });

      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, loginData);

      if (response.data.message === "Giriş başarılı") {
        console.log('\n=== Giriş Başarılı ===');
        const { message, userId, email, role, adminId, token } = response.data;

        // Başarılı girişte e-postayı kaydet
        await saveEmail(email);

        // Token'ı header'a ekle
        setAuthToken(token);

        // Önce userId'yi AsyncStorage'a kaydet
        await AsyncStorage.multiSet([
          ['userId', userId?.toString() || ''],
          ['userEmail', email],
          ['userRole', role],
          ['authToken', token],
          ...(role === 'admin' ? [['adminId', userId.toString()]] : [])
        ]);

        // API instance'ına userId ve adminId'yi ekle
        setCurrentUserId(userId);
        if (role === 'admin') {
          setCurrentAdminId(userId);
        }

        // Başarılı giriş sonrası yönlendirme
        if (role === 'admin') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AdminNavigator' }],
          });
        } else if (role === 'tenant') {
          console.log('\n=== Kiracı Paneline Yönlendiriliyor ===');
          
          navigation.reset({
            index: 0,
            routes: [{ 
              name: 'TenantNavigator',
              params: { userId: userId }
            }],
          });
        }
      } else {
        // Handle specific error using errorCode
        switch(response.data.errorCode) {
          case 'USER_NOT_FOUND':
            Alert.alert('Hata', 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.');
            break;
          case 'INVALID_PASSWORD':
            Alert.alert('Hata', 'Girdiğiniz şifre yanlış. Lütfen tekrar deneyin.');
            break;
          case 'ACCOUNT_DISABLED':
            Alert.alert('Hata', 'Hesabınız devre dışı bırakılmış. Lütfen yönetici ile iletişime geçin.');
            break;
          default:
            Alert.alert('Hata', response.data.message || 'Giriş yapılırken bir hata oluştu.');
        }
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        Alert.alert('Hata', error.response.data.message || 'Sunucu hatası oluştu.');
      } else if (error.request) {
        console.error('No response received:', error.request);
        Alert.alert('Bağlantı Hatası', 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        console.error('Error:', error.message);
        Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailSelect = (selectedEmail) => {
    setEmail(selectedEmail);
    setShowSuggestions(false);
  };

  const renderEmailSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleEmailSelect(item)}
    >
      <Icon name="history" size={16} color={colors.darkGray} style={styles.suggestionIcon} />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.overlay}>
          <Animatable.View 
            animation="fadeInDown" 
            duration={1000}
            style={styles.container}
          >
            <View style={styles.iconWrapper}>
              <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Icon name="user-shield" size={60} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>
              {role === 'admin' ? 'Yönetici Girişi' : 'Kiracı Girişi'}
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Icon name="user" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setShowSuggestions(text.length > 0);
                  }}
                  onFocus={() => setShowSuggestions(email.length > 0)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {showSuggestions && emailSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={emailSuggestions.filter(email => 
                      email.toLowerCase().includes(email.toLowerCase())
                    )}
                    renderItem={renderEmailSuggestion}
                    keyExtractor={(item) => item}
                    style={styles.suggestionsList}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifre"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                  <Icon 
                    name={showPassword ? 'eye' : 'eye-slash'} 
                    size={20} 
                    color="#64748B" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#6366F1', '#4F46E5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Giriş Yap</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.linkContainer}>
                <TouchableOpacity
                  style={styles.link}
                  onPress={() => {
                    if (role === 'admin') {
                      navigation.navigate('AdminCreate', { screen: 'AdminInfo' });
                    } else if (role === 'tenant') {
                      navigation.navigate('TenantNavigator');
                    }
                  }}
                >
                  <Text style={styles.linkText}>
                    {role === 'admin' ? 'Yönetici Kaydı' : 'Kiracı Kaydı'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.link}
                  onPress={() => navigation.navigate('ForgotPassword', { role })}
                >
                  <Text style={styles.linkText}>Şifremi Unuttum</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#0F172A',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    width: '100%',
    height: 55,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  link: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  linkText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionsContainer: {
    width: '100%',
    maxHeight: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  suggestionsList: {
    padding: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    color: '#0F172A',
    fontSize: 16,
  },
});

export default LoginScreen;