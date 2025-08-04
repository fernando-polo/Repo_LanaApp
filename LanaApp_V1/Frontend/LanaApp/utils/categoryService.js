import api from './api';

export const categoryService = {
  // Listar categorías
  async getCategories(tipo = null) {
    try {
      const params = tipo ? `?tipo=${tipo}` : '';
      const response = await api.get(`/categorias${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear categoría
  async createCategory(categoryData) {
    try {
      const response = await api.post('/categorias', categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener detalle de categoría
  async getCategoryDetail(id) {
    try {
      const response = await api.get(`/categorias/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar categoría
  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`/categorias/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar categoría
  async deleteCategory(id) {
    try {
      const response = await api.delete(`/categorias/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};