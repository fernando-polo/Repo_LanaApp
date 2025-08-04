import api from './api';

export const userService = {
  // Obtener información del usuario actual
  async getCurrentUser() {
    try {
      const response = await api.get('/usuarios/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar información del usuario
  async updateUser(userData) {
    try {
      const response = await api.put('/usuarios/me', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};