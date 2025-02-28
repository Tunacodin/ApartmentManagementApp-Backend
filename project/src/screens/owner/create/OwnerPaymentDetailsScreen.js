import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';

const OwnerPaymentDetailsScreen = () => {
  const [iban, setIban] = useState('');
  const [bankName, setBankName] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ödeme Bilgileri</Text>
      <TextInput style={styles.input} placeholder="IBAN" value={iban} onChangeText={setIban} />
      <TextInput style={styles.input} placeholder="Banka Adı" value={bankName} onChangeText={setBankName} />
      <Button title="Tamamla" onPress={() => alert("Kayıt Tamamlandı")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 10 }
});

export default OwnerPaymentDetailsScreen;
