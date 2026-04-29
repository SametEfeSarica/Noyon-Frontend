import axios from 'axios';

// Temel bağlantı ayarı
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// NETWORK KALKANI (Interceptor)
axiosInstance.interceptors.response.use(
  (response) => {
    // İşlem başarılıysa aynen devam et
    return response;
  },
  (error) => {
    // Backend'den gelen özel hata mesajını yakala
    const errorMessage = error.response?.data?.message || "Sunucuya ulaşılamıyor veya beklenmeyen bir hata oluştu.";
    
    // Şık bir uyarı bas (Sayfayı çökertmeden)
    alert(`⚠️ NOYON SİSTEM UYARISI:\n\n${errorMessage}`);
    
    return Promise.reject(error);
  }
);

export default axiosInstance;