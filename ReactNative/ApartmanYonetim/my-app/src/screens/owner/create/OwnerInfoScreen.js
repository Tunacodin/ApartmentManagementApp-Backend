import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';

const OwnerInfoScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ev Sahibi Kişisel Bilgiler</Text>
      <TextInput style={styles.input} placeholder="Ad Soyad" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Telefon Numarası" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <Button title="İlerle" onPress={() => navigation.navigate('PropertyInfoScreen')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 10 }
});

export default OwnerInfoScreen;
