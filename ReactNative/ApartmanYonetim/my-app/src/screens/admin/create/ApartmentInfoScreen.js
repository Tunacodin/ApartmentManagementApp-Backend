import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const ApartmentInfoScreen = forwardRef((props, ref) => {
  const [apartmentName, setApartmentName] = useState('');
  const [address, setAddress] = useState('');

  useImperativeHandle(ref, () => ({
    validate() {
      if (!apartmentName.trim() || !address.trim()) {
        alert('Apartman adı ve adres boş bırakılamaz!');
        return false;
      }
      return true;
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apartman Bilgileri</Text>
      <TextInput
        style={styles.input}
        placeholder="Apartman Adı"
        value={apartmentName}
        onChangeText={setApartmentName}
      />
      <TextInput
        style={styles.input}
        placeholder="Adres"
        value={address}
        onChangeText={setAddress}
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

export default ApartmentInfoScreen;
