import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { authService } from '../utils/auth';

const LoginScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Verificar si viene de un registro exitoso
  useEffect(() => {
    if (route.params?.registrationSuccess) {
      // Mostrar mensaje de éxito
      setTimeout(() => {
        Alert.alert(
          '¡Cuenta creada exitosamente!',
          'Ya puedes iniciar sesión con tu correo y contraseña.',
          [{ text: 'OK' }]
        );
      }, 500);
      
      // Si viene el email, pre-llenarlo
      if (route.params?.userEmail) {
        setEmail(route.params.userEmail);
      }
    }
  }, [route.params]);

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor introduce tu correo electrónico');
      return;
    }
    
    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor introduce un correo válido');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Por favor introduce tu contraseña');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.login(email, password);
      console.log('Login exitoso:', response);
      
      // Navegar al Dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      console.error('Error en login:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Credenciales incorrectas';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('RecuperarPassword');
  };

  const handleCreateAccount = () => {
    navigation.navigate('Register');
  };

  const handleGoogleLogin = () => {
    Alert.alert('Información', 'Login con Google aún no implementado');
  };

  const handleAppleLogin = () => {
    Alert.alert('Información', 'Login con Apple aún no implementado');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.content}>
          {/* Mensaje de éxito si viene del registro */}
          {route.params?.registrationSuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✓ Cuenta creada exitosamente</Text>
            </View>
          )}

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
          <Text style={styles.subtitle}>Introduce tu correo y contraseña para acceder</Text>

          {/* Input de email */}
          <TextInput
            style={styles.input}
            placeholder="usuario@example.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {/* Input de contraseña */}
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          
          {/* Olvidé mi contraseña*/}
          <TouchableOpacity 
            onPress={handleForgotPassword} 
            style={styles.forgotPasswordBottom}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.separator}>
          </View>

          {/* Botón ENTRAR */}
          <TouchableOpacity 
            style={[styles.enterButton, loading && styles.enterButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.enterButtonText}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          {/* Crear cuenta nueva */}
          <TouchableOpacity onPress={handleCreateAccount} disabled={loading}>
            <Text style={styles.createAccount}>¿No tienes cuenta? Crear cuenta nueva</Text>
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <View style={styles.separatorDot} />
            <View style={styles.separatorLine} />
          </View>

          {/* Botones de OAuth */}
          <TouchableOpacity 
            style={[styles.oauthButton, loading && styles.oauthButtonDisabled]} 
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <View style={styles.googleIcon}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.oauthButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.oauthButton, loading && styles.oauthButtonDisabled]} 
            onPress={handleAppleLogin}
            disabled={loading}
          >
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
  successBanner: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    marginHorizontal: -32,
  },
  successText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  enterButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  enterButtonDisabled: {
    backgroundColor: '#666',
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
  oauthButtonDisabled: {
    opacity: 0.6,
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
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;