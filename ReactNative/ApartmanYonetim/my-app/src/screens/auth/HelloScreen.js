// src/screens/WelcomeScreen.js
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontFamily from '../../constants/FontFamily';

export default function HelloScreen({ navigation, route }) {
  const message = route.params?.message;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Our App!</Text>
      <Text style={styles.message}>
        {message || 'Discover new features and make the most out of your experience with us!'}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9c3',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
 
  },
  message: {
    fontSize: 18,
    color: '#4b5563',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: FontFamily.prompt.regular,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: FontFamily.playwrite.regular,
  },
});
