import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from 'react-native';
import { TextInput } from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from "@expo/vector-icons";
import { api, API_ENDPOINTS } from '../../config/apiConfig';

const ForgotPasswordScreen = ({ route, navigation }) => {
  const { role } = route.params;
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Lütfen e-posta adresinizi girin.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Lütfen tüm alanları doldurun.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Şifreler eşleşmiyor.');
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('\n=== Şifre Sıfırlama İsteği ===');
      console.log('Endpoint:', API_ENDPOINTS.AUTH.RESET_PASSWORD);
      console.log('Gönderilen veri:', { 
        email,
        newPassword: '********' // Güvenlik için şifreyi gizle
      });

      const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        email: email,
        newPassword: newPassword
      });

      console.log('\n=== API Yanıtı ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);

      if (response.data.success) {
        Alert.alert(
          'Başarılı!',
          'Şifreniz başarıyla sıfırlandı.',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.navigate('LoginScreen', { role })
            }
          ]
        );
      } else {
        throw new Error(response.data.message || 'Şifre sıfırlama işlemi başarısız oldu.');
      }
    } catch (error) {
      console.error('\n=== Hata Detayı ===');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      setErrorMessage(error.response?.data?.message || 'Şifre sıfırlama işlemi başarısız oldu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backArrow}
            onPress={() => navigation.navigate('Login', { role })}
            disabled={isLoading}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.iconContainer}>
            <MaterialIcons name="lock-reset" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>
            {role === 'admin' ? 'Yönetici Şifre Sıfırlama' : 'Kiracı Şifre Sıfırlama'}
          </Text>
          <Text style={styles.headerSubtitle}>
            E-posta adresinizi ve yeni şifrenizi girin
          </Text>
        </View>
      </LinearGradient>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <TextInput
              mode="flat"
              label="E-posta Adresi"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMessage('');
              }}
              style={styles.input}
              theme={{ colors: { primary: '#6366F1' }}}
              left={<TextInput.Icon icon="email" color="#6366F1" />}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errorMessage}
              disabled={isLoading}
            />

            <TextInput
              mode="flat"
              label="Yeni Şifre"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setErrorMessage('');
              }}
              style={styles.input}
              theme={{ colors: { primary: '#6366F1' }}}
              left={<TextInput.Icon icon="lock" color="#6366F1" />}
              secureTextEntry
              error={!!errorMessage}
              disabled={isLoading}
            />

            <TextInput
              mode="flat"
              label="Şifre Tekrar"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrorMessage('');
              }}
              style={styles.input}
              theme={{ colors: { primary: '#6366F1' }}}
              left={<TextInput.Icon icon="lock-check" color="#6366F1" />}
              secureTextEntry
              error={!!errorMessage}
              disabled={isLoading}
            />

            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#6366F1', '#8B5CF6']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.submitButtonText}>İşleniyor</Text>
                    <MaterialIcons name="hourglass-top" size={24} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.submitButtonContent}>
                    <Text style={styles.submitButtonText}>Şifremi Sıfırla</Text>
                    <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    color: '#EF4444',
    fontSize: 14,
    flex: 1,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    padding: 16,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  backArrow: {
    position: 'absolute',
    left: 20,
    top: Platform.OS === 'ios' ? 60 : 40,
    zIndex: 1,
    padding: 8,
  },
});

export default ForgotPasswordScreen;
