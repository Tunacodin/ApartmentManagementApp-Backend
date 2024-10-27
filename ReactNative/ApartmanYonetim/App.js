import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from "./src/components/screens/LoginScreen";
import DashboardScreen from "./src/components/screens/DashboardScreen";
import NotificationScreen from "./src/components/screens/NotificationScreen";
import PaymentScreen from "./src/components/screens/PaymentScreen";   

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Payments" component={PaymentScreen} />
            <Tab.Screen name="Notifications" component={NotificationScreen} />
        </Tab.Navigator>
    );
};


const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('token');
            setIsLoggedIn(!!token); // Token varsa giriş yapıldı
        };
        checkToken();
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={isLoggedIn ? "TabNavigator" : "Login"} screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen}/>
                <Stack.Screen name="TabNavigator" component={TabNavigator}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};



export default App;
