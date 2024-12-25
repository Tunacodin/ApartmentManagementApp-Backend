import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button } from 'react-native';
import colors from '../../../styles/colors';

const AuthorizationInfoScreen = forwardRef((props, ref) => {
  const [authorizationCode, setAuthorizationCode] = useState('');
  const [email, setEmail] = useState('');

  useImperativeHandle(ref, () => ({
    validate() {
      if (!authorizationCode.trim()) {
        alert('Yetkilendirme kodu boş bırakılamaz!');
        return false;
      }
      if (!email.includes('@')) {
        alert('Geçerli bir e-posta adresi girin!');
        return false;
      }
      return true;
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yetkilendirme Bilgileri</Text>
      <TextInput
        style={styles.input}
        placeholder="Yetkilendirme Kodu"
        value={authorizationCode}
        onChangeText={setAuthorizationCode}
      />
      <TextInput
        style={styles.input}
        placeholder="E-posta Adresi"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Button title="Devam Et" onPress={() => { /* Devam etme işlemi */ }} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: colors.lightGray },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.darkGray,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: colors.white,
  },
});

export default AuthorizationInfoScreen;
