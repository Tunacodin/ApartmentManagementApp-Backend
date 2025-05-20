import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';

const SecurityShiftInfoScreen = ({ navigation }) => {
  const [shiftHours, setShiftHours] = useState('');
  const [location, setLocation] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vardiya Bilgileri</Text>
      <TextInput style={styles.input} placeholder="Vardiya Saatleri" value={shiftHours} onChangeText={setShiftHours} />
      <TextInput style={styles.input} placeholder="Görev Yeri" value={location} onChangeText={setLocation} />
      <Button title="İlerle" onPress={() => navigation.navigate('VerificationScreen')} />
    </View>
  );
};

export default SecurityShiftInfoScreen;
