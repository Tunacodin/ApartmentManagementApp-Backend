import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import LottieView from "lottie-react-native";
import { TextInput as PaperInput } from "react-native-paper";
import { MaterialIcons } from "react-native-vector-icons";
import colors from "../../../styles/colors";
import animate from "../../../assets/json/animInformation.json";
import axios from 'axios';

const API_URL = "https://172.16.1.155:5001";

const AdminInfoScreen = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailCode, setEmailCode] = useState(["", "", "", ""]);
  const [phoneCode, setPhoneCode] = useState(["", "", "", ""]);
  const [showEmailCodeInput, setShowEmailCodeInput] = useState(false);
  const [showPhoneCodeInput, setShowPhoneCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const emailRefs = [];
  const phoneRefs = [];

  const handleCodeChange = (value, index, type) => {
    const code = type === "email" ? [...emailCode] : [...phoneCode];
    code[index] = value.slice(-1);
    type === "email" ? setEmailCode(code) : setPhoneCode(code);

    if (value && index < 3) {
      const refs = type === "email" ? emailRefs : phoneRefs;
      refs[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event, index, type) => {
    if (event.nativeEvent.key === "Backspace" && index > 0) {
      const refs = type === "email" ? emailRefs : phoneRefs;
      refs[index - 1]?.focus();
    }
  };

  const validateForm = () => {
    // if (!fullName.trim()) {
    //   Alert.alert('Hata', 'Lütfen ad soyad giriniz');
    //   return false;
    // }
    // if (!email.trim() || !email.includes('@')) {
    //   Alert.alert('Hata', 'Geçerli bir e-posta adresi giriniz');
    //   return false;
    // }
    // if (!phone.trim() || phone.length < 10) {
    //   Alert.alert('Hata', 'Geçerli bir telefon numarası giriniz');
    //   return false;
    // }
    // if (!isEmailVerified || !isPhoneVerified) {
    //   Alert.alert('Hata', 'Lütfen e-posta ve telefon doğrulamasını tamamlayın');
    //   return false;
    // }
    return true;
  };

  const handleSendVerificationCode = async (type) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/sendVerificationCode`, {
        type,
        email: type === 'email' ? email : undefined,
        phone: type === 'phone' ? phone : undefined
      });
      
      if (response.data.success) {
        type === 'email' ? setShowEmailCodeInput(true) : setShowPhoneCodeInput(true);
        Alert.alert('Başarılı', `Doğrulama kodu ${type === 'email' ? 'e-postanıza' : 'telefonunuza'} gönderildi`);
      }
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (type) => {
    const code = type === 'email' ? emailCode.join('') : phoneCode.join('');
    if (code.length !== 4) {
      Alert.alert('Hata', 'Lütfen 4 haneli kodu giriniz');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/verifyCode`, {
        type,
        code,
        email: type === 'email' ? email : undefined,
        phone: type === 'phone' ? phone : undefined
      });

      if (response.data.success) {
        type === 'email' ? setIsEmailVerified(true) : setIsPhoneVerified(true);
        Alert.alert('Başarılı', 'Doğrulama başarılı');
      }
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.message || 'Doğrulama başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/Admin`, {
        fullName,
        email,
        phone,
        emailCode: emailCode.join(''),
        phoneCode: phoneCode.join('')
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('API Response:', response.data);

      if (response.status === 200) {
        Alert.alert('Başarılı', 'Yönetici bilgileri kaydedildi');
      }
    } catch (error) {
      console.error('API Error:', error);
      if (error.response) {
        console.log('Error Response:', error.response.data);
        console.log('Error Status:', error.response.status);
      }
      Alert.alert('Hata', error.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Animasyon */}
        <LottieView source={animate} autoPlay loop style={styles.animation} />

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Başlık */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Yönetici Bilgileri</Text>
          </View>

          {/* Ad Soyad Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="person"
              size={24}
              color={colors.primary}
              style={styles.icon}
            />
            <PaperInput
              mode="outlined"
              label="Ad Soyad"
              placeholder="Ad Soyadınızı girin"
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              outlineColor={colors.darkGray}
              activeOutlineColor={colors.primary}
            />
          </View>

          {/* E-posta Input */}
          <View style={styles.row}>
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
                placeholder="E-posta adresinizi girin"
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { flex: 3 }]}
                outlineColor={colors.darkGray}
                activeOutlineColor={colors.primary}
              />
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSendVerificationCode('email')}
            >
              <Text style={styles.buttonText}>Onay Kodu</Text>
            </TouchableOpacity>
          </View>

          {/* E-posta Onay Kodu Input */}
          {showEmailCodeInput && !isEmailVerified && (
            <View style={styles.codeContainer}>
              {emailCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (emailRefs[index] = ref)}
                  style={styles.codeInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) =>
                    handleCodeChange(value, index, "email")
                  }
                  onKeyPress={(event) => handleKeyPress(event, index, "email")}
                />
              ))}
            </View>
          )}

          {/* Telefon Numarası Input */}
          <View style={styles.row}>
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
                placeholder="Telefon numaranızı girin"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={[styles.input, { flex: 3 }]}
                outlineColor={colors.darkGray}
                activeOutlineColor={colors.primary}
              />
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSendVerificationCode('phone')}
            >
              <Text style={styles.buttonText}>Onay Kodu</Text>
            </TouchableOpacity>
          </View>

          {/* Telefon Onay Kodu Input */}
          {showPhoneCodeInput && !isPhoneVerified && (
            <View style={styles.codeContainer}>
              {phoneCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (phoneRefs[index] = ref)}
                  style={styles.codeInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) =>
                    handleCodeChange(value, index, "phone")
                  }
                  onKeyPress={(event) => handleKeyPress(event, index, "phone")}
                />
              ))}
            </View>
          )}

          {/* Doğrulama Butonları */}
          {showEmailCodeInput && !isEmailVerified && (
            <TouchableOpacity 
              style={[styles.verifyButton, isLoading && styles.disabledButton]}
              onPress={() => handleVerifyCode('email')}
              disabled={isLoading}
            >
              <Text style={styles.verifyButtonText}>E-posta Doğrula</Text>
            </TouchableOpacity>
          )}

          {showPhoneCodeInput && !isPhoneVerified && (
            <TouchableOpacity 
              style={[styles.verifyButton, isLoading && styles.disabledButton]}
              onPress={() => handleVerifyCode('phone')}
              disabled={isLoading}
            >
              <Text style={styles.verifyButtonText}>Telefon Doğrula</Text>
            </TouchableOpacity>
          )}

          {/* Gönder Butonu */}
          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Gönderiliyor...' : 'Gönder'}
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  animation: {
    width: 150,
    height: 150,
    position: "relative",
  },
  titleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginBottom: 10,
   
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
    marginBottom: 10,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  button: {
    flex: 1,
    marginLeft: 10,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 13,
    color: colors.white,
    textAlign: "center",
    fontWeight: "bold",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  codeInput: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 5,
    textAlign: "center",
    fontSize: 18,
    color: colors.black,
    backgroundColor: colors.white,
  },
  verifyButton: {
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
  },
  verifyButtonText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  submitButtonText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AdminInfoScreen;
