import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ImageBackground } from 'react-native';
const roles = [
  { id: '1', label: 'Yönetici', value: 'admin' },
  { id: '2', label: 'Ev Sahibi', value: 'owner' },
  { id: '3', label: 'Çalışan', value: 'worker' },
  { id: '4', label: 'Güvenlik Görevlisi', value: 'security' },
  { id: '5', label: 'Kiracı', value: 'tenant' },
];

const RoleScreen = ({ navigation }) => {
  const selectRole = (role) => {
    // Her zaman LoginScreen'e yönlendir ve role parametresini geçir
    navigation.navigate('LoginScreen', { role });
  };

  const renderRoleItem = ({ item }) => (
    <TouchableOpacity style={styles.roleButton} onPress={() => selectRole(item.value)}>
      <Text style={styles.roleText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Rol Seçimi</Text>
        <FlatList
          data={roles}
          renderItem={renderRoleItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.flatListContainer}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  flatListContainer: {
    justifyContent: 'center',
  },
  roleButton: {
    width: 130,
    height: 130,
    backgroundColor: '#4B59CD',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
});

export default RoleScreen;
