import axios from 'axios';
 
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
 
// ─── İstek Interceptor — Her isteğe JWT ekler ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('DİKKAT: Gönderilecek bir Token bulunamadı!');
  }
 
  return config;
});
 
// ─── Cevap Interceptor — 401/403 yönetimi ────────────────────────────────────
let isRefreshing = false;
let failedQueue  = [];
 
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else       prom.resolve(token);
  });
  failedQueue = [];
};
 
const clearSessionAndRedirect = () => {
  localStorage.clear();
  window.location.href = '/login';
};
 
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest  = error.config;
    const status           = error.response?.status;
 
    // ── 403: token geçersiz/süresi dolmuş → refresh dene, olmazsa çıkış ──────
    // ── 401: yetkisiz → aynı akış ────────────────────────────────────────────
    if ((status === 401 || status === 403) && !originalRequest._retry) {
 
      // Refresh zaten devam ediyorsa kuyruğa al
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }
 
      originalRequest._retry = true;
      isRefreshing            = true;
 
      const refreshToken = localStorage.getItem('refreshToken');
 
      if (!refreshToken) {
        // Refresh token da yoksa oturum açık değil
        processQueue(error, null);
        isRefreshing = false;
        clearSessionAndRedirect();
        return Promise.reject(error);
      }
 
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
          null,
          { headers: { 'X-Refresh-Token': refreshToken } }
        );
 
        const { accessToken, refreshToken: newRefreshToken } = response.data;
 
        localStorage.setItem('token',        accessToken);
        localStorage.setItem('accessToken',  accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
 
        processQueue(null, accessToken);
 
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
 
      } catch (refreshError) {
        // Refresh da başarısız → oturumu tamamen kapat
        processQueue(refreshError, null);
        clearSessionAndRedirect();
        return Promise.reject(refreshError);
 
      } finally {
        isRefreshing = false;
      }
    }
 
    return Promise.reject(error);
  }
);
 
export default api;