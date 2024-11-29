import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const AuthorizationInfoScreen = forwardRef((props, ref) => {
  const [authorizationCode, setAuthorizationCode] = useState('');

  useImperativeHandle(ref, () => ({
    validate() {
      if (!authorizationCode.trim()) {
        alert('Yetkilendirme kodu boş bırakılamaz!');
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
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});

export default AuthorizationInfoScreen;
