import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import colors from '../../styles/colors';

const LoginScreen = ({ route, navigation }) => {
  const { role } = route.params || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      setLoginMessage('Lütfen e-posta ve şifre girin.');
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
        setLoginMessage('Geçersiz rol.');
    }
  };

  const handleRegister = () => {
    navigation.navigate('RegisterScreen');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={[colors.secondary, colors.white]} style={styles.background}>
        <View style={styles.container}>
          <Icon name={getRoleIcon()} size={60} color={colors.darkGray} style={styles.roleIcon} />
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
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adı"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.darkGray}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={colors.darkGray}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
              <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color={colors.darkGray} />
            </TouchableOpacity>
          </View>
          {loginMessage ? <Text style={styles.loginMessage}>{loginMessage}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.forgotPassword}>Şifrenizi mi unuttunuz?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.createAccount}>Hesap Oluştur</Text>
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
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  roleIcon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  loginMessage: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    paddingHorizontal: 20,
    borderColor: colors.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    color: colors.black,
    backgroundColor: colors.white,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: colors.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: colors.lightGray,
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  createAccount: {
    color: colors.lightGray,
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: 15,
  },
});

export default LoginScreen;
