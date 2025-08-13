import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambia esta URL por la de tu servidor
const API_URL = 'https://lana-api-rm8u.onrender.com'; // Usa tu IP local para desarrollo

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await AsyncStorage.removeItem('accessToken');
      // Aquí podrías redirigir al login
    }
    return Promise.reject(error);
  }
);

export default api;