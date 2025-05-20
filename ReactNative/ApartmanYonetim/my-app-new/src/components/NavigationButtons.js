import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';

export default function NavigationButtons({ currentStep, totalSteps, onNext, onPrevious }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, currentStep === 0 && styles.disabled]}
        onPress={onPrevious}
        disabled={currentStep === 0}
      >
        <Text style={styles.buttonText}>Geri</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          currentStep === totalSteps - 1 && styles.disabled,
        ]}
        onPress={onNext}
        disabled={currentStep === totalSteps - 1}
      >
        <Text style={styles.buttonText}>İleri</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    backgroundColor: colors.lightGray,
  },
});
