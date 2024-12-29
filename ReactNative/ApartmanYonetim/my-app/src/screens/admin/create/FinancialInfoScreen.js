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
  Alert,
  TouchableOpacity
} from "react-native";
import { TextInput as PaperInput, Button as PaperButton } from "react-native-paper";
import { MaterialIcons } from "react-native-vector-icons";
import colors from "../../../styles/colors";
import axios from "axios";
import { IYZICO_API_CONFIG } from "../../../config/apiConfig";
import LottieView from "lottie-react-native";
import animate from "../../../assets/json/animFinance.json";

const FinancialInfoScreen = forwardRef((props, ref) => {
  const [cardAlias, setCardAlias] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expireMonth, setExpireMonth] = useState("");
  const [expireYear, setExpireYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [showForm, setShowForm] = useState(false);

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
      const cardDetails = {
        cardAlias: cardAlias || "Varsayılan Kart",
        email,
        expireYear: `20${expireYear}`,
        expireMonth: expireMonth,
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolderName: cardHolder,
        externalId: `user-${Date.now()}`,
        locale: "tr",
        conversationId: Date.now().toString()
      };

      const response = await saveCardToIyzipay(cardDetails);
      
      // Kartı listeye ekle
      setCards(prevCards => [...prevCards, {
        ...cardDetails,
        cardNumber: `**** **** **** ${cardNumber.slice(-4)}`, // Güvenlik için son 4 hane
        id: Date.now().toString()
      }]);

      // Formu temizle ve gizle
      resetForm();
      setShowForm(false);
      
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

  // Form resetleme fonksiyonu
  const resetForm = () => {
    setCardAlias("");
    setCardHolder("");
    setCardNumber("");
    setExpireMonth("");
    setExpireYear("");
    setCvv("");
    setEmail("");
  };

  // Kart silme fonksiyonu
  const handleDeleteCard = (index) => {
    Alert.alert(
      "Kartı Sil",
      "Bu kartı silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Sil", 
          style: "destructive",
          onPress: () => {
            setCards(prevCards => prevCards.filter((_, i) => i !== index));
            Alert.alert("Başarılı", "Kart başarıyla silindi.");
          }
        }
      ]
    );
  };

  const handleEditCard = (card) => {
    // Form alanlarını seçilen kart bilgileriyle doldur
    setCardHolder(card.cardHolderName);
    setCardNumber(card.cardNumber);
    setExpireMonth(card.expireMonth);
    setExpireYear(card.expireYear.slice(-2));
    setEmail(card.email);
    
    // Form görünümünü aç
    setShowForm(true);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <LottieView source={animate} autoPlay loop style={styles.animation} />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Hesap Bilgileri</Text>
            </View>
          </View>

          {showForm ? (
            <View style={styles.form}>
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
          ) : (
            <View style={styles.cardsContainer}>
              {cards.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Mevcut Hesaplar</Text>
                  {cards.map((card, index) => (
                    <View key={card.id} style={styles.cardItem}>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardNumberText}>{card.cardNumber}</Text>
                        <Text style={styles.cardHolderText}>{card.cardHolderName}</Text>
                        <Text style={styles.cardExpiryText}>
                          Son Kullanma: {card.expireMonth}/{card.expireYear.slice(-2)}
                        </Text>
                      </View>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          onPress={() => handleEditCard(card)}
                          style={styles.editButton}
                        >
                          <MaterialIcons name="edit" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleDeleteCard(index)}
                          style={styles.deleteButton}
                        >
                          <MaterialIcons name="delete" size={24} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </>
              )}
              {cards.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.noCardText}>
                    Henüz hesap bilgisi eklemediniz
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>

      {!showForm && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowForm(true)}
        >
          <MaterialIcons name="add" size={30} color={colors.white} />
        </TouchableOpacity>
      )}
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
  cardPreview: {
    height: 200,
    perspective: 1000,
    marginBottom: 20,
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
    paddingHorizontal: 16,
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
  titleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
  },
  cardsContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  cardItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardInfo: {
    flex: 1,
  },
  cardNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  cardHolderText: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 2,
  },
  cardExpiryText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: colors.lightRed,
    borderRadius: 8,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCardText: {
    textAlign: 'center',
    fontSize: 18,
    color: colors.gray,
    marginTop: 130,
  },
  animation: {
    width: 250,
    height: 250,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 15,
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 8,
    backgroundColor: colors.lightBlue,
    borderRadius: 8,
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
  },
});

export default FinancialInfoScreen;