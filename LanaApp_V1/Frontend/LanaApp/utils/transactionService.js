import api from './api';

export const transactionService = {
  // Listar transacciones
  async getTransactions(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/transacciones?${queryString}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear nueva transacción
  async createTransaction(transactionData) {
    try {
      const response = await api.post('/transacciones', transactionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener detalle de transacción
  async getTransactionDetail(id) {
    try {
      const response = await api.get(`/transacciones/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar transacción
  async deleteTransaction(id) {
    try {
      const response = await api.delete(`/transacciones/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener resumen de categorías
  async getCategoryReport(mes, ano) {
    try {
      const response = await api.get(`/transacciones/resumen-categorias?mes=${mes}&ano=${ano}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener histórico mensual
  async getMonthlyHistory(ano) {
    try {
      const response = await api.get(`/transacciones/historico?ano=${ano}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener top categorías
  async getTopCategories(tipo, params = {}) {
    try {
      const queryString = new URLSearchParams({ tipo, ...params }).toString();
      const response = await api.get(`/transacciones/top-categorias?${queryString}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};