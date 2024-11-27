import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../../styles/colors';

const roles = [
  { id: '1', label: 'Yönetici', value: 'admin', icon: 'user-shield' },
  { id: '2', label: 'Ev Sahibi', value: 'owner', icon: 'home' },
  { id: '3', label: 'Çalışan', value: 'worker', icon: 'briefcase' },
  { id: '4', label: 'Güvenlik Görevlisi', value: 'security', icon: 'shield-alt' },
  { id: '5', label: 'Kiracı', value: 'tenant', icon: 'user' },
];

const RoleScreen = ({ navigation }) => {
  const selectRole = (role) => {
    navigation.navigate('LoginScreen', { role });
  };

  const renderRoleItem = ({ item }) => (
    <TouchableOpacity style={styles.roleButton} onPress={() => selectRole(item.value)}>
      <Icon name={item.icon} size={30} color="#000" />
      <Text style={styles.roleText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>Rol Seçimi</Text>
        <FlatList
          data={roles}
          renderItem={renderRoleItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.flatListContainer}
          scrollEnabled={false}
          horizontal={false}
          
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:colors.white,
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
    alignItems: 'center',
    
  },
  roleButton: {
    borderColor: '#4B59CD',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 10,
    width: 150,
    height: 150,
  },
  roleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
});

export default RoleScreen;