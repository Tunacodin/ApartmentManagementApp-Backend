import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from "react-native";
import { TextInput as PaperInput, Button as PaperButton } from "react-native-paper";
import { MaterialIcons } from "react-native-vector-icons";
import LottieView from "lottie-react-native";
import colors from "../../../styles/colors";
import animate from "../../../assets/json/animFinance.json";
import axios from "axios";
import { IYZICO_API_CONFIG } from "../../../config/apiConfig";

const FinancialInfoScreen = forwardRef((props, ref) => {
  const [cardAlias, setCardAlias] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expireMonth, setExpireMonth] = useState("");
  const [expireYear, setExpireYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (text) => {
    // Sadece rakamları al
    const numbers = text.replace(/\D/g, '');
    // 4'lü gruplar halinde formatla
    const formatted = numbers.match(/.{1,4}/g)?.join(' ') || numbers;
    return formatted.substr(0, 19); // Max 16 rakam + 3 boşluk
  };

  const formatExpiryDate = (text) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return `${numbers.substr(0, 2)}/${numbers.substr(2, 2)}`;
    }
    return numbers;
  };

  const handleSaveCard = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const [month, year] = expirationDate.split('/');
      const cardDetails = {
        cardAlias: cardAlias || "Varsayılan Kart",
        email,
        expireYear: `20${year}`,
        expireMonth: month,
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolderName: cardHolder,
        externalId: `user-${Date.now()}`,
        locale: "tr",
        conversationId: Date.now().toString()
      };

      const response = await saveCardToIyzipay(cardDetails);
      Alert.alert("Başarılı", "Kart bilgileri başarıyla kaydedildi.");
    } catch (error) {
      Alert.alert("Hata", error.message || "Kart kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const saveCardToIyzipay = async (cardDetails) => {
    try {
      const response = await axios.post(
        `${IYZICO_API_CONFIG.baseUrl}/cardstorage/card`,
        cardDetails,
        {
          headers: {
            "Authorization": `Basic ${btoa(`${IYZICO_API_CONFIG.apiKey}:${IYZICO_API_CONFIG.secretKey}`)}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Kart Kaydetme Hatası:", error.response?.data || error.message);
      throw error;
    }
  };

  const validateForm = () => {
    if (!cardHolder.trim()) {
      Alert.alert("Hata", "Kart sahibi adı boş bırakılamaz!");
      return false;
    }
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert("Hata", "Geçerli bir kart numarası giriniz!");
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert("Hata", "Geçerli bir e-posta adresi giriniz!");
      return false;
    }
    if (!expireMonth || !expireYear || expireMonth.length !== 2 || expireYear.length !== 2) {
      Alert.alert("Hata", "Geçerli bir son kullanma tarihi giriniz!");
      return false;
    }
    if (!cvv.trim() || cvv.length !== 3) {
      Alert.alert("Hata", "Geçerli bir CVV giriniz!");
      return false;
    }
    return true;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <LottieView source={animate} autoPlay loop style={styles.animation} />
          
          <View style={styles.cardPreview}>
            <View style={styles.cardFront}>
              <Text style={styles.cardType}>CREDIT CARD</Text>
              <Text style={styles.cardNumber}>
                {cardNumber || '•••• •••• •••• ••••'}
              </Text>
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardLabel}>CARD HOLDER</Text>
                  <Text style={styles.cardHolder}>
                    {cardHolder || 'YOUR NAME'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>EXPIRES</Text>
                  <Text style={styles.cardExpiry}>
                    {expireMonth || 'MM'}/{expireYear || 'YY'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={24} color={colors.primary} />
              <PaperInput
                mode="outlined"
                label="Kart Sahibi"
                value={cardHolder}
                onChangeText={setCardHolder}
                style={styles.input}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="credit-card" size={24} color={colors.primary} />
              <PaperInput
                mode="outlined"
                label="Kart Numarası"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <MaterialIcons name="date-range" size={24} color={colors.primary} />
                <PaperInput
                  mode="outlined"
                  label="Son Kullanma Ay"
                  value={expireMonth}
                  onChangeText={setExpireMonth}
                  keyboardType="numeric"
                  maxLength={2}
                  style={styles.input}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <PaperInput
                  mode="outlined"
                  label="Son Kullanma Yıl"
                  value={expireYear}
                  onChangeText={setExpireYear}
                  keyboardType="numeric"
                  maxLength={2}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={24} color={colors.primary} />
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
              <MaterialIcons name="email" size={24} color={colors.primary} />
              <PaperInput
                mode="outlined"
                label="E-posta"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <PaperButton
              mode="contained"
              onPress={handleSaveCard}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Kartı Kaydet
            </PaperButton>
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
    padding: 20,
  },
  animation: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
  cardPreview: {
    marginVertical: 20,
    height: 200,
    perspective: 1000,
  },
  cardFront: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    height: '100%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cardType: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 40,
  },
  cardNumber: {
    color: colors.white,
    fontSize: 22,
    letterSpacing: 2,
    marginBottom: 20,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: colors.white,
    fontSize: 10,
    marginBottom: 4,
  },
  cardHolder: {
    color: colors.white,
    fontSize: 16,
  },
  cardExpiry: {
    color: colors.white,
    fontSize: 16,
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: colors.primary,
  },
});

export default FinancialInfoScreen;
