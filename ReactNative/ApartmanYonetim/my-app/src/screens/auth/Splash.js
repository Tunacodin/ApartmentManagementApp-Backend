import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function SplashScreen({ navigation }) {
  const letters = ['E', 'v', 'i', 'n']; // Harfler
  const animations = useRef(letters.map(() => new Animated.Value(0))).current; // Her harf için ayrı animasyon

  useEffect(() => {
    // Animasyonu sırayla başlat
    Animated.stagger(
      200, // Her harf arasında 200ms gecikme
      animations.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      )
    ).start(() => {
      // Animasyon tamamlandığında diğer ekrana geç
      setTimeout(() => navigation.replace('HelloScreen'), 1000); // 1 saniye bekle
    });
  }, [animations, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        {letters.map((letter, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.text,
              { opacity: animations[index] }, // Opaklık animasyonu
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Beyaz arka plan
  },
  textContainer: {
    flexDirection: 'row', // Harfleri yan yana göstermek için
  },
  text: {
    fontSize: 48, // Yazı boyutu
    fontWeight: 'bold',
    color: '#000000', // Siyah yazı
    marginHorizontal: 5, // Harfler arası boşluk
  
  },
});
