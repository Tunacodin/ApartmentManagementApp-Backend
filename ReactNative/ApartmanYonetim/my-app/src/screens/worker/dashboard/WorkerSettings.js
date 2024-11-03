import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WorkerSettingsScreen = () => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Çalışan Ayarları</Text>
      <Text>Buradan çalışan ayarlarını yapabilirsiniz.</Text>
    </View>
  );
};

export default WorkerSettingsScreen;
