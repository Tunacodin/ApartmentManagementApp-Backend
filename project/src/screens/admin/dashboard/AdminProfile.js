import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Text, Surface, useTheme, Button, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../../styles/colors';

const { width } = Dimensions.get('window');

const AdminProfile = ({ navigation }) => {
  const theme = useTheme();
  const [userInfo] = useState({
    name: 'John Doe',
    role: 'Site Yöneticisi',
    email: 'john.doe@example.com',
    phone: '+90 555 123 4567',
    location: 'İstanbul, Türkiye',
    joinDate: '01.01.2024',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  });

  const menuItems = [
    {
      icon: 'account-edit',
      title: 'Profili Düzenle',
      onPress: () => navigation.navigate('EditProfile')
    },
    {
      icon: 'shield-account',
      title: 'Hesap Güvenliği',
      onPress: () => navigation.navigate('Security')
    },
    {
      icon: 'bell-ring',
      title: 'Bildirim Ayarları',
      onPress: () => navigation.navigate('Notifications')
    },
    {
      icon: 'palette',
      title: 'Görünüm',
      onPress: () => navigation.navigate('Appearance')
    },
    {
      icon: 'help-circle',
      title: 'Yardım & Destek',
      onPress: () => navigation.navigate('Help')
    }
  ];

  const stats = [
    { title: 'Toplam Bina', value: '12', icon: 'office-building' },
    { title: 'Aktif Daire', value: '156', icon: 'home-city' },
    { title: 'Toplam Sakin', value: '450', icon: 'account-group' }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <Avatar.Image
            source={{ uri: userInfo.avatar }}
            size={100}
            style={styles.avatar}
          />
          <Text style={styles.name}>{userInfo.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{userInfo.role}</Text>
          </View>
        </View>
      </Surface>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <Surface key={index} style={styles.statCard}>
            <MaterialCommunityIcons
              name={stat.icon}
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </Surface>
        ))}
      </View>

      <Surface style={styles.infoCard}>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="email" size={24} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>E-posta</Text>
            <Text style={styles.infoValue}>{userInfo.email}</Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="phone" size={24} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Telefon</Text>
            <Text style={styles.infoValue}>{userInfo.phone}</Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Konum</Text>
            <Text style={styles.infoValue}>{userInfo.location}</Text>
          </View>
        </View>
      </Surface>

      <Surface style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.menuItemText}>{item.title}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.palette.grey[400]}
            />
          </TouchableOpacity>
        ))}
      </Surface>

      <Button
        mode="contained"
        style={styles.logoutButton}
        labelStyle={styles.logoutButtonText}
        icon="logout"
        onPress={() => {/* Çıkış işlemi */}}
      >
        Çıkış Yap
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.palette.background.default,
  },
  header: {
    backgroundColor: colors.palette.primary.main,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    padding: 20,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  avatar: {
    marginBottom: 15,
    borderWidth: 4,
    borderColor: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  roleText: {
    color: 'white',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    width: width / 3.5,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statTitle: {
    fontSize: 12,
    color: colors.palette.text.secondary,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.palette.text.secondary,
  },
  infoValue: {
    fontSize: 16,
    color: colors.palette.text.primary,
  },
  menuCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.palette.grey[200],
  },
  menuItemText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
    backgroundColor: colors.palette.error.main,
  },
  logoutButtonText: {
    fontSize: 16,
  },
});

export default AdminProfile;