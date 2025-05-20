import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WorkerTasksScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Görevler</Text>
      <Text>Buradan görevlerinizi görüntüleyebilirsiniz.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default WorkerTasksScreen;
