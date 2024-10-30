import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, ImageBackground } from 'react-native';

const LoginScreen = ({ route }) => {
  const { role } = route.params || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState(''); // Giriş mesajı için state

  const handleLogin = () => {
    console.log(`Giriş yapılıyor - Rol: ${role}`, email, password);
    
    if (role === 'admin') {
      setLoginMessage("Yönetici olarak giriş yapıldı.");
    } else if (role === 'owner') {
      setLoginMessage("Ev sahibi olarak giriş yapıldı.");
    } else if (role === 'worker') {
      setLoginMessage("Çalışan olarak giriş yapıldı.");
    } else if (role === 'security') {
      setLoginMessage("Güvenlik görevlisi olarak giriş yapıldı.");
    } else if (role === 'tenant') {
      setLoginMessage("Kiracı olarak giriş yapıldı.");
    }
  };

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {role === 'admin'
            ? 'Yönetici Girişi'
            : role === 'owner'
            ? 'Ev Sahibi Girişi'
            : role === 'worker'
            ? 'Çalışan Girişi'
            : role === 'security'
            ? 'Güvenlik Görevlisi Girişi'
            : role === 'tenant'
            ? 'Kiracı Girişi'
            : 'Giriş Yap'}
        </Text>
        
        {/* Giriş mesajını göster */}
        {loginMessage ? <Text style={styles.loginMessage}>{loginMessage}</Text> : null}

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
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Giriş Yap</Text>
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
  loginMessage: {
    fontSize: 16,
    color: '#4B59CD',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
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
});

export default LoginScreen;
