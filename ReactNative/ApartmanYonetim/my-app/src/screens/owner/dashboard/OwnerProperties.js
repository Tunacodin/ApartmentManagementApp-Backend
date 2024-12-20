import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OwnerPropertiesScreen = () => {
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
      <Text style={styles.title}>Mülk Yönetimi</Text>
      <Text>Buradan mülklerinizi yönetebilirsiniz.</Text>
    </View>
  );
};

export default OwnerPropertiesScreen;
