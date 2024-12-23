import React, { useState, useEffect } from "react";
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
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import { auth } from "../../../../firebase";
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  onAuthStateChanged,
  reload 
} from "firebase/auth";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const API_URL = "http://172.16.1.155:5001/api/User";


const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  }
});

api.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response.data);
    return response;
  },
  error => {
    console.log('Error:', error);
    return Promise.reject(error);
  }
);

const AdminInfoScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [createdAt, setCreatedAt] = useState(new Date().toISOString());
  const [emailVerified, setEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await reload(user);
        setEmailVerified(user.emailVerified);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkEmailVerification = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await reload(user);
        setEmailVerified(user.emailVerified);
        
        if (user.emailVerified) {
          return true;
        } else {
          Alert.alert("Uyarı", "Lütfen email adresinize gelen linke tıklayıp sayfayı yeniledikten sonra tekrar deneyin.");
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error("Email verification check error:", error);
      return false;
    }
  };

  const sendVerificationCode = async () => {
    try {
      setIsLoading(true);

      // Email formatını kontrol et
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        Alert.alert("Hata", "Lütfen geçerli bir e-posta adresi girin.");
        return;
      }

      // Önce geçici bir hesap oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Doğrulama emaili gönder
      await sendEmailVerification(user);
      
      Alert.alert(
        "Başarılı", 
        "E-posta adresinize do��rulama linki gönderildi. Lütfen e-postanızı kontrol edin ve linke tıklayarak hesabınızı doğrulayın."
      );

    } catch (error) {
      console.error("Doğrulama hatası:", error);
      
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert("Hata", "Bu e-posta adresi zaten kullanımda.");
      } else {
        Alert.alert("Hata", "Doğrulama işlemi başarısız oldu.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !phone || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz.");
      return;
    }

    const isVerified = await checkEmailVerification();
    if (!isVerified) {
      return;
    }

    try {
      setIsLoading(true);
      
      const userData = {
        name: firstName,
        lastname: lastName,
        password: password,
        email: email,
        phoneNumber: phone,
        role: "admin",
        createdAt: new Date().toISOString()
      };

      console.log('Gönderilen veri:', userData);

      const response = await api.post(API_URL, userData);

      console.log('API Yanıtı:', response.data);

      if (response.data === "User added successfully." || response.status === 200) {
        setIsSubmitted(true);
        Alert.alert("Başarılı", "Yönetici bilgileri kaydedildi.");
      }
    } catch (error) {
      console.error("API Hatası:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        request: error.request
      });

      if (error.code === 'ECONNABORTED') {
        Alert.alert(
          "Bağlantı Zaman Aşımı",
          "İstek zaman aşımına uğradı. İnternet bağlantınızı kontrol edip tekrar deneyin."
        );
      } else if (error.response) {
        Alert.alert("Hata", error.response.data.message || "Yönetici bilgileri kaydedilemedi.");
      } else if (error.request) {
        Alert.alert(
          "Bağlantı Hatası", 
          "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin."
        );
      } else {
        Alert.alert("Hata", "Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshVerificationStatus = async () => {
    const isVerified = await checkEmailVerification();
    if (isVerified) {
      Alert.alert("Başarılı", "Email doğrulaması tamamlandı!");
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
                style={[styles.input, { flex: 0.7 }]}
                outlineColor={colors.darkGray}
                activeOutlineColor={colors.primary}
              />
              <TouchableOpacity
                style={[styles.button, { flex: 0.15 }]}
                onPress={sendVerificationCode}
              >
                <Icon name="send" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { flex: 0.15 }]}
                onPress={refreshVerificationStatus}
              >
                <Icon name="refresh" size={20} color={colors.primary} />
              </TouchableOpacity>
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
                isSubmitted && styles.submittedButton
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid || isLoading || isSubmitted}
            >
              <Text style={[styles.submitButtonText, { color: colors.white }]}>
                {isLoading 
                  ? "Gönderiliyor..." 
                  : isSubmitted 
                    ? "Kaydedildi (1/4)" 
                    : `Kaydet (${isFormValid ? "1/4" : "0/4"})`
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
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
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
});

export default AdminInfoScreen;
