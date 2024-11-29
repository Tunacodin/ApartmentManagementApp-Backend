import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const FinancialInfoScreen = forwardRef((props, ref) => {
  const [monthlyFee, setMonthlyFee] = useState('');
  const [budget, setBudget] = useState('');

  useImperativeHandle(ref, () => ({
    validate() {
      if (isNaN(monthlyFee) || isNaN(budget) || !monthlyFee || !budget) {
        alert('Aylık aidat ve bütçe geçerli sayılar olmalıdır!');
        return false;
      }
      return true;
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finansal Bilgiler</Text>
      <TextInput
        style={styles.input}
        placeholder="Aylık Aidat"
        value={monthlyFee}
        onChangeText={setMonthlyFee}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Bütçe"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});

export default FinancialInfoScreen;
