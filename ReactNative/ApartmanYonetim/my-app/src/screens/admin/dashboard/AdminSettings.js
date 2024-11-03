import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminSettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ayarlar</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Background color for the container
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // Text color for the title
  },
});

export default AdminSettingsScreen;
