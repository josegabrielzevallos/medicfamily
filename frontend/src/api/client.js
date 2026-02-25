import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      console.log("🔄 Intentando refrescar token...");
      
      if (!refreshToken) {
        console.log("❌ No hay refresh token");
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      try {
        const response = await axios.post(`${API_BASE_URL}/appointments/refresh-token/`, {
          refresh: refreshToken,
        });
        console.log("✅ Token refrescado exitosamente");
        localStorage.setItem('access_token', response.data.access);
        client.defaults.headers.common.Authorization = `Bearer ${response.data.access}`;
        return client(originalRequest);
      } catch (err) {
        console.log("❌ Error al refrescar token");
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: (username, password) => 
    client.post('/appointments/login/', { username, password }),
  
  register: (userData) => 
    client.post('/appointments/register/', userData),
  
  registerDoctor: (doctorData) => 
    client.post('/appointments/register-doctor/', doctorData),
  
  refreshToken: (refresh) => 
    client.post('/appointments/refresh-token/', { refresh }),
};

// Specialties API
export const specialtyAPI = {
  getAll: () => client.get('/appointments/specialties/'),
  getById: (id) => client.get(`/appointments/specialties/${id}/`),
  create: (data) => client.post('/appointments/specialties/', data),
};

// Doctors API
export const doctorAPI = {
  getAll: (params) => client.get('/appointments/doctors/', { params }),
  getById: (id) => client.get(`/appointments/doctors/${id}/`),
  getAvailability: (id) => client.get(`/appointments/doctors/${id}/availability/`),
  getRatings: (id) => client.get(`/appointments/doctors/${id}/ratings/`),
  update: (id, data) => client.put(`/appointments/doctors/${id}/`, data),
  verify: (id) => client.post(`/appointments/doctors/${id}/verify/`),
  reject: (id) => client.post(`/appointments/doctors/${id}/reject/`),
};

// Patients API
export const patientAPI = {
  getAll: () => client.get('/appointments/patients/'),
  getById: (id) => client.get(`/appointments/patients/${id}/`),
  getMyProfile: () => client.get('/appointments/patients/my_profile/'),
  update: (id, data) => client.put(`/appointments/patients/${id}/`, data),
};

// Appointments API
export const appointmentAPI = {
  getAll: (params) => client.get('/appointments/appointments/', { params }),
  getById: (id) => client.get(`/appointments/appointments/${id}/`),
  create: (data) => client.post('/appointments/appointments/', data),
  update: (id, data) => client.put(`/appointments/appointments/${id}/`, data),
  confirm: (id) => client.post(`/appointments/appointments/${id}/confirm/`),
  complete: (id) => client.post(`/appointments/appointments/${id}/complete/`),
  cancel: (id) => client.post(`/appointments/appointments/${id}/cancel/`),
  getUpcoming: () => client.get('/appointments/appointments/upcoming/'),
  getPast: () => client.get('/appointments/appointments/past/'),
};

// Availability API
export const availabilityAPI = {
  getAll: (params) => client.get('/appointments/availabilities/', { params }),
  create: (data) => client.post('/appointments/availabilities/', data),
  update: (id, data) => client.put(`/appointments/availabilities/${id}/`, data),
  delete: (id) => client.delete(`/appointments/availabilities/${id}/`),
};

// Ratings API
export const ratingAPI = {
  getAll: () => client.get('/appointments/ratings/'),
  create: (data) => client.post('/appointments/ratings/', data),
};

// Virtual Meetings API
export const virtualMeetingAPI = {
  create: (data) => client.post('/appointments/virtual-meetings/', data),
  getByAppointment: (appointmentId) => 
    client.get(`/appointments/virtual-meetings/?appointment=${appointmentId}`),
};

export default client;
