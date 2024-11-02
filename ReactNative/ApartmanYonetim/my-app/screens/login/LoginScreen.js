import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import CreateAccountScreen from './CreateAccountScreen';

const LoginScreen = ({ route, navigation }) => {
  const { role } = route.params || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState(''); 

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return 'user-shield';
      case 'owner':
        return 'home';
      case 'worker':
        return 'briefcase';
      case 'security':
        return 'shield-alt';
      case 'tenant':
        return 'user';
      default:
        return null;
    }
  };

  const handleLogin = () => {
    console.log(`Giriş yapılıyor - Rol: ${role}`, email, password);
    
    if (!email || !password) {
      setLoginMessage("Lütfen e-posta ve şifre girin.");
      return;
    }
    
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

  const handleRegister = () => {
    console.log("Kayıt oluşturuluyor - Rol:", role);
    // Kayıt oluşturma işlemleri burada yapılacak
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#4B59CD', '#A0C4FF']} style={styles.background}>
        <View style={styles.container}>
          <Icon name={getRoleIcon()} size={60} color="#4B59CD" style={styles.roleIcon} />
          
          <Text style={[styles.title, { textAlign: 'center' }]}>
            {role === 'admin' ? 'Yönetici Girişi' : role === 'owner' ? 'Ev Sahibi Girişi' : role === 'worker' ? 'Çalışan Girişi' : role === 'security' ? 'Güvenlik Görevlisi Girişi' : role === 'tenant' ? 'Kiracı Girişi' : 'Giriş Yap'}
          </Text>
          
          {loginMessage ? <Text style={[styles.loginMessage, { textAlign: 'center' }]}>{loginMessage}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adı"
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
          
          <TouchableOpacity onPress={() => {/* Şifre sıfırlama işlemi */}}>
            <Text style={[styles.forgotPassword, { textAlign: 'center' }]}>Şifrenizi mi unuttunuz?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('CreateAccountScreen')}>
            <Text style={[styles.createAccount, { textAlign: 'center' }]}>Hesap Oluştur</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  roleIcon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#4B59CD',
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
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#aaa',
    elevation: 1,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 5,
  
  },
  button: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#4B59AF',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  buttonText: {
    color: '#4B59CD',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginTop: 10,
    color: '#4B59CD',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  createAccount: {
    marginTop: 10,
    color: '#4B59CD',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
