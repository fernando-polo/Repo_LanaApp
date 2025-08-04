import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const authService = {
  // Login
  async login(email, password) {
    try {
      // Limpiar cualquier token anterior
      await this.logout();
      
      // La API espera form-data para el login
      const formData = new FormData();
      formData.append('username', email); // La API usa 'username' aunque sea email
      formData.append('password', password);

      const response = await api.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.access_token) {
        await AsyncStorage.setItem('accessToken', response.data.access_token);
        await AsyncStorage.setItem('tokenType', response.data.token_type);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registro
  async register(userData) {
    try {
      const response = await api.post('/api/auth/registro', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Recuperar contraseña
  async forgotPassword(email) {
    try {
      const response = await api.post('/api/auth/olvide-contrasena', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('tokenType');
      await AsyncStorage.clear(); // Limpiar todo el storage para mayor seguridad
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  },

  // Verificar si hay token (NO para autologin, solo para verificaciones internas)
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      return !!token;
    } catch (error) {
      return false;
    }
  },
};