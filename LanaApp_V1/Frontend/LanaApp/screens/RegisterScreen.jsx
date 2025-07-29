import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView, 
} from 'react-native';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    

    if (!email) {
      Alert.alert('Error', 'Por favor introduce tu correo electrónico');
      return;
    }
    
    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor introduce un correo válido');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Por favor introduce una contraseña');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    
    Alert.alert('Éxito', 'Cuenta creada correctamente');
    navigation.replace('Dashboard'); 
  };

  const handleBackToLogin = () => {
    console.log('Volver al login');
  };

  const handleGoogleRegister = () => {
    console.log('Registro con Google');
  };

  const handleAppleRegister = () => {
    console.log('Registro con Apple');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
          <Text style={styles.title}>Crear una cuenta nueva</Text>
          <Text style={styles.subtitle}>Completa los datos para registrarte</Text>

          

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
          />

          {/* Input de contraseña */}
          <TextInput
            style={styles.input}
            placeholder="Contraseña (mínimo 6 caracteres)"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Input de confirmar contraseña */}
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Botón CREAR CUENTA */}
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>CREAR CUENTA</Text>
          </TouchableOpacity>

          {/* Volver al login */}
          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={styles.backToLogin}>¿Ya tienes cuenta? Iniciar sesión</Text>
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>o</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Botones de OAuth */}
          <TouchableOpacity style={styles.oauthButton} onPress={handleGoogleRegister}>
            <View style={styles.googleIcon}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.oauthButtonText}>Registrarse con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.oauthButton} onPress={handleAppleRegister}>
            <Text style={styles.appleIcon}></Text>
            <Text style={styles.oauthButtonText}>Registrarse con Apple</Text>
          </TouchableOpacity>

          {/* Términos y condiciones */}
          <Text style={styles.termsText}>
            Al crear una cuenta, aceptas nuestros{' '}
            <Text style={styles.termsLink}>Términos de servicio</Text>
            {' '}y{' '}
            <Text style={styles.termsLink}>Política de privacidad</Text>.
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircles: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: -6,
  },
  circle1: {
    backgroundColor: '#ffa500',
    zIndex: 1,
  },
  circle2: {
    backgroundColor: '#ff8c00',
    marginLeft: -12,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
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
  registerButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  backToLogin: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  separatorText: {
    fontSize: 14,
    color: '#999',
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
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  termsLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;