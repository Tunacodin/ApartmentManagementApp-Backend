import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const FinancialInfoScreen = ({ navigation }) => {
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleFinish = () => {
    // Account creation logic here
    navigation.navigate('TenantDashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ödeme Bilgileri</Text>
      <TextInput style={styles.input} placeholder="Ödeme Yöntemi" value={paymentMethod} onChangeText={setPaymentMethod} />
      <TouchableOpacity style={styles.button} onPress={handleFinish}>
        <Text style={styles.buttonText}>Tamamla</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FinancialInfoScreen;
