import api from './api';

export const budgetService = {
  // Crear presupuesto
  async createBudget(budgetData) {
    try {
      const response = await api.post('/presupuestos', budgetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Listar presupuestos
  async getBudgets(mes = null, ano = null) {
    try {
      const params = {};
      if (mes) params.mes = mes;
      if (ano) params.ano = ano;
      
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/presupuestos?${queryString}` : '/presupuestos';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener resumen de presupuestos para un mes/año
  async getBudgetsSummary(mes, ano) {
    try {
      const response = await api.get(`/presupuestos/resumen?mes=${mes}&ano=${ano}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un presupuesto específico
  async getBudgetDetail(budgetId) {
    try {
      const response = await api.get(`/presupuestos/${budgetId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar presupuesto
  async updateBudget(budgetId, budgetData) {
    try {
      const response = await api.put(`/presupuestos/${budgetId}`, budgetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar presupuesto
  async deleteBudget(budgetId) {
    try {
      const response = await api.delete(`/presupuestos/${budgetId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};