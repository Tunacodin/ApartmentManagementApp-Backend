import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import colors from '../../styles/colors';
import animate1 from '../../assets/json/A1.json';
import animate2 from '../../assets/json/A2.json';
import animate3 from '../../assets/json/A3.json';
import animate4 from '../../assets/json/A4.json';

const { width, height } = Dimensions.get('window');

const HelloScreen = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  const pages = [
    {
      id: '1',
      title: 'Apartman Yönetimi',
      description: 'Apartmanlarınız için gelişmiş bir yönetim sistemi sunar.',
      animation: animate1,
    },
    {
      id: '2',
      title: 'Kiracı Takibi',
      description: 'Kiracılarınızın taleplerini kolayca takip edin.',
      animation: animate2,
    },
    {
      id: '3',
      title: 'Gelir ve Giderler',
      description: 'Tüm gelir ve giderlerinizi organize bir şekilde yönetin.',
      animation: animate3,
    },
    {
      id: '4',
      title: 'Faturanı Kolaylıkla Öde!',
      description: 'Elektrik , Su , Doğalgaz , İnternet ve Aidat ödemelerinizi Evin üzerinden gerçekleştirebilirsiniz.',
      animation: animate4,
    },
    {
      id: '5',
      title: 'Başlayalım!',
      description: 'Artık apartmanınızı kolayca yönetmeye başlayabilirsiniz.',
      animation: null,
    },
  ];

  const handleScroll = (event) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (pageIndex !== currentPage) {
      setCurrentPage(pageIndex);

      if (pageIndex === pages.length - 1) {
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(buttonOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const renderPage = ({ item }) => (

    <View style={[styles.page, { backgroundColor: colors.white }]}>
  
      {item.animation && (
        <LottieView
          source={item.animation}
          autoPlay
          loop
          style={styles.animation}
        />
      )}
    
   
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View></View>
      <FlatList
        data={pages}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        style={{ flex: 1 }}
      />
      <Animated.View
        style={[
          styles.buttonContainer,
          { opacity: buttonOpacity, transform: [{ scale: buttonOpacity }] },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace('RoleScreen')}
        >
          <Text style={styles.buttonText}>Rol Seçimi Yap</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  page: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    overflow: 'hidden',
  },
  animation: {
    width: 350,
    height: 350,
    marginBottom: 40,
  },
  brandText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.black,
    opacity: 0.3, // Şeffaflık seviyesi
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: colors.black,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: colors.black,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HelloScreen;
