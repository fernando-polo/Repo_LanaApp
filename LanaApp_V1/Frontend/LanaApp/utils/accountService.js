import api from './api';

export const accountService = {
  // Listar cuentas
  async getAccounts() {
    try {
      const response = await api.get('/cuentas');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear cuenta
  async createAccount(accountData) {
    try {
      const response = await api.post('/cuentas', accountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener detalle de cuenta
  async getAccountDetail(id) {
    try {
      const response = await api.get(`/cuentas/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar cuenta
  async updateAccount(id, accountData) {
    try {
      const response = await api.put(`/cuentas/${id}`, accountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar cuenta
  async deleteAccount(id) {
    try {
      const response = await api.delete(`/cuentas/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};