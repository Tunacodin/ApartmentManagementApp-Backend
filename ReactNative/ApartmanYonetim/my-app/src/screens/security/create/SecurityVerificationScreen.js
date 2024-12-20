import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';

const SecurityVerificationScreen = () => {
  const [idNumber, setIdNumber] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kimlik Doğrulama</Text>
      <TextInput style={styles.input} placeholder="Kimlik Numarası" keyboardType="numeric" value={idNumber} onChangeText={setIdNumber} />
      <Button title="Tamamla" onPress={() => alert("Kayıt Tamamlandı")} />
    </View>
  );
};

export default SecurityVerificationScreen;
