import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const AuthorizationInfoScreen = ({ navigation }) => {
  const [department, setDepartment] = useState('');

  const handleNext = () => {
    navigation.navigate('ApartmentInfoScreen', { department });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yetkilendirme Bilgileri</Text>
      <TextInput style={styles.input} placeholder="Departman" value={department} onChangeText={setDepartment} />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>İleri</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthorizationInfoScreen;
