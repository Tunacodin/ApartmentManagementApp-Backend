import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { TextInput as PaperInput } from "react-native-paper";
import colors from '../../styles/colors';
import LottieView from "lottie-react-native";
import animPassword from '../../assets/json/animPassword.json';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ForgotPasswordScreen = ({ route, navigation }) => {
  const { role } = route.params;
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage('Lütfen e-posta girin.');
      return;
    }

    try {
      setIsLoading(true);
      // API çağrısı kodları aynı kalacak...
      
      Alert.alert('Başarılı!', 'Şifre sıfırlama işlemi için e-postanızı kontrol edin.');
      navigation.goBack();
    } catch (error) {
      setErrorMessage('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

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
            <LottieView source={animPassword} autoPlay loop style={styles.animation} />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>
              {role === 'admin' ? 'Yönetici Şifre Sıfırlama' : 'Kiracı Şifre Sıfırlama'}
            </Text>

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
                onChangeText={(text) => {
                  setEmail(text);
                  setErrorMessage('');
                }}
                style={styles.input}
                outlineColor={colors.darkGray}
                activeOutlineColor={colors.primary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? "Gönderiliyor..." : "Doğrula"}
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
    marginBottom: 30,
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
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;
