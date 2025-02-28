import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SecurityHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Güvenlik Ana Sayfası</Text>
      <Text>Burada güvenlik görevlerini görüntüleyebilirsiniz.</Text>
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
    marginBottom: 20,
  },
});

export default SecurityHomeScreen;
