// src/navigation/TenantNavigator.js
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text, Animated, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../config/apiConfig';

// Import screens
import DashboardScreen from '../screens/tenant/dashboard/DashboardScreen';
import ActivitiesScreen from '../screens/tenant/activities/ActivitiesScreen';
import ProfileScreen from '../screens/tenant/profile/ProfileScreen';
import PaymentsScreen from '../screens/tenant/dashboard/PaymentsScreen';

const Tab = createBottomTabNavigator();

// Modern color palette
const colors = {
  primary: Colors.primary,
  secondary: Colors.secondary,
  background: 'rgba(255, 255, 255, 0.9)',
  surface: 'rgba(255, 255, 255, 0.95)',
  text: '#1E293B',
  textSecondary: '#64748B',
  active: 'rgba(255, 255, 255, 0.95)',
  inactive: '#94A3B8',
  gradientStart: Colors.primary,
  gradientEnd: Colors.secondary,
  fabActive: '#EC4899',
  fabInactive: '#94A3B8',
  fabBackground: 'rgba(255, 255, 255, 0.95)',
  menuBackground: 'rgba(255, 255, 255, 0.98)',
  navActive: 'rgba(255, 255, 255, 0.95)',
  navInactive: '#94A3B8',
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={50} tint="light" style={styles.blurView}>
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.tabBar}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name;

              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              let iconName;
              switch (route.name) {
                case 'Dashboard':
                  iconName = isFocused ? 'home' : 'home-outline';
                  break;
                case 'Payments':
                  iconName = isFocused ? 'cash' : 'cash-outline';
                  break;
                case 'Activities':
                  iconName = isFocused ? 'time' : 'time-outline';
                  break;
                case 'Profile':
                  iconName = isFocused ? 'person' : 'person-outline';
                  break;
                default:
                  iconName = 'ellipse';
              }

              return (
                <Pressable
                  key={index}
                  onPress={onPress}
                  style={[
                    styles.tabButton,
                    isFocused && styles.tabButtonActive
                  ]}
                >
                  <Ionicons
                    name={iconName}
                    size={28}
                    color={isFocused ? colors.active : colors.inactive}
                    style={styles.tabIcon}
                  />
                  <Text 
                    numberOfLines={1} 
                    style={[
                      styles.tabLabelText,
                      { color: isFocused ? colors.active : colors.inactive }
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const TenantNavigator = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      // Token'ı temizle
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('userRole');
      
      // API token'ını temizle
      setAuthToken(null);
      
      // RoleScreen'e yönlendir
      navigation.reset({
        index: 0,
        routes: [{ name: 'RoleScreen' }],
      });
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        headerTitle: () => (
          <Text style={styles.headerTitle}>EVIN</Text>
        ),
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: "#0F172A",
        },
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'AnaSayfa',
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          title: 'Ödemeler',
        }}
      />
      <Tab.Screen
        name="Activities"
        component={ActivitiesScreen}
        options={{
          title: 'Aktiviteler',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  blurView: {
    width: '92%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 3,
  },
  tabButtonActive: {
    backgroundColor: 'transparent',
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabelText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#FFFFFF",
    letterSpacing: 2,
    fontFamily: "Lato-Bold",
  },
});

export default TenantNavigator;
