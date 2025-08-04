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
  ActivityIndicator,
} from 'react-native';
import { authService } from '../utils/auth';

const RecuperarPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Por favor introduce un correo válido');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      console.log('Respuesta recuperación:', response);
      
      Alert.alert(
        'Correo enviado', 
        response.message || 'Si el email existe, se enviaron instrucciones para restablecer tu contraseña.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error al recuperar contraseña:', error);
      
      let errorMessage = 'No se pudo enviar el correo de recuperación';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircles}>
              <View style={[styles.circle, styles.circle1]} />
              <View style={[styles.circle, styles.circle2]} />
            </View>
            <Text style={styles.appName}>LANA APP</Text>
          </View>

          <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.subtitle}>Introduce tu correo para recibir un enlace de recuperación</Text>

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

          <TouchableOpacity 
            style={[styles.resetButton, loading && styles.resetButtonDisabled]} 
            onPress={handlePasswordReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.resetButtonText}>ENVIAR CORREO</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBackToLogin} disabled={loading}>
            <Text style={styles.backToLogin}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  scrollContent: { 
    flexGrow: 1 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 32, 
    paddingTop: 40 
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  logoCircles: { 
    flexDirection: 'row', 
    marginBottom: 16 
  },
  circle: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    marginHorizontal: -6 
  },
  circle1: { 
    backgroundColor: '#ffa500', 
    zIndex: 1 
  },
  circle2: { 
    backgroundColor: '#ff8c00', 
    marginLeft: -12 
  },
  appName: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#333', 
    letterSpacing: 2 
  },
  title: { 
    fontSize: 26, 
    fontWeight: '600', 
    color: '#333', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 32 
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  resetButtonDisabled: {
    backgroundColor: '#666',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  backToLogin: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default RecuperarPassword;