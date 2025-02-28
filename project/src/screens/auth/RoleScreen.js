import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../../styles/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const roles = [
  { id: '1', label: 'Yönetici', value: 'admin', icon: 'user-shield', active: true },
  { id: '2', label: 'Kiracı', value: 'tenant', icon: 'user', active: true },
  { id: '3', label: 'Ev Sahibi', value: 'owner', icon: 'home', active: false },
  { id: '4', label: 'Personel', value: 'worker', icon: 'briefcase', active: false },
];

const RoleScreen = ({ navigation }) => {
  const selectRole = (role, active) => {
    if (active) {
      navigation.navigate('LoginScreen', { role });
    }
  };

  const renderRoleItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.roleButton, !item.active && styles.inactiveButton]} 
      onPress={() => selectRole(item.value, item.active)}
      disabled={!item.active}
    >
      <LinearGradient
        colors={item.active ? [colors.primary, colors.primary] : ['#A0A0A0', '#808080']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        <View style={[styles.iconContainer, !item.active && styles.inactiveIconContainer]}>
          <Icon name={item.icon} size={32} color={item.active ? colors.white : '#D0D0D0'} />
        </View>
        <Text style={[styles.roleText, !item.active && styles.inactiveText]}>{item.label}</Text>
        {!item.active && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Yakında</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>Evin'i kim olarak{'\n'}kullanıyorsun?</Text>
        <FlatList
          data={roles}
          renderItem={renderRoleItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.flatListContainer}
          scrollEnabled={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.white,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 40,
    marginTop: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 40,
    color: colors.darkGray,
    lineHeight: 40,
  },
  flatListContainer: {
    paddingVertical: 10,
  },
  roleButton: {
    margin: 8,
    width: (width / 2) - 24,
  },
  gradientCard: {
    height: 160,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  inactiveButton: {
    opacity: 0.95,
  },
  inactiveIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  inactiveText: {
    color: '#D0D0D0',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#D0D0D0',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RoleScreen;
