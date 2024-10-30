import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, ImageBackground } from 'react-native';

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = () => {
        console.log('Kayıt olunuyor:', email, password);
    };

    return (
        <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
            <View style={styles.container}>
                <Text style={styles.title}>Kayıt Ol</Text>
                <TextInput
                    style={styles.input}
                    placeholder="E-posta"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#aaa"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Şifre"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#aaa"
                />
                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Kayıt Ol</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.switchText}>Zaten bir hesabın var mı? Giriş Yap</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 15,
        padding: 20,
        marginTop: 130,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#4B59CD',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    switchText: {
        color: '#4B59CD',
        fontSize: 16,
        marginTop: 10,
    },
});

export default RegisterScreen;
