import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    if (!email) {
      Alert.alert('Error', 'Por favor introduce tu correo electrónico');
      return;
    }
    
    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor introduce un correo válido');
      return;
    }
    
    console.log('Iniciando sesión con email:', email);
    navigation.navigate('Dashboard'); 
  };

  const handleForgotPassword = () => {
    console.log('Olvidé mi contraseña');
    navigation.navigate('RecuperarPassword');
  };

  const handleCreateAccount = () => {
    console.log('Ir a crear cuenta nueva');
    navigation.navigate('Register');
  };

  const handleGoogleLogin = () => {
    console.log('Login con Google');
  };

  const handleAppleLogin = () => {
    console.log('Login con Apple');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircles}>
              <View style={[styles.circle, styles.circle1]} />
              <View style={[styles.circle, styles.circle2]} />
            </View>
            <Text style={styles.appName}>LANA APP</Text>
          </View>

          {/* Título */}
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>Introduce tu correo para acceder a tu cuenta</Text>

          {/* Input de email */}
          <TextInput
            style={styles.emailInput}
            placeholder="usuario@example.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {/* Olvidé mi contraseña*/}
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordBottom}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.separator}>
          </View>

          {/* Botón ENTRAR */}
          <TouchableOpacity style={styles.enterButton} onPress={handleLogin}>
            <Text style={styles.enterButtonText}>ENTRAR</Text>
          </TouchableOpacity>

          {/* Crear cuenta nueva */}
          <TouchableOpacity onPress={handleCreateAccount}>
            <Text style={styles.createAccount}>¿No tienes cuenta? Crear cuenta nueva</Text>
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <View style={styles.separatorDot} />
            <View style={styles.separatorLine} />
          </View>

          {/* Botones de OAuth */}
          <TouchableOpacity style={styles.oauthButton} onPress={handleGoogleLogin}>
            <View style={styles.googleIcon}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.oauthButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.oauthButton} onPress={handleAppleLogin}>
            <Text style={styles.appleIcon}></Text>
            <Text style={styles.oauthButtonText}>Continuar con Apple</Text>
          </TouchableOpacity>

          {/* Términos y condiciones */}
          <Text style={styles.termsText}>
            Al hacer clic en continuar, acepta nuestros Términos de servicio y Política de privacidad.
          </Text>

          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircles: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: -8,
  },
  circle1: {
    backgroundColor: '#ffa500',
    zIndex: 1,
  },
  circle2: {
    backgroundColor: '#ff8c00',
    marginLeft: -16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  emailInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
  },
  enterButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  enterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  forgotPassword: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  createAccount: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  separatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleG: {
    color: '#4285f4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appleIcon: {
    fontSize: 24,
    marginRight: 12,
    color: '#000',
  },
  oauthButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
    marginRight: 36, 
  },
  termsText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  forgotPasswordBottom: {
    marginTop: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;