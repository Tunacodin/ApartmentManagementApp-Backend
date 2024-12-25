import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../../styles/colors';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const role = route.params?.role || 'admin';

  const API_URL = "http://172.20.0.226:5001/api/User/login";

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
    console.log('Login attempt started:', {
      email: email.trim(),
      timestamp: new Date().toISOString(),
      apiUrl: API_URL
    });

    try {
      const loginDto = {
        email: email.trim(),
        password: password
      };

      console.log('Sending request to server:', {
        url: API_URL,
        method: 'POST',
        body: loginDto
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginDto),
      });

      console.log('Server response received:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        timestamp: new Date().toISOString()
      });

      if (response.status === 404) {
        throw new Error('API endpoint bulunamadı. URL: ' + API_URL);
      }

      const rawResponse = await response.text();
      console.log('Raw response:', rawResponse);

      let data;
      try {
        data = rawResponse ? JSON.parse(rawResponse) : null;
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('JSON Parse Error:', {
          error: parseError,
          rawResponse,
          timestamp: new Date().toISOString()
        });
        throw new Error('Sunucu yanıtı işlenemedi');
      }

      if (response.status === 200 && data) {
        console.log('Login successful:', {
          userId: data.userId,
          email: data.email,
          role: data.role
        });

        await AsyncStorage.multiSet([
          ['userId', data.userId.toString()],
          ['userEmail', data.email],
          ['userRole', data.role]
        ]);

        Alert.alert(
          'Başarılı', 
          data.message || 'Giriş başarılı!',
          [
            {
              text: 'Tamam',
              onPress: () => {
                if (data.role === 'admin') {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'AdminDashboard' }],
                  });
                } else {
                  Alert.alert('Hata', 'Yetkisiz giriş denemesi');
                }
              },
            },
          ]
        );
      } else if (response.status === 401) {
        Alert.alert('Hata', 'Geçersiz e-posta veya şifre');
      } else if (response.status === 400) {
        Alert.alert('Hata', data || 'E-posta ve şifre gereklidir');
      } else {
        Alert.alert('Hata', data?.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        url: API_URL,
        timestamp: new Date().toISOString()
      });

      if (error.message.includes('404')) {
        Alert.alert(
          'Sistem Hatası',
          'API endpoint bulunamadı. Lütfen sistem yöneticisi ile iletişime geçin.'
        );
      } else if (error.message.includes('Network request failed')) {
        Alert.alert(
          'Bağlantı Hatası',
          'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.'
        );
      } else {
        Alert.alert(
          'Hata',
          'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#E0EAFC', '#CFDEF3']}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={styles.background}
      >
        <BlurView
          intensity={60}
          tint="light"
          style={[styles.blurContainer, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}
        >
          <View style={styles.container}>
            <View style={styles.iconWrapper}>
              <Icon name="user-shield" size={80} color={colors.darkGray} />
            </View>

            <Text style={styles.title}>
              {role === 'admin' ? 'Yönetici Girişi' : 'Kiracı Girişi'}
            </Text>

            <View style={styles.inputContainer}>
              <Icon name="user" size={20} color={colors.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.darkGray}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color={colors.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={colors.darkGray}
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color={colors.darkGray} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <TouchableOpacity
                style={styles.link}
                onPress={() => {
                  if (role === 'admin') {
                    navigation.navigate('AdminNavigator');
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
        </BlurView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  container: {
    padding: 30,
    alignItems: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.black,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: colors.white,
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
    paddingHorizontal: 10,
  },
  link: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoginScreen;
