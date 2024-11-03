import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const ApartmentInfoScreen = ({ navigation }) => {
  const [apartmentName, setApartmentName] = useState('');

  const handleNext = () => {
    navigation.navigate('FinancialInfoScreen', { apartmentName });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apartman Bilgileri</Text>
      <TextInput style={styles.input} placeholder="Apartman Adı" value={apartmentName} onChangeText={setApartmentName} />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>İleri</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ApartmentInfoScreen;
