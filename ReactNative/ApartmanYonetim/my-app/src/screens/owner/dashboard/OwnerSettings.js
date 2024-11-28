import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OwnerSettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ev Sahibi Ayarları</Text>
      <Text>Buradan ev sahibi ayarlarını yapabilirsiniz.</Text>
    </View>
  );
};

export default OwnerSettingsScreen;
