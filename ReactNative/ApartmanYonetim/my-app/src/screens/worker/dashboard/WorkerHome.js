import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WorkerHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Çalışan Ana Sayfası</Text>
      <Text>Buradan görevlerinizi ve iş akışınızı görüntüleyebilirsiniz.</Text>
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
  // ... add more styles as needed ...
});

export default WorkerHomeScreen;
