import React, { forwardRef, useImperativeHandle, useState } from "react";
import { View, StyleSheet, Text, Alert } from "react-native";
import { TextInput as PaperInput, Button as PaperButton } from "react-native-paper";
import { MaterialIcons } from "react-native-vector-icons";
import LottieView from "lottie-react-native";
import colors from "../../../styles/colors";
import animate from "../../../assets/json/animFinance.json";
import axios from "axios";

const API_URL = "http://172.16.1.155:5001/api/CardInfo";

const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const FinancialInfoScreen = forwardRef((props, ref) => {
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [bankName, setBankName] = useState("");
  const [cardType, setCardType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    if (!cardHolder.trim()) {
      Alert.alert("Hata", "Kart sahibi adı boş bırakılamaz!");
      return false;
    }
    if (!cardNumber.trim() || cardNumber.length !== 16) {
      Alert.alert("Hata", "Geçerli bir kart numarası giriniz!");
      return false;
    }
    if (!expirationDate.trim() || !expirationDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      Alert.alert("Hata", "Geçerli bir son kullanma tarihi giriniz (AA/YY)!");
      return false;
    }
    if (!cvv.trim() || cvv.length !== 3) {
      Alert.alert("Hata", "Geçerli bir CVV numarası giriniz!");
      return false;
    }
    if (!bankName.trim()) {
      Alert.alert("Hata", "Banka adı boş bırakılamaz!");
      return false;
    }
    if (!cardType.trim()) {
      Alert.alert("Hata", "Kart tipi boş bırakılamaz!");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const cardData = {
        cardHolder,
        cardNumber,
        expirationDate,
        cvv,
        bankName,
        cardType,
        createdAt: new Date().toISOString()
      };

      const response = await api.post(API_URL, cardData);

      if (response.status === 200) {
        setIsSubmitted(true);
        Alert.alert(
          "Başarılı",
          "Kart bilgileri kaydedildi",
          [
            {
              text: "Tamam",
              onPress: () => {
                setCardHolder("");
                setCardNumber("");
                setExpirationDate("");
                setCvv("");
                setBankName("");
                setCardType("");
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("API Hatası:", error);
      Alert.alert("Hata", "Kart bilgileri kaydedilemedi");
      setIsSubmitted(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LottieView source={animate} autoPlay loop style={styles.animation} />

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Kart Bilgileri</Text>
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="person" size={24} color={colors.primary} style={styles.icon} />
        <PaperInput
          mode="outlined"
          label="Kart Sahibi"
          value={cardHolder}
          onChangeText={setCardHolder}
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="credit-card" size={24} color={colors.primary} style={styles.icon} />
        <PaperInput
          mode="outlined"
          label="Kart Numarası"
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
          maxLength={16}
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="date-range" size={24} color={colors.primary} style={styles.icon} />
        <PaperInput
          mode="outlined"
          label="Son Kullanma Tarihi (AA/YY)"
          value={expirationDate}
          onChangeText={setExpirationDate}
          placeholder="MM/YY"
          maxLength={5}
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="security" size={24} color={colors.primary} style={styles.icon} />
        <PaperInput
          mode="outlined"
          label="CVV"
          value={cvv}
          onChangeText={setCvv}
          keyboardType="numeric"
          maxLength={3}
          secureTextEntry
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="account-balance" size={24} color={colors.primary} style={styles.icon} />
        <PaperInput
          mode="outlined"
          label="Banka Adı"
          value={bankName}
          onChangeText={setBankName}
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="credit-card" size={24} color={colors.primary} style={styles.icon} />
        <PaperInput
          mode="outlined"
          label="Kart Tipi"
          value={cardType}
          onChangeText={setCardType}
          style={styles.input}
        />
      </View>

      {isSubmitted ? (
        <View style={styles.successIconContainer}>
          <MaterialIcons name="check-circle" size={50} color={colors.success} />
        </View>
      ) : (
        <PaperButton
          mode="contained"
          onPress={handleSubmit}
          disabled={isLoading}
          loading={isLoading}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          labelStyle={styles.submitButtonLabel}
        >
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </PaperButton>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  animation: {
    width: 200,
    height: 200,
    alignSelf: "center",
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
  submitButton: {
    marginTop: 20,
    borderRadius: 8,
    height: 50,
    width: '100%',
  },
  submitButtonContent: {
    height: 50,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default FinancialInfoScreen;
