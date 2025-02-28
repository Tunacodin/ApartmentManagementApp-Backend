import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';

const TenantPaymentScreen = ({ navigation }) => {
  const [iban, setIban] = useState('');
  const [bankName, setBankName] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ödeme Bilgileri</Text>
      <TextInput style={styles.input} placeholder="IBAN" value={iban} onChangeText={setIban} />
      <TextInput style={styles.input} placeholder="Banka Adı" value={bankName} onChangeText={setBankName} />
      <Button title="Tamamla" onPress={() => navigation.navigate('TenantDashboard')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

export default TenantPaymentScreen;
