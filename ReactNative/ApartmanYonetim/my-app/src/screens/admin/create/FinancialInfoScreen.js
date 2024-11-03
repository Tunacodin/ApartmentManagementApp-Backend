import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const FinancialInfoScreen = ({ navigation }) => {
  const [iban, setIban] = useState('');
  const [taxId, setTaxId] = useState('');

  const handleFinish = () => {
    // Create account logic here
    navigation.navigate('AdminDashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finansal Bilgiler</Text>
      <TextInput style={styles.input} placeholder="IBAN" value={iban} onChangeText={setIban} />
      <TextInput style={styles.input} placeholder="Vergi Numarası" value={taxId} onChangeText={setTaxId} keyboardType="numeric" />
      <TouchableOpacity style={styles.button} onPress={handleFinish}>
        <Text style={styles.buttonText}>Tamamla</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FinancialInfoScreen;
