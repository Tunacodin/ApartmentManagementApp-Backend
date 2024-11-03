import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminReportsScreen = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5', // Background color
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333', // Text color
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Raporlar</Text>
    </View>
  );
};

export default AdminReportsScreen;
