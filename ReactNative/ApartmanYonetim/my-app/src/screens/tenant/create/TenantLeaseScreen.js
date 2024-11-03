import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';

const TenantLeaseInfoScreen = ({ navigation }) => {
  const [leaseTerm, setLeaseTerm] = useState('');
  const [rentAmount, setRentAmount] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kira Bilgileri</Text>
      <TextInput style={styles.input} placeholder="Kira Süresi" value={leaseTerm} onChangeText={setLeaseTerm} />
      <TextInput style={styles.input} placeholder="Kira Tutarı" keyboardType="numeric" value={rentAmount} onChangeText={setRentAmount} />
      <Button title="İlerle" onPress={() => navigation.navigate('PaymentInfoScreen')} />
    </View>
  );
};

export default TenantLeaseInfoScreen;
