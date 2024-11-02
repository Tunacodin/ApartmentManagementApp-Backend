import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView, FlatList } from 'react-native';

import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import AddApartmentScreen from '../register/AddApartmentScreen';

import 'react-native-get-random-values'
const CreateAccountScreen = () => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [department, setDepartment] = useState('');
  const [apartments, setApartments] = useState([]);
  const [location, setLocation] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
  });

  const route = useRoute();
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.newApartment) {
        const newApartment = route.params.newApartment;
        setApartments([...apartments, newApartment]);
        navigation.setParams({ newApartment: null });
      }
    }, [navigation, apartments, route.params])
  );

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreateAccount = () => {
    if (!validateEmail(email)) {
      Alert.alert('Geçersiz E-posta', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    console.log('Account Created:', { fullName, phoneNumber, email, department, apartments, location });
    Alert.alert('Başarılı', 'Hesap başarıyla oluşturuldu!');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true}>
        <Text style={styles.title}>Yönetici Hesabı Oluştur</Text>

        {/* Kişisel Bilgiler */}
        <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
        <TextInput style={styles.input} placeholder="Ad ve Soyad" value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="Telefon Numarası" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Şifre" value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={styles.input} placeholder="Güvenlik Sorusu Cevabı" value={securityAnswer} onChangeText={setSecurityAnswer} />

        {/* Yetkilendirme Bilgileri */}
        <Text style={styles.sectionTitle}>Yetkilendirme Bilgileri</Text>
        <TextInput style={styles.input} placeholder="Departman/Ofis Lokasyonu" value={department} onChangeText={setDepartment} />

        {/* Apartman Bilgileri */}
        <Text style={styles.sectionTitle}>Apartman Bilgileri</Text>
        <FlatList
          data={apartments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.apartmentItem}>
              <Text style={styles.apartmentText}>{item.name} - {item.units} Daire</Text>
            </View>
          )}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddApartmentScreen')}>
          <Text style={styles.addButtonText}>Apartman Ekle</Text>
        </TouchableOpacity>

    
        {/* Hesap Oluştur Butonu */}
        <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
          <Text style={styles.buttonText}>Hesap Oluştur</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Stiller
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContainer: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#4B59CD', marginBottom: 10, marginTop: 20 },
  input: { width: '100%', height: 50, backgroundColor: '#f1f1f1', borderRadius: 8, paddingHorizontal: 15, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  addButton: { backgroundColor: '#4B59CD', padding: 10, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  addButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  apartmentItem: { padding: 10, backgroundColor: '#E8E8E8', borderRadius: 8, marginVertical: 5 },
  apartmentText: { fontSize: 16, color: '#333' },
  map: { width: '100%', height: 200, borderRadius: 10, marginTop: 10, marginBottom: 10 },
  coordinates: { fontSize: 14, color: '#4B59CD', textAlign: 'center', marginBottom: 15 },
  button: { backgroundColor: '#4B59CD', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default CreateAccountScreen;
