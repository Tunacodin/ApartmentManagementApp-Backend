import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../../../styles/colors';
import { CommonActions } from '@react-navigation/native';

const ComplateScreen = () => {
  const navigation = useNavigation();

  const handleStartManagement = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { 
            name: 'LoginScreen',
            params: { role: 'admin' }  // Role parametresini ekle
          },
        ],
      })
    );
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../../assets/json/A1.json')} // Başarı animasyonu ekleyin
        autoPlay
        loop={false}
        style={styles.animation}
      />
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Tebrikler!</Text>
        <Text style={styles.subtitle}>Tüm ayarlamalar tamamlandı</Text>
        <Text style={styles.description}>
          Artık yönetim paneline giriş yaparak apartmanınızı yönetmeye başlayabilirsiniz.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={handleStartManagement}
      >
        <Text style={styles.buttonText}>Yönetime Başla</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  contentContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ComplateScreen;
