import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const roles = [
  { id: '1', label: 'Yönetici', value: 'admin' },
  { id: '2', label: 'Ev Sahibi', value: 'owner' },
  { id: '3', label: 'Çalışan', value: 'worker' },
  { id: '4', label: 'Güvenlik Görevlisi', value: 'security' },
  { id: '5', label: 'Kiracı', value: 'tenant' },
];

const RoleScreen = ({ navigation }) => {
  const selectRole = (role) => {
    if (role === 'admin') {
      navigation.navigate('LoginScreen', { role }); // Yönetici rolü için AdminStack'e git
    } else {
      navigation.navigate('LoginScreen', { role });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rol Seçimi</Text>
      {roles.map((role) => (
        <TouchableOpacity key={role.id} style={styles.button} onPress={() => selectRole(role.value)}>
          <Text style={styles.buttonText}>{role.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: '#4B59CD', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, width: '80%' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default RoleScreen;
