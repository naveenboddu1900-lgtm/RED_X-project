const BACKEND_ORIGIN = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : `${window.location.protocol}//${window.location.hostname}:5000`;

const API_URL = `${BACKEND_ORIGIN}/api`;

const backendUrl = (path) => {
  if (!path) return '';
  return path.startsWith('/') ? `${BACKEND_ORIGIN}${path}` : path;
};


/**
 * Custom fetch client that automatically manages Authorization headers
 */
const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // If payload is FormData (image uploads), let browser set Content-Type header
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export default api;
export { API_URL, backendUrl };
