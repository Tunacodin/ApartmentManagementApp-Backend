import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SecurityReportsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Raporlar</Text>
      <Text>Buradan güvenlik raporlarını görüntüleyebilirsiniz.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default SecurityReportsScreen;
