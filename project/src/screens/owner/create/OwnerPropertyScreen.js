import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';

const OwnerPropertyInfoScreen = ({ navigation }) => {
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertySize, setPropertySize] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mülk Bilgileri</Text>
      <TextInput style={styles.input} placeholder="Adres" value={propertyAddress} onChangeText={setPropertyAddress} />
      <TextInput style={styles.input} placeholder="Mülk Alanı (m²)" keyboardType="numeric" value={propertySize} onChangeText={setPropertySize} />
      <Button title="İlerle" onPress={() => navigation.navigate('PaymentDetailsScreen')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 10 }
});

export default OwnerPropertyInfoScreen;
