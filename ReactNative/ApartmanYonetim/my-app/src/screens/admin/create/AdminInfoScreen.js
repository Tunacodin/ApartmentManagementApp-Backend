import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const AdminInfoScreen = forwardRef((props, ref) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  useImperativeHandle(ref, () => ({
    validate() {
      if (!fullName.trim()) {
        alert('Ad Soyad boş bırakılamaz!');
        return false;
      }
      if (!email.includes('@')) {
        alert('Geçersiz email adresi!');
        return false;
      }
      return true;
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yönetici Bilgileri</Text>
      <TextInput
        style={styles.input}
        placeholder="Ad Soyad"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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

export default AdminInfoScreen;
