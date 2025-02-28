import React, { useState } from "react";
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
} from "react-native";
import LottieView from "lottie-react-native";
import { TextInput as PaperInput } from "react-native-paper";
import colors from "../../../styles/colors";
import animate from "../../../assets/json/animInformation.json";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { API_ENDPOINTS, axiosConfig } from '../../../config/apiConfig';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_ENDPOINTS.ADMIN,
  ...axiosConfig
});

// Axios interceptors ekle
api.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
}, error => {
  console.log('Request Error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    if (error.response) {
      // Sunucudan yanıt geldi ama başarısız
      console.log('Error Response:', error.response.data);
      console.log('Error Status:', error.response.status);
    } else if (error.request) {
      // İstek yapıldı ama yanıt gelmedi
      console.log('Error Request:', error.request);
    } else {
      // İstek oluşturulurken hata oluştu
      console.log('Error Message:', error.message);
    }
    return Promise.reject(error);
  }
);

const AdminInfoScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [password, setPassword] = useState("");

  const validateForm = () => {
    if (!firstName || !lastName || !email || !phone || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz.");
      return false;
    }

    // Email formatı kontrolü
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      Alert.alert("Hata", "Lütfen geçerli bir e-posta adresi girin.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Form verilerini detaylı logla
    console.log("==================== FORM VERİLERİ ====================");
    console.log("Ad:", firstName);
    console.log("Soyad:", lastName);
    console.log("Email:", email);
    console.log("Telefon:", phone);
    console.log("Şifre:", password ? "********" : "Boş");
    console.log("====================================================");
    
    if (!validateForm()) {
      console.log("❌ Form doğrulama başarısız");
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        id: 0,
        fullName: `${firstName} ${lastName}`,
        email: email.trim(),
        phoneNumber: phone.trim(),
        role: "admin",
        isActive: true,
        profileImageUrl: "https://example.com/default-profile.jpg",
        description: "Yeni yönetici hesabı",
        password: password
      };

      // API isteği detaylarını logla
      console.log("\n=================== API İSTEĞİ ===================");
      console.log("📍 Endpoint:", API_ENDPOINTS.ADMIN);
      console.log("📦 Gönderilen Veriler:", JSON.stringify(userData, null, 2));
      console.log("===================================================\n");

      const response = await api.post('', userData);

      console.log("\n=================== API YANITI ===================");
      console.log("✅ Durum Kodu:", response.status);
      console.log("📄 Yanıt Verisi:", JSON.stringify(response.data, null, 2));
      console.log("==================================================\n");

      if (response.status === 200 || response.status === 201) {
        setIsSubmitted(true);
        Alert.alert("Başarılı", "Yönetici bilgileri kaydedildi.");
      }
    } catch (error) {
      console.log("\n=================== HATA DETAYI ===================");
      console.error("❌ Hata Türü:", error.name);
      console.error("❌ Hata Mesajı:", error.message);
      if (error.response) {
        console.error("❌ Sunucu Yanıtı:", error.response.data);
        console.error("❌ Durum Kodu:", error.response.status);
      }
      console.log("===================================================\n");

      Alert.alert("Hata", "Yönetici bilgileri kaydedilirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = firstName && lastName && email && phone && password;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.innerContainer} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <LottieView source={animate} autoPlay loop style={styles.animation} />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Yönetici Bilgileri</Text>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="person"
                size={24}
                color={colors.primary}
                style={styles.icon}
              />
              <PaperInput
                mode="outlined"
                label="Ad"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
                outlineColor={colors.darkGray}
                activeOutlineColor={colors.primary}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="person-outline"
                size={24}
                color={colors.primary}
                style={styles.icon}
              />
              <PaperInput
                mode="outlined"
                label="Soyad"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
                outlineColor={colors.darkGray}
                activeOutlineColor={colors.primary}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="email"
                size={24}
                color={colors.primary}
                style={styles.icon}
              />
              <PaperInput
                mode="outlined"
                label="E-posta"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                outlineColor={colors.darkGray}
                activeOutlineColor={colors.primary}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="phone"
                size={24}
                color={colors.primary}
                style={styles.icon}
              />
              <PaperInput
                mode="outlined"
                label="Telefon Numarası"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                outlineColor={colors.darkGray}
                activeOutlineColor={colors.primary}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="lock"
                size={24}
                color={colors.primary}
                style={styles.icon}
              />
              <PaperInput
                mode="outlined"
                label="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                outlineColor={colors.darkGray}
                activeOutlineColor={colors.primary}
              />
            </View>
          </View>

          <View style={styles.submitButtonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitted && styles.submittedButton,
                (!isFormValid || isLoading) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid || isLoading || isSubmitted}
            >
              <Text style={[
                styles.submitButtonText,
                (!isFormValid || isLoading) && styles.disabledButtonText
              ]}>
                {isLoading 
                  ? "Gönderiliyor..." 
                  : isSubmitted 
                    ? "Kaydedildi (1/4)" 
                    : "Kaydet"
                }
              </Text>
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
    backgroundColor: colors.white,
  },
  innerContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  headerContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    marginTop: 60,
  },
  animation: {
    width: 200,
    height: 200,
    position: "relative",
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.black,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: '80%',
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  submitButtonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
  },
  submittedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submittedButton: {
    backgroundColor: colors.success,
  },
  disabledButton: {
    backgroundColor: colors.gray,
    opacity: 0.7,
  },
  disabledButtonText: {
    color: colors.darkGray,
  },
});

export default AdminInfoScreen;
