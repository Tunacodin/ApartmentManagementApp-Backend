import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OwnerHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ev Sahibi Ana Sayfası</Text>
      <Text>Burada mülklerinizin genel bilgilerini görüntüleyebilirsiniz.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5', // Example background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  // ... add more styles as needed
});

export default OwnerHomeScreen;
