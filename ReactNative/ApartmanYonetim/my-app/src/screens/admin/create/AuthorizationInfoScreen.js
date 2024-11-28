import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const AuthorizationInfoScreen = ({ navigation }) => {
  const [department, setDepartment] = useState('');

  const handleNext = () => {
    navigation.navigate('ApartmentInfoScreen', { department });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#f5f5f5', // Background color
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    input: {
      width: '100%',
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 20,
    },
    button: {
      backgroundColor: '#007BFF',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
    },
  });

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
