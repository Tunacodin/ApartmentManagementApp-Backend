import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { TextInput as PaperInput } from "react-native-paper";
import { MaterialIcons } from "react-native-vector-icons";
import LottieView from "lottie-react-native"; // LottieView import edildi
import colors from "../../../styles/colors";
import animate from "../../../assets/json/animFinance.json"; // Animasyon dosyası import edildi

const FinancialInfoScreen = forwardRef((props, ref) => {
  const [bankName, setBankName] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardType, setCardType] = useState("");

  useImperativeHandle(ref, () => ({
    validate() {
      if (!bankName.trim()) {
        alert("Banka adı boş bırakılamaz!");
        return false;
      }
      if (!cardHolder.trim()) {
        alert("Kart sahibi adı boş bırakılamaz!");
        return false;
      }
      if (!cardNumber.trim() || cardNumber.length !== 16) {
        alert("Geçerli bir kart numarası giriniz!");
        return false;
      }
      if (!expirationDate.trim() || !expirationDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
        alert("Geçerli bir son kullanma tarihi giriniz (AA/YY)!");
        return false;
      }
      if (!cvv.trim() || cvv.length !== 3) {
        alert("Geçerli bir CVV giriniz!");
        return false;
      }
      return true;
    },
  }));

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
        >
          {/* Animasyon */}
          <LottieView source={animate} autoPlay loop style={styles.animation} />

          {/* Başlık */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Kart Bilgileri</Text>
          </View>

          {/* Banka Adı Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="account-balance-wallet"
              size={24}
              color={colors.primary}
              style={styles.icon}
            />
            <PaperInput
              mode="outlined"
              label="Banka Adı"
              placeholder="Banka adını girin"
              value={bankName}
              onChangeText={setBankName}
              style={styles.input}
              outlineColor={colors.darkGray}
              activeOutlineColor={colors.primary}
            />
          </View>

          {/* Kart Sahibi Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="credit-card"
              size={24}
              color={colors.primary}
              style={styles.icon}
            />
            <PaperInput
              mode="outlined"
              label="Kart Sahibi"
              placeholder="Kart üzerindeki ismi girin"
              value={cardHolder}
              onChangeText={setCardHolder}
              style={styles.input}
              outlineColor={colors.darkGray}
              activeOutlineColor={colors.primary}
            />
          </View>

          {/* Kart Numarası Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="credit-card"
              size={24}
              color={colors.primary}
              style={styles.icon}
            />
            <PaperInput
              mode="outlined"
              label="Kart Numarası"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              maxLength={16}
              style={styles.input}
              outlineColor={colors.darkGray}
              activeOutlineColor={colors.primary}
            />
          </View>

          {/* Son Kullanma Tarihi Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="date-range"
              size={24}
              color={colors.primary}
              style={styles.icon}
            />
            <PaperInput
              mode="outlined"
              label="Son Kullanma Tarihi"
              placeholder="AA/YY"
              value={expirationDate}
              onChangeText={setExpirationDate}
              maxLength={5}
              style={styles.input}
              outlineColor={colors.darkGray}
              activeOutlineColor={colors.primary}
            />
          </View>

          {/* CVV Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="lock"
              size={24}
              color={colors.primary}
              style={styles.icon}
            />
            <PaperInput
              mode="outlined"
              label="CVV"
              placeholder="123"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
              style={styles.input}
              outlineColor={colors.darkGray}
              activeOutlineColor={colors.primary}
            />
          </View>

          {/* Kart Tipi Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="credit-card"
              size={24}
              color={colors.primary}
              style={styles.icon}
            />
            <PaperInput
              mode="outlined"
              label="Kart Tipi"
              placeholder="Visa/Mastercard/American Express"
              value={cardType}
              onChangeText={setCardType}
              style={styles.input}
              outlineColor={colors.darkGray}
              activeOutlineColor={colors.primary}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  animation: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  titleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginBottom: 20,
  
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
});

export default FinancialInfoScreen;
