import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import LottieView from "lottie-react-native";
import { TextInput as PaperInput } from "react-native-paper";
import { MaterialIcons } from "react-native-vector-icons";
import colors from "../../../styles/colors";
import animate from "../../../assets/json/animInformation.json";

const AdminInfoScreen = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailCode, setEmailCode] = useState(["", "", "", ""]);
  const [phoneCode, setPhoneCode] = useState(["", "", "", ""]);
  const [showEmailCodeInput, setShowEmailCodeInput] = useState(false);
  const [showPhoneCodeInput, setShowPhoneCodeInput] = useState(false);

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
              onPress={() => setShowEmailCodeInput(true)}
            >
              <Text style={styles.buttonText}>Onay Kodu</Text>
            </TouchableOpacity>
          </View>

          {/* E-posta Onay Kodu Input */}
          {showEmailCodeInput && (
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
              onPress={() => setShowPhoneCodeInput(true)}
            >
              <Text style={styles.buttonText}>Onay Kodu</Text>
            </TouchableOpacity>
          </View>

          {/* Telefon Onay Kodu Input */}
          {showPhoneCodeInput && (
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
});

export default AdminInfoScreen;
