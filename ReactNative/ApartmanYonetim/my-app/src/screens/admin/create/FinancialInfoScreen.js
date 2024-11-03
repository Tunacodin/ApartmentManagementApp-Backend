import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const FinancialInfoScreen = ({ navigation }) => {
  const [iban, setIban] = useState('');
  const [taxId, setTaxId] = useState('');

  const handleFinish = () => {
    // Create account logic here
    navigation.navigate('AdminDashboard');
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
    button: {
      backgroundColor: '#007BFF',
      padding: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
    },
    errorText: {
      color: 'red',
      marginTop: 10,
    },
  });

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
