import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image } from 'react-native';

const SplashScreen = ({ onAnimationFinish }) => {
  const opacity = useRef(new Animated.Value(0)).current;  // Opaklık için animasyon değeri
  const scale = useRef(new Animated.Value(0.5)).current;  // Boyut için animasyon değeri

  useEffect(() => {
    // Animasyonları sırayla çalıştır
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000), // Bekleme süresi
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onAnimationFinish) {
        setTimeout(onAnimationFinish, 500); // Son bir bekleme süresi ekleyin
      }
    });
  }, [opacity, scale, onAnimationFinish]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          {
            opacity: opacity,
            transform: [{ scale: scale }],
          },
        ]}
      >
        <Image source={require('../../assets/home.png')} style={styles.houseImage} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#4B59CD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  houseImage: {
    width: 60,
    height: 60,
  },
});

export default SplashScreen;
