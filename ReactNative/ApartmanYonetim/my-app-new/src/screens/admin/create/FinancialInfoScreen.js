import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import { TextInput as PaperInput } from "react-native-paper";
import { MaterialIcons } from "react-native-vector-icons";
import { Colors, Gradients } from '../../../constants/Colors';
import Fonts from '../../../constants/Fonts';
import LottieView from "lottie-react-native";
import animate from "../../../assets/json/animFinance.json";
import { LinearGradient } from 'expo-linear-gradient';

const FinancialInfoScreen = ({ navigation }) => {
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expireMonth, setExpireMonth] = useState("");
  const [expireYear, setExpireYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [email, setEmail] = useState("");

  const formatCardNumber = (text) => {
    const numbers = text.replace(/\D/g, '');
    const formatted = numbers.match(/.{1,4}/g)?.join(' ') || numbers;
    return formatted.substr(0, 19);
  };

  const handleComplete = () => {
    Alert.alert(
      "Kayıt Tamamlanıyor",
      "Kayıt işleminiz başarıyla tamamlandı. Giriş ekranına yönlendirileceksiniz.",
      [
        {
          text: "Tamam",
          onPress: () => navigation.navigate('LoginScreen', { role: 'admin' })
        }
      ]
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Gradients.indigo[0]} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <LinearGradient
            colors={Gradients.indigo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={[styles.animationContainer, { height: 120, width: 120 }]}>
                <LottieView 
                  source={animate} 
                  autoPlay 
                  loop 
                  style={styles.animation}
                />
              </View>
              <View style={styles.headerTextContainer}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="credit-card" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.headerTitle}>Finansal Bilgiler</Text>
                <Text style={styles.headerSubtitle}>Ödeme bilgilerinizi girin</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.formContent}>
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

            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="person" size={20} color={Colors.primary} />
                </View>
                <PaperInput
                  mode="outlined"
                  label="Kart Sahibi"
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  style={styles.input}
                  outlineColor="#E2E8F0"
                  activeOutlineColor={Colors.primary}
                  theme={{ colors: { background: '#F8FAFC' }}}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="credit-card" size={20} color={Colors.primary} />
                </View>
                <PaperInput
                  mode="outlined"
                  label="Kart Numarası"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  style={styles.input}
                  outlineColor="#E2E8F0"
                  activeOutlineColor={Colors.primary}
                  theme={{ colors: { background: '#F8FAFC' }}}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <View style={styles.iconWrapper}>
                    <MaterialIcons name="date-range" size={20} color={Colors.primary} />
                  </View>
                  <PaperInput
                    mode="outlined"
                    label="Son Kullanma Ay"
                    value={expireMonth}
                    onChangeText={setExpireMonth}
                    keyboardType="numeric"
                    maxLength={2}
                    style={styles.input}
                    outlineColor="#E2E8F0"
                    activeOutlineColor={Colors.primary}
                    theme={{ colors: { background: '#F8FAFC' }}}
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
                    outlineColor="#E2E8F0"
                    activeOutlineColor={Colors.primary}
                    theme={{ colors: { background: '#F8FAFC' }}}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="lock" size={20} color={Colors.primary} />
                </View>
                <PaperInput
                  mode="outlined"
                  label="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                  style={styles.input}
                  outlineColor="#E2E8F0"
                  activeOutlineColor={Colors.primary}
                  theme={{ colors: { background: '#F8FAFC' }}}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons name="email" size={20} color={Colors.primary} />
                </View>
                <PaperInput
                  mode="outlined"
                  label="E-posta"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  outlineColor="#E2E8F0"
                  activeOutlineColor={Colors.primary}
                  theme={{ colors: { background: '#F8FAFC' }}}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: Colors.success }]}
                onPress={handleComplete}
              >
                <Text style={styles.submitButtonText}>
                  Kayıt İşlemini Tamamla
                </Text>
                <MaterialIcons name="check-circle" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>

              <View style={styles.navigationButtons}>
                <TouchableOpacity
                  style={[styles.submitButton, { flex: 1, marginRight: 8 }]}
                  onPress={() => navigation.navigate('ApartmentInfo')}
                >
                  <Text style={styles.submitButtonText}>
                    Apartman
                  </Text>
                  <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitButton, { flex: 1, marginLeft: 8, backgroundColor: '#4F46E5' }]}
                  onPress={() => navigation.navigate('AdminInfo')}
                >
                  <Text style={styles.submitButtonText}>
                    Yönetici
                  </Text>
                  <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  animationContainer: {
    width: 140,
    height: 140,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 70,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 100,
    height: 100,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.urbanist.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContent: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  cardPreview: {
    height: 200,
    marginBottom: 24,
  },
  cardFront: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cardType: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 40,
    fontFamily: Fonts.urbanist.medium,
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    letterSpacing: 2,
    marginBottom: 20,
    fontFamily: Fonts.urbanist.bold,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    marginBottom: 4,
    fontFamily: Fonts.urbanist.medium,
  },
  cardHolder: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
  },
  cardExpiry: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
  },
  inputWrapper: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF5FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    fontSize: 14,
    fontFamily: Fonts.urbanist.medium,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 10,
    gap: 12,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.urbanist.bold,
  },
});

export default FinancialInfoScreen;