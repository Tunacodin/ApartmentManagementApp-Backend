import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SecuritySettingsScreen = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#f5f5f5', // Background color
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Güvenlik Görevlisi Ayarları</Text>
      <Text>Buradan güvenlik görevlisi ayarlarını yapabilirsiniz.</Text>
    </View>
  );
};

export default SecuritySettingsScreen;
