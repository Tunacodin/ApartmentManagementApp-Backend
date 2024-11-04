// src/screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('HelloScreen');  // 'HelloScreen' gibi bir sonraki ekrana yönlendirme
    }, 2000);  // 2 saniye bekle

    return () => clearTimeout(timer);  // Temizlik
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to My App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4B59CD',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
