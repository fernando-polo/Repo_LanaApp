import api from './api';

export const scheduledPaymentService = {
  // Crear pago programado
  async createScheduledPayment(paymentData) {
    try {
      const response = await api.post('/pagos-programados', paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Listar pagos programados
  async getScheduledPayments(activos = true) {
    try {
      const response = await api.get(`/pagos-programados?activos=${activos}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener pagos próximos
  async getUpcomingPayments(dias = 7) {
    try {
      const response = await api.get(`/pagos-programados/proximos?dias=${dias}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener detalle de pago programado
  async getScheduledPaymentDetail(id) {
    try {
      const response = await api.get(`/pagos-programados/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar pago programado
  async updateScheduledPayment(id, paymentData) {
    try {
      const response = await api.put(`/pagos-programados/${id}`, paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar (desactivar) pago programado
  async deleteScheduledPayment(id) {
    try {
      const response = await api.delete(`/pagos-programados/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Procesar pagos pendientes (para uso administrativo)
  async processPendingPayments() {
    try {
      const response = await api.post('/pagos-programados/procesar-pendientes');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};