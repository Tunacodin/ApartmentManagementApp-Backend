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
      <Button title="İlerle" onPress={() => navigation.navigate('TenantPaymentScreen')} />
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

export default TenantLeaseInfoScreen;
