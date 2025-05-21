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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../../styles/colors';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, api, setCurrentAdminId, setCurrentUserId, setAuthToken } from '../../config/apiConfig';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const roleGradients = {
  admin: ['#6366F1', '#4F46E5'],
  tenant: ['#0EA5E9', '#0284C7'],
  owner: ['#8B5CF6', '#7C3AED'],
  worker: ['#10B981', '#059669'],
};

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
    const loginData = {
      email: email.trim(),
      password: password
    };

    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, loginData);

      if (response.data.message === "Giriş başarılı") {
        const { message, userId, email, role, adminId, token } = response.data;
        await saveEmail(email);
        setAuthToken(token);

        await AsyncStorage.multiSet([
          ['userId', userId?.toString() || ''],
          ['userEmail', email],
          ['userRole', role],
          ['authToken', token],
          ...(role === 'admin' ? [['adminId', userId.toString()]] : [])
        ]);

        setCurrentUserId(userId);
        if (role === 'admin') {
          setCurrentAdminId(userId);
        }

        if (role === 'admin') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AdminNavigator' }],
          });
        } else if (role === 'tenant') {
          navigation.reset({
            index: 0,
            routes: [{ 
              name: 'TenantNavigator',
              params: { userId: userId }
            }],
          });
        }
      } else {
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
        Alert.alert('Hata', error.response.data.message || 'Sunucu hatası oluştu.');
      } else if (error.request) {
        Alert.alert('Bağlantı Hatası', 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => {
        setEmail(item);
        setShowSuggestions(false);
      }}
    >
      <Icon name="history" size={16} color="#fff" style={styles.suggestionIcon} />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
          <Animatable.View 
          animation="fadeInUp" 
            duration={1000}
          style={styles.contentContainer}
          >
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={roleGradients[role]}
                style={styles.iconGradient}
              >
                <Icon name={role === 'admin' ? 'user-shield' : 'user'} size={40} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>
              {role === 'admin' ? 'Yönetici Girişi' : 'Kiracı Girişi'}
            </Text>
            <Text style={styles.subtitle}>
              Hoş geldiniz! Lütfen giriş yapın.
            </Text>
          </View>

            <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Icon name="envelope" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta"
                placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setShowSuggestions(text.length > 0);
                  }}
                  onFocus={() => setShowSuggestions(email.length > 0)}
                  keyboardType="email-address"
                  autoCapitalize="none"
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

            <View style={styles.inputWrapper}>
                <Icon name="lock" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifre"
                placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeIcon}
              >
                  <Icon 
                    name={showPassword ? 'eye' : 'eye-slash'} 
                    size={20} 
                    color="#64748B" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                colors={roleGradients[role]}
                style={styles.loginButtonGradient}
                >
                  {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                  ) : (
                  <Text style={styles.loginButtonText}>Giriş Yap</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

            <View style={styles.linksContainer}>
                <TouchableOpacity
                  onPress={() => {
                    if (role === 'admin') {
                      navigation.navigate('AdminCreate', { screen: 'AdminInfo' });
                  } else {
                      navigation.navigate('TenantNavigator');
                    }
                  }}
                >
                <Text style={[styles.linkText, { color: roleGradients[role][0] }]}>
                    {role === 'admin' ? 'Yönetici Kaydı' : 'Kiracı Kaydı'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword', { role })}
                >
                <Text style={[styles.linkText, { color: roleGradients[role][0] }]}>Şifremi Unuttum</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputWrapper: {
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
    color: '#1E293B',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  loginButton: {
    height: 55,
    borderRadius: 12,
    marginTop: 20,
    overflow: 'hidden',
  },
  loginButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#1E293B',
    fontSize: 16,
  },
});

export default LoginScreen;