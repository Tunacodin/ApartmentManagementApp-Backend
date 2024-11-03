import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';

const TenantPaymentScreen = () => {
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

export default TenantPaymentScreen;
