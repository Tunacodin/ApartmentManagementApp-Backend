import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import AdminInfoScreen from '../screens/admin/create/AdminInfoScreen';
import AuthorizationInfoScreen from '../screens/admin/create/AuthorizationInfoScreen';
import ApartmentInfoScreen from '../screens/admin/create/ApartmentInfoScreen';
import FinancialInfoScreen from '../screens/admin/create/FinancialInfoScreen';

const screens = [
  { name: 'AdminInfoScreen', component: AdminInfoScreen },

  { name: 'ApartmentInfoScreen', component: ApartmentInfoScreen },
  { name: 'FinancialInfoScreen', component: FinancialInfoScreen },
];

export default function AdminNavigationWrapper({ currentStep }) {
  console.log('Current Step:', currentStep);
  console.log('Screens:', screens);

  const CurrentScreen = (currentStep >= 0 && currentStep < screens.length) ? screens[currentStep].component : null;

  return (
    <View style={styles.container}>
      {CurrentScreen ? (
        <CurrentScreen />
      ) : (
        <View style={styles.errorContainer}>
          <Text>Geçerli bir ekran bulunamadı.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
