import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';

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
    if (!email || !password) {
      setLoginMessage("Lütfen e-posta ve şifre girin.");
      return;
    }

    switch (role) {
      case 'admin':
        navigation.navigate('AdminNavigator');
        break;
      case 'owner':
        navigation.navigate('OwnerNavigator');
        break;
      case 'worker':
        navigation.navigate('WorkerNavigator');
        break;
      case 'security':
        navigation.navigate('SecurityNavigator');
        break;
      case 'tenant':
        navigation.navigate('TenantNavigator');
        break;
      default:
        setLoginMessage("Geçersiz rol.");
    }
  };

 const handleRegister = () => {
  switch (role) {
    case 'admin':
      navigation.navigate('AdminNavigator'); // Yönetici için hesap oluşturma ve dashboard'a yönlendirme
      break;
    case 'owner':
      navigation.navigate('OwnerNavigator'); // Ev sahibi için hesap oluşturma ve dashboard'a yönlendirme
      break;
    case 'worker':
      navigation.navigate('WorkerNavigator'); // Çalışan için hesap oluşturma ve dashboard'a yönlendirme
      break;
    case 'security':
      navigation.navigate('SecurityNavigator'); // Güvenlik görevlisi için hesap oluşturma ve dashboard'a yönlendirme
      break;
    case 'tenant':
      navigation.navigate('TenantNavigator'); // Kiracı için hesap oluşturma ve dashboard'a yönlendirme
      break;
    default:
      setLoginMessage("Geçersiz rol.");
  }
};


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
          
          <TouchableOpacity onPress={() => { /* Şifre sıfırlama işlemi burada olabilir */ }}>
            <Text style={[styles.forgotPassword, { textAlign: 'center' }]}>Şifrenizi mi unuttunuz?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleRegister}>
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
