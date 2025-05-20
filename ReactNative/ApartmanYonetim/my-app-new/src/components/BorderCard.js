import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const BorderCard = ({ 
  children, 
  onPress, 
  style, 
  isSelected = false,
  width: cardWidth = width * 0.85,
  height = 160,
  borderColor = 'rgba(125, 211, 252, 0.5)',
  blurIntensity = 10,
  activeOpacity = 0.8
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={activeOpacity}
      style={[
        styles.card,
        { width: cardWidth, height },
        style
      ]}
    >
      {!isSelected && (
        <BlurView
          intensity={blurIntensity}
          tint="light"
          style={[
            StyleSheet.absoluteFill,
            { 
              borderRadius: 20,
              borderWidth: 2,
              borderColor: borderColor
            }
          ]}
        />
      )}
      <View style={[
        styles.content,
        { backgroundColor: isSelected ? undefined : 'transparent' }
      ]}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  }
});

export default BorderCard; 