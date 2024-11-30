import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { TextInput as PaperInput, Button } from 'react-native-paper';
import colors from '../../../styles/colors';
import animate from '../../../assets/json/animInformation.json';

const AdminInfoScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [isEmailCodeVisible, setIsEmailCodeVisible] = useState(false);
  const [isPhoneCodeVisible, setIsPhoneCodeVisible] = useState(false);

  const handleSendEmailCode = () => {
    setIsEmailCodeVisible(true);
  };

  const handleSendPhoneCode = () => {
    setIsPhoneCodeVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Animasyon */}
      <LottieView
        source={animate}
        autoPlay
        loop
        style={styles.animation}
      />

      {/* Form Container */}
      <View style={styles.formContainer}>
        {/* Başlık */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Yönetici Bilgileri</Text>
        </View>

        {/* Ad Soyad Input */}
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

        {/* E-posta Input */}
        <View style={styles.inputWithButton}>
          <PaperInput
            mode="outlined"
            label="E-posta"
            placeholder="E-posta adresinizi girin"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, { flex: 1 }]}
            outlineColor={colors.darkGray}
            activeOutlineColor={colors.primary}
          />
          <Button
            mode="outlined"
            onPress={handleSendEmailCode}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Kod Gönder
          </Button>
        </View>

        {/* E-posta Onay Kodu */}
        {isEmailCodeVisible && (
          <PaperInput
            mode="outlined"
            label="E-posta Onay Kodu"
            placeholder="Onay kodunu girin"
            value={emailCode}
            onChangeText={setEmailCode}
            style={styles.input}
            outlineColor={colors.darkGray}
            activeOutlineColor={colors.primary}
          />
        )}

        {/* Telefon Input */}
        <View style={styles.inputWithButton}>
          <PaperInput
            mode="outlined"
            label="Telefon Numarası"
            placeholder="Telefon numaranızı girin"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={[styles.input, { flex: 1 }]}
            outlineColor={colors.darkGray}
            activeOutlineColor={colors.primary}
          />
          <Button
            mode="outlined"
            onPress={handleSendPhoneCode}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Kod Gönder
          </Button>
        </View>

        {/* Telefon Onay Kodu */}
        {isPhoneCodeVisible && (
          <PaperInput
            mode="outlined"
            label="Telefon Onay Kodu"
            placeholder="Onay kodunu girin"
            value={phoneCode}
            onChangeText={setPhoneCode}
            style={styles.input}
            outlineColor={colors.darkGray}
            activeOutlineColor={colors.primary}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  animation: {
    width: 150,
    height: 150,
    position: 'relative',
  },
  titleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: colors.primary,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  button: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    width:10,
    height: 40,
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 12,
    color: colors.black,
  },
  formContainer: {
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginTop: 10,
  },
});

export default AdminInfoScreen;
