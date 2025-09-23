// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get auth headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false,
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      includeAuth: false,
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  // Dashboard endpoints
  async getDashboardSummary() {
    return this.request('/dashboard/summary');
  }

  async getUserProgress() {
    return this.request('/dashboard/progress');
  }

  async submitQuizResult(quizData) {
    return this.request('/dashboard/quiz-results', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  async getQuizResults(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/dashboard/quiz-results${queryString ? `?${queryString}` : ''}`);
  }

  async getQuizStats() {
    return this.request('/dashboard/quiz-stats');
  }

  async createEmergencyKit(kitData) {
    return this.request('/dashboard/emergency-kits', {
      method: 'POST',
      body: JSON.stringify(kitData),
    });
  }

  async getEmergencyKits() {
    return this.request('/dashboard/emergency-kits');
  }

  async updateEmergencyKit(kitId, kitData) {
    return this.request(`/dashboard/emergency-kits/${kitId}`, {
      method: 'PUT',
      body: JSON.stringify(kitData),
    });
  }

  async deleteEmergencyKit(kitId) {
    return this.request(`/dashboard/emergency-kits/${kitId}`, {
      method: 'DELETE',
    });
  }

  // User management endpoints (for authorities)
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  async getUsersByRole(role) {
    return this.request(`/users/role/${role}`);
  }

  async updateUserStatus(userId, isActive) {
    return this.request(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health', { includeAuth: false });
  }
}

// Create and export API service instance
const apiService = new ApiService();

// Authentication helper functions
export const authUtils = {
  // Check if user is logged in
  isAuthenticated() {
    return !!apiService.token;
  },

  // Get user info from token (basic decode - not secure validation)
  getUserInfo() {
    if (!apiService.token) return null;
    
    try {
      const payload = JSON.parse(atob(apiService.token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Check if user has specific role
  hasRole(role) {
    const userInfo = this.getUserInfo();
    return userInfo?.role === role;
  },

  // Logout and clear token
  logout() {
    apiService.setToken(null);
    // Redirect to login page or refresh
    window.location.href = '/login';
  },

  // Login with credentials
  async login(credentials) {
    try {
      const response = await apiService.login(credentials);
      if (response.success && response.data.token) {
        apiService.setToken(response.data.token);
        return response.data;
      }
      throw new Error('Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user
  async register(userData) {
    try {
      const response = await apiService.register(userData);
      if (response.success && response.data.token) {
        apiService.setToken(response.data.token);
        return response.data;
      }
      throw new Error('Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
};

export default apiService;