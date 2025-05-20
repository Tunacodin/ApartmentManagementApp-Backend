import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';

const SecurityInfoScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Güvenlik Görevlisi Bilgileri</Text>
      <TextInput style={styles.input} placeholder="Ad Soyad" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Telefon Numarası" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <Button title="İlerle" onPress={() => navigation.navigate('ShiftInfoScreen')} />
    </View>
  );
};

export default SecurityInfoScreen;
