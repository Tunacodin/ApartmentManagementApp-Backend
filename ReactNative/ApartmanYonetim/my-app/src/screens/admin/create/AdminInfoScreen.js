import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const AdminInfoScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const handleNext = () => {
    navigation.navigate('AuthorizationInfoScreen', { fullName, email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yönetici Kişisel Bilgiler</Text>
      <TextInput style={styles.input} placeholder="Ad Soyad" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>İleri</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 15 },
  button: { backgroundColor: '#4B59CD', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 18 },
});

export default AdminInfoScreen;
