import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../../styles/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const roles = [
  { id: '1', label: 'Yönetici', value: 'admin', icon: 'user-shield' },
  { id: '2', label: 'Ev Sahibi', value: 'owner', icon: 'home' },
  { id: '3', label: 'Personel', value: 'worker', icon: 'briefcase' },
  { id: '4', label: 'Güvenlik Görevlisi', value: 'security', icon: 'shield-alt' },
  { id: '5', label: 'Kiracı', value: 'tenant', icon: 'user' },
];

const RoleScreen = ({ navigation }) => {
  const selectRole = (role) => {
    navigation.navigate('LoginScreen', { role });
  };

  const renderRoleItem = ({ item }) => (
    <TouchableOpacity style={styles.roleButton} onPress={() => selectRole(item.value)}>
      <LinearGradient
        colors={[colors.darkGray, colors.darkGray]}
        style={styles.gradientCircle}
      >
        <Icon name={item.icon} size={30} color={colors.white} />
        <Text style={styles.roleText}>{item.label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>Evin'i kim olarak kullanıyorsun?</Text>
        <FlatList
          data={roles}
          renderItem={renderRoleItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.flatListContainer}
          scrollEnabled={false}
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
    backgroundColor: colors.white,
  },
  overlay: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: colors.darkGray,
  },
  flatListContainer: {
    alignItems: 'center',
  },
  roleButton: {
    margin: 5,
    width: (width / 2) - 30, // Ekran genişliğini 2 sütuna göre ayarla
    alignItems: 'center',
  },
  gradientCircle: {
    width: 150,
    height: 150,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  roleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default RoleScreen;
