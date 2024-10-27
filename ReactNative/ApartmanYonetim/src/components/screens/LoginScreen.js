// src/components/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, Alert, Animated, ImageBackground, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider as PaperProvider, TextInput as PaperTextInput, Button } from 'react-native-paper';

const { width, height } = Dimensions.get('window'); // Ekran boyutlarını al

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fadeAnim] = useState(new Animated.Value(0)); // Animasyon için

    const handleLogin = async () => {
        // Burada API çağrısı yaparak JWT token almanız gerekiyor
        // Örnek bir token simülasyonu
        if (username === 'user' && password === 'password') {
            const token = 'your_jwt_token'; // Burada gerçek token'ı almanız gerekiyor
            await AsyncStorage.setItem('token', token);
            navigation.navigate('Dashboard');
        } else {
            Alert.alert('Giriş Hatası', 'Kullanıcı adı veya şifre hatalı.');
        }
    };

    // Bileşen yüklendiğinde animasyonu başlat
    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    return (
        <PaperProvider>
            <ImageBackground 
                source={require('../../assets/img/background.png')} 
                style={styles.background}
            >
                <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                    <Text style={styles.title}>Giriş Yap</Text>
                    <PaperTextInput
                        label="Kullanıcı Adı"
                        value={username}
                        onChangeText={setUsername}
                        style={styles.input}
                    />
                    <PaperTextInput
                        label="Şifre"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                    />
                    <Button mode="contained" onPress={handleLogin} color="#4CAF50" style={styles.button}>
                        Giriş Yap
                    </Button>
                </Animated.View>
            </ImageBackground>
        </PaperProvider>
    );
};

const styles = {
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.9, // Genişliği ekranın %90'ı
        padding: 16,
        backgroundColor: '#2196F3', // Mavi tonları
        borderRadius: 10,
        marginTop: height * 0.25, // Aşağıdan ekranın %25 yukarısı
    },
    title: {
        fontSize: 24,
        color: '#ffffff', // Beyaz metin rengi
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#E3F2FD', // Açık mavi arka plan rengi
    },
    button: {
        marginTop: 10,
    },
};

export default LoginScreen;
