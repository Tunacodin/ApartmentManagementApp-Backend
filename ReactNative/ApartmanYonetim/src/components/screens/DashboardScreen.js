// src/components/DashboardScreen.js
import React, { useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = ({ navigation }) => {
    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Giriş Yapılmadı', 'Lütfen giriş yapın.');
                navigation.navigate('Login');
            }
        };
        checkToken();
    }, [navigation]);

    return (
        <View>
            <Text>Dashboard (Anasayfa) Ekranı</Text>
        </View>
    );
};

export default DashboardScreen;
