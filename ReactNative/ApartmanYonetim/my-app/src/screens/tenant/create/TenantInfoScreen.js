import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';

const TenantInfoScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kiracı Kişisel Bilgiler</Text>
      <TextInput style={styles.input} placeholder="Ad Soyad" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Telefon Numarası" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <Button title="İlerle" onPress={() => navigation.navigate('TenantLeaseScreen')} />
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

export default TenantInfoScreen;
