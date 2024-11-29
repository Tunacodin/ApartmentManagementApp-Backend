import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';

const { width } = Dimensions.get('window');

export default function NavigationWithProgress({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
}) {
  const scaleAnim = useRef(
    Array.from({ length: totalSteps }, () => new Animated.Value(1))
  ).current;

  const progressAnim = useRef(
    Array.from({ length: totalSteps }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Aktif adımın büyüme animasyonu
    Animated.spring(scaleAnim[currentStep], {
      toValue: 1.2,
      friction: 4,
      useNativeDriver: true,
    }).start();

    // Önceki adımların geri dönüşü
    scaleAnim.forEach((anim, index) => {
      if (index !== currentStep) {
        Animated.spring(anim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }).start();
      }
    });

    // Tamamlanan adımlarda dolma animasyonu
    progressAnim.forEach((anim, index) => {
      if (index <= currentStep) {
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(anim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [currentStep]);

  return (
    <View style={styles.container}>
      {/* Sol Ok Butonu */}
      <Ionicons
        name="chevron-back-outline"
        size={28}
        color={currentStep === 0 ? colors.lightGray : colors.primary}
        onPress={onPrevious}
        style={[styles.arrow, currentStep === 0 && styles.disabledArrow]}
      />

      {/* Progress Indicator */}
      <View style={styles.indicatorContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} style={styles.stepContainer}>
            <Animated.View
              style={[
                styles.circle,
                {
                  transform: [{ scale: scaleAnim[index] }],
                },
                index < currentStep && styles.completedCircle,
                index === currentStep && styles.activeCircle,
              ]}
            >
              {index < currentStep ? (
                <Animated.View
                  style={[
                    styles.checkmarkContainer,
                    { opacity: progressAnim[index] },
                  ]}
                >
                  <Ionicons name="checkmark" size={18} color={colors.white} />
                </Animated.View>
              ) : (
                <Text
                  style={[
                    styles.stepText,
                    index <= currentStep && styles.activeStepText,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </Animated.View>
            {index < totalSteps - 1 && (
              <Animated.View
                style={[
                  styles.line,
                  { opacity: progressAnim[index] },
                  index < currentStep && styles.activeLine,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Sağ Ok Butonu */}
      <Ionicons
        name="chevron-forward-outline"
        size={28}
        color={currentStep === totalSteps - 1 ? colors.lightGray : colors.primary}
        onPress={onNext}
        style={[
          styles.arrow,
          currentStep === totalSteps - 1 && styles.disabledArrow,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    width: '100%',
    zIndex:1,
  },
  arrow: {
    padding: 10,
  },
  disabledArrow: {
    opacity: 0.5,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.7,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircle: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  completedCircle: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    color: colors.darkGray,
    fontSize: 14,
  },
  activeStepText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  line: {
    width: 30,
    height: 2,
    marginLeft:.0,
    backgroundColor: colors.lightGray,
    zIndex:-1,
  },
  activeLine: {
    backgroundColor: colors.primary,
  },
});
