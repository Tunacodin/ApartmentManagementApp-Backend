import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yönetici Ana Sayfa</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Example background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // Example text color
  },
});

export default AdminHomeScreen;
