import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import LottieView from "lottie-react-native";
import { TextInput as PaperInput } from "react-native-paper";
import colors from "../../../styles/colors";
import animate from "../../../assets/json/animInformation.json";
import axios from "axios";

// Backend API URL
const API_URL = "https://your-backend-url/api/admin";

const AdminInfoScreen = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendVerificationCode = async (type) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/sendVerificationCode`, {
        type,
        email: type === "email" ? email : undefined,
        phone: type === "phone" ? phone : undefined,
      });

      if (response.data.success) {
        Alert.alert(
          "Başarılı",
          `${
            type === "email" ? "E-posta" : "Telefon"
          } doğrulama kodu gönderildi.`
        );
      } else {
        Alert.alert("Hata", "Doğrulama kodu gönderilemedi.");
      }
    } catch (error) {
      console.error("Doğrulama kodu gönderme hatası:", error);
      Alert.alert("Hata", "Doğrulama kodu gönderilemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (type, code) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/verifyCode`, {
        type,
        code,
        email: type === "email" ? email : undefined,
        phone: type === "phone" ? phone : undefined,
      });

      if (response.data.success) {
        if (type === "email") setEmailVerified(true);
        if (type === "phone") setPhoneVerified(true);
        Alert.alert(
          "Başarılı",
          `${type === "email" ? "E-posta" : "Telefon"} doğrulandı.`
        );
      } else {
        Alert.alert("Hata", "Doğrulama başarısız.");
      }
    } catch (error) {
      console.error("Doğrulama hatası:", error);
      Alert.alert("Hata", "Doğrulama başarısız.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !email || !phone) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz.");
      return;
    }

    if (!emailVerified || !phoneVerified) {
      Alert.alert("Hata", "Lütfen doğrulama işlemlerini tamamlayınız.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}`, {
        fullName,
        email,
        phone,
      });

      if (response.status === 200) {
        Alert.alert("Başarılı", "Yönetici bilgileri kaydedildi.");
      }
    } catch (error) {
      console.error("API Hatası:", error);
      Alert.alert("Hata", "Yönetici bilgileri kaydedilemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <LottieView source={animate} autoPlay loop style={styles.animation} />

        <View style={styles.formContainer}>
          <Text style={styles.title}>Yönetici Bilgileri</Text>

          <PaperInput
            mode="outlined"
            label="Ad Soyad"
            placeholder="Ad Soyadınızı girin"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />
          <PaperInput
            mode="outlined"
            label="E-posta"
            placeholder="E-posta adresinizi girin"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => sendVerificationCode("email")}
          >
            <Text style={styles.buttonText}>E-posta Doğrulama Kodu Gönder</Text>
          </TouchableOpacity>

          <PaperInput
            mode="outlined"
            label="Telefon Numarası"
            placeholder="Telefon numaranızı girin"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => sendVerificationCode("phone")}
          >
            <Text style={styles.buttonText}>Telefon Doğrulama Kodu Gönder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? "Gönderiliyor..." : "Gönder"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.white,
  },
  animation: {
    width: 150,
    height: 150,
    alignSelf: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: colors.success,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AdminInfoScreen;
