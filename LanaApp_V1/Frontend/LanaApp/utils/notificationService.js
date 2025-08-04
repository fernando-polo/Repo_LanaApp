import api from './api';

export const notificationService = {
  // Listar notificaciones
  async getNotifications(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/notificaciones?${queryString}` : '/notificaciones';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener notificaciones pendientes
  async getPendingNotifications() {
    try {
      const response = await api.get('/notificaciones/pendientes');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener detalle de notificación
  async getNotificationDetail(id) {
    try {
      const response = await api.get(`/notificaciones/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Marcar notificación como leída
  async markAsRead(id) {
    try {
      const response = await api.post(`/notificaciones/${id}/marcar-leida`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar notificación
  async deleteNotification(id) {
    try {
      const response = await api.delete(`/notificaciones/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};