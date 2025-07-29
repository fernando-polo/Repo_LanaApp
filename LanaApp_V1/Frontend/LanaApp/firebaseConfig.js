// firebaseConfig.js (en la raíz de tu proyecto)
export const auth = {
  // Objeto mock (simulado) para evitar errores
  currentUser: null,
  async sendPasswordResetEmail() {
    console.log('Función de Firebase simulada');
    return Promise.resolve();
  }
};