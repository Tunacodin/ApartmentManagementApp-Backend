import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  TextInput,
} from "react-native";
import { TextInput as PaperInput } from "react-native-paper";
import { auth } from "../../../../firebaseConfig"; // Firebase Auth'u import et
import {
  sendSignInLinkToEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import colors from "../../../../src/styles/colors";
import LottieView from 'lottie-react-native'; // Add this import for LottieView
import animate from "../../../../src/assets/json/animHome2.json";
import Icon from 'react-native-vector-icons/Ionicons'; // Ok simgesi için ikon kütüphanesini ekleyin

const VerificationInput = ({ type, onSend }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim()) {
      onSend(inputValue);
      setInputValue(""); // Giriş alanını temizle
    } else {
      Alert.alert("Hata", "Lütfen geçerli bir değer girin.");
    }
  };

  return (
    <View style={{
      justifyContent: "space-between",
      width:"100%",
      flexDirection:"row",
      alignItems:"center",
   marginBottom:10,
    }} >
      <View style={{width:"90%"}}>
      <PaperInput
        mode="outlined"
        label={type === "email" ? "E-posta Adresi" : "Telefon Numarası"}
        placeholder={type === "email" ? "E-posta adresinizi girin" : "Telefon numaranızı girin"}
        value={inputValue}
        onChangeText={setInputValue}
      />
  </View>
   
      
      <TouchableOpacity onPress={handleSend} style={{width:"10%",paddingLeft:10}}>
        <Icon name="arrow-forward" size={24} color={colors.primary} />
      </TouchableOpacity>
   
        </View>
  );
};

const AdminInfoScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]); // 6 hücreli doğrulama kodu
  const [isCodeInputVisible, setIsCodeInputVisible] = useState(false);

  const actionCodeSettings = {
    url: "exp://172.20.0.187/finishSignUp",
    handleCodeInApp: true,
  };

   const { userInfo, updatePartialInfo } = useContext(UserContext);
  const [form, setForm] = useState({
    name: userInfo.name || "",
    lastname: userInfo.lastname || "",
    email: userInfo.email || "",
    phoneNumber: userInfo.phoneNumber || "",
  });

  const handleNext = () => {
    if (!form.name || !form.lastname || !form.email || !form.phoneNumber) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz.");
      return;
    }

    updatePartialInfo({
      name: form.name,
      lastname: form.lastname,
      email: form.email,
      phoneNumber: form.phoneNumber,
      role: "admin",
    });

    navigation.navigate("ApartmentInfoScreen");
  };

  const sendVerificationCode = async (type) => {
    try {
      setIsLoading(true);
      if (type === "email") {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        setEmailVerified(true);
        Alert.alert("Başarılı", "E-posta doğrulama kodu gönderildi.");
      } else if (type === "phone") {
        const appVerifier = new RecaptchaVerifier("recaptcha-container", {
          size: "invisible",
        }, auth);

        const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
        window.confirmationResult = confirmationResult;
        Alert.alert("Başarılı", "Telefon doğrulama kodu gönderildi.");
      }
    } catch (error) {
      console.error("Doğrulama kodu gönderme hatası:", error);
      Alert.alert("Hata", "Doğrulama kodu gönderilemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (text, index) => {
    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);

    if (text && index < verificationCode.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const verifyCode = async () => {
    const code = verificationCode.join("");
    try {
      setIsLoading(true);
      const confirmationResult = window.confirmationResult;
      await confirmationResult.confirm(code);
      setPhoneVerified(true);
      Alert.alert("Başarılı", "Telefon doğrulandı.");
    } catch (error) {
      console.error("Doğrulama hatası:", error);
      Alert.alert("Hata", "Doğrulama başarısız.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!firstName || !lastName || !email || !phone) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz.");
      return;
    }

    if (!emailVerified || !phoneVerified) {
      Alert.alert("Hata", "Lütfen doğrulama işlemlerini tamamlayınız.");
      return;
    }

    try {
      const response = await axios.post(`${process.env.API_URL}`, {
        firstName,
        lastName,
        email,
        phone,
        role: "admin", // Role ekleniyor
      });

      if (response.status === 200) {
        Alert.alert("Başarılı", "Yönetici bilgileri kaydedildi.");
      }
    } catch (error) {
      console.error("API Hatası:", error);
      Alert.alert("Hata", "Yönetici bilgileri kaydedilemedi.");
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
            label="Ad"
            placeholder="Adınızı girin"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
          />
          <PaperInput
            mode="outlined"
            label="Soyad"
            placeholder="Soyadınızı girin"
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
          />

          <VerificationInput type="email" onSend={() => sendVerificationCode("email")} />
          <VerificationInput type="phone" onSend={() => sendVerificationCode("phone")} />

          {(!emailVerified || !phoneVerified) && (
            <View>
              {isCodeInputVisible && (
                <View style={styles.codeContainer}>
                  <Text style={styles.codeTitle}>Doğrulama Kodu</Text>
                  <View style={styles.codeInputRow}>
                    {verificationCode.map((code, index) => (
                      <TextInput
                        key={index}
                        style={styles.codeInput}
                        value={code}
                        onChangeText={(text) => handleCodeChange(text, index)}
                        keyboardType="numeric"
                        maxLength={1}
                      />
                    ))}
                  </View>
                  <TouchableOpacity onPress={verifyCode} style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Doğrula</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleConfirm}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? "Gönderiliyor..." : "Gönder"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Onayla Butonu */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          disabled={isLoading}
        >
          <Text style={styles.confirmButtonText}>Onayla</Text>
        </TouchableOpacity>
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
    marginTop: 120,
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
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 24,
  },
  verificationInputContainer: {
    flexDirection: "row",
    
    marginBottom: 15,
    justifyContent: "space-between",
    borderWidth: 1,
    width: "100%",
    alignItems: "center",
    
  },
  codeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  codeInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmButton: {
    borderWidth: 1,
    borderColor: colors.primary, // Sayfaya uyumlu border rengi
    padding: 15,
    width:"50%",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 80,
    alignSelf: "center", // Ortalamak için
  },
  confirmButtonText: {
    color: colors.primary, // Sayfaya uyumlu text rengi
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AdminInfoScreen;
