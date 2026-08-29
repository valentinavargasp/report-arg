import apiClient from './apiClient';

/**
 * Sube una imagen al servidor usando el endpoint de administradores.
 *
 * @param {File} file - El archivo de imagen a subir.
 * @returns {Promise<Object>} La respuesta del servidor (debe incluir la URL si fue exitoso).
 */
export const uploadImage = async (file) => {
  const fd = new FormData();
  fd.append('foto', file);
  const res = await apiClient.post('/admin/upload/foto', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
