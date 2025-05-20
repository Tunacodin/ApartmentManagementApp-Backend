import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';

const AdminInfoScreen = () => {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const scrollViewRef = useRef(null);

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      
      const adminData = {
        fullName: `${firstName} ${lastName}`,
        email,
        phoneNumber: phone,
        password,
      };

      Alert.alert(
        'Başarılı',
        'Yönetici bilgileri doğrulandı. Test aşamasında veritabanına kaydedilmedi.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('ApartmentInfo')
          }
        ]
      );

    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="admin-panel-settings" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Yönetici Bilgileri</Text>
            <Text style={styles.headerSubtitle}>Yeni yönetici hesabı oluştur</Text>
          </View>
        </LinearGradient>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <TextInput
                mode="flat"
                label="Ad"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
                theme={{ colors: { primary: '#6366F1' }}}
                left={<TextInput.Icon icon="account" color="#6366F1" />}
              />

              <TextInput
                mode="flat"
                label="Soyad"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
                theme={{ colors: { primary: '#6366F1' }}}
                left={<TextInput.Icon icon="account-outline" color="#6366F1" />}
              />

              <TextInput
                mode="flat"
                label="E-posta"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                theme={{ colors: { primary: '#6366F1' }}}
                left={<TextInput.Icon icon="email" color="#6366F1" />}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                mode="flat"
                label="Telefon Numarası"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                theme={{ colors: { primary: '#6366F1' }}}
                left={<TextInput.Icon icon="phone" color="#6366F1" />}
                keyboardType="phone-pad"
              />

              <TextInput
                mode="flat"
                label="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                theme={{ colors: { primary: '#6366F1' }}}
                left={<TextInput.Icon icon="lock" color="#6366F1" />}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSaving}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Kaydet ve Devam Et</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
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
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  formContainer: {
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
  inputGroup: {
    gap: 16,
  },
  input: {
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
});

export default AdminInfoScreen;
