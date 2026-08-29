import apiClient from './apiClient';

export const authService = {
  /**
   * Registra un nuevo ciudadano
   * @param {Object} data - Datos del ciudadano
   */
  registerCitizen: async (data) => {
    const response = await apiClient.post('/auth/register-citizen', data);
    return response.data;
  },

  /**
   * Registra una nueva institución
   * @param {Object} data - Datos de la institución
   */
  registerInstitution: async (data) => {
    const response = await apiClient.post('/auth/register-institution', data);
    return response.data;
  },

  /**
   * Verifica el correo electrónico usando un código OTP
   * @param {string} email - Correo a verificar
   * @param {string} code - Código de 6 dígitos
   */
  verifyEmail: async (email, code) => {
    const response = await apiClient.post('/auth/verify-email', { email, code });
    return response.data;
  },

  /**
   * Reenvía el código de verificación al correo
   * @param {string} email - Correo destino
   */
  resendVerificationCode: async (email) => {
    const response = await apiClient.post('/auth/resend-code', { email });
    return response.data;
  },

  /**
   * Solicita el restablecimiento de contraseña (envía email con link)
   * @param {string} email - Correo del usuario
   */
  requestPasswordReset: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Restablece la contraseña usando el token del email
   * @param {string} token - Token recibido por email
   * @param {string} newPassword - Nueva contraseña
   */
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  }
};
