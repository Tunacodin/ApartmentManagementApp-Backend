import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ProgressIndicator({ steps, currentStep }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: steps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.step,
            currentStep === index
              ? [styles.activeStep, styles.activeSize]
              : [styles.inactiveStep, styles.inactiveSize],
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  step: {
    marginHorizontal: 8,
    borderRadius: 20,
  },
  activeStep: {
    backgroundColor: '#4B59CD',
  },
  inactiveStep: {
    backgroundColor: '#d3d3d3',
  },
  activeSize: {
    width: 16,
    height: 16,
  },
  inactiveSize: {
    width: 12,
    height: 12,
  },
});
