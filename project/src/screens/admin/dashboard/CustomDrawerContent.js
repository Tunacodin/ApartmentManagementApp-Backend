import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import {
  Avatar,
  Text,
  Drawer,
  useTheme,
  Divider,
  List
} from 'react-native-paper';
import {
  DrawerContentScrollView,
  DrawerItem
} from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomDrawerContent = (props) => {
  const theme = useTheme();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    // Tema değiştirme fonksiyonu buraya eklenecek
  };

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Çıkış yapmak istediğinizden emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Çıkış Yap",
          onPress: () => {
            // Çıkış işlemleri buraya eklenecek
            console.log("Çıkış yapıldı");
          }
        }
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerContent}>
        {/* Profil Bölümü */}
        <View style={styles.userInfoSection}>
          <Avatar.Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            size={80}
          />
          <Text style={styles.title}>John Doe</Text>
          <Text style={styles.caption}>Site Yöneticisi</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Menü Öğeleri */}
        <Drawer.Section>
          <DrawerItem
            icon={({ color, size }) => (
              <MaterialCommunityIcons
                name="home-outline"
                color={color}
                size={size}
              />
            )}
            label="Ana Sayfa"
            onPress={() => props.navigation.navigate('Home')}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <MaterialCommunityIcons
                name="account-outline"
                color={color}
                size={size}
              />
            )}
            label="Profil"
            onPress={() => props.navigation.navigate('Profile')}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <MaterialCommunityIcons
                name="chart-bar"
                color={color}
                size={size}
              />
            )}
            label="Raporlar"
            onPress={() => props.navigation.navigate('Reports')}
          />
        </Drawer.Section>

        <Divider style={styles.divider} />

        {/* Ayarlar Bölümü */}
        <Drawer.Section title="Tercihler">
          <View style={styles.preference}>
            <Text>Karanlık Tema</Text>
            <Switch
              value={isDarkTheme}
              onValueChange={toggleTheme}
              color={theme.colors.primary}
            />
          </View>
          <DrawerItem
            icon={({ color, size }) => (
              <MaterialCommunityIcons
                name="bell-outline"
                color={color}
                size={size}
              />
            )}
            label="Bildirim Ayarları"
            onPress={() => {/* Bildirim ayarları navigasyonu */}}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <MaterialCommunityIcons
                name="translate"
                color={color}
                size={size}
              />
            )}
            label="Dil Seçimi"
            onPress={() => {/* Dil seçimi navigasyonu */}}
          />
        </Drawer.Section>

        <Divider style={styles.divider} />

        {/* Alt Bölüm */}
        <Drawer.Section>
          <DrawerItem
            icon={({ color, size }) => (
              <MaterialCommunityIcons
                name="help-circle-outline"
                color={color}
                size={size}
              />
            )}
            label="Yardım & Destek"
            onPress={() => {/* Yardım sayfası navigasyonu */}}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <MaterialCommunityIcons
                name="information-outline"
                color={color}
                size={size}
              />
            )}
            label="Hakkında"
            onPress={() => {/* Hakkında sayfası navigasyonu */}}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <MaterialCommunityIcons
                name="logout"
                color={theme.colors.error}
                size={size}
              />
            )}
            label="Çıkış Yap"
            labelStyle={{ color: theme.colors.error }}
            onPress={handleLogout}
          />
        </Drawer.Section>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    paddingVertical: 20,
  },
  title: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    opacity: 0.75,
  },
  divider: {
    marginVertical: 8,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

export default CustomDrawerContent; 