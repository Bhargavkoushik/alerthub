// Enhanced auth system that integrates with backend API
import apiService, { authUtils } from './apiService.js';

const KEY = 'ah_users_v1'
const AUTH_KEY = 'ah_auth_v1'

// Fallback localStorage functions for offline mode
function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {
    // ignore write failures (private mode or quota exceeded)
  }
}

function saveAuthData(authData) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData))
  } catch {
    // ignore write failures
  }
}

function loadAuthData() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Enhanced registration function with backend integration
export async function registerLocal({ full_name, role, password, username, email, phone, extra_data }) {
  try {
    // Prepare data for backend API
    const [firstName, ...lastNameParts] = (full_name || '').split(' ');
    const lastName = lastNameParts.join(' ') || 'User';
    
    const userData = {
      firstName,
      lastName,
      email: email || `${username}@example.com`,
      password,
      role,
      phoneNumber: phone,
    };

    // Add role-specific data
    if (role === 'student' && extra_data) {
      userData.studentInfo = {
        grade: extra_data.grade,
        schoolName: extra_data.school,
        studentId: extra_data.studentId,
        dateOfBirth: extra_data.dateOfBirth,
        emergencyContact: extra_data.emergencyContact
      };
    } else if (role === 'teacher' && extra_data) {
      userData.teacherInfo = {
        employeeId: extra_data.employeeId,
        schoolName: extra_data.school,
        subjects: extra_data.subjects,
        grades: extra_data.grades,
        qualification: extra_data.qualification,
        experienceYears: extra_data.experienceYears
      };
    } else if (role === 'parent' && extra_data) {
      userData.parentInfo = {
        occupation: extra_data.occupation,
        children: extra_data.children
      };
    } else if (role === 'authority' && extra_data) {
      userData.authorityInfo = {
        department: extra_data.department,
        position: extra_data.position,
        badgeNumber: extra_data.badgeNumber,
        jurisdiction: extra_data.jurisdiction,
        clearanceLevel: extra_data.clearanceLevel
      };
    } else if (role === 'institution' && extra_data) {
      userData.institutionInfo = {
        institutionName: extra_data.institutionName,
        institutionType: extra_data.institutionType,
        registrationNumber: extra_data.registrationNumber,
        establishedYear: extra_data.establishedYear,
        capacity: extra_data.capacity,
        contactPerson: extra_data.contactPerson
      };
    }

    // Add address if provided
    if (extra_data?.address) {
      userData.address = extra_data.address;
    }

    // Try backend registration first
    try {
      const response = await authUtils.register(userData);
      const authData = {
        user: response.user,
        token: response.token,
        registeredAt: new Date().toISOString(),
        method: 'backend'
      };
      saveAuthData(authData);
      return { user: response.user, token: response.token };
    } catch (backendError) {
      console.warn('Backend registration failed, falling back to local storage:', backendError);
      
      // Fallback to local storage
      const users = load()
      if (username && users.some((u) => u.username === username)) {
        const err = new Error('User already exists (username)')
        err.code = 409
        throw err
      }
      if (email && users.some((u) => u.email === email)) {
        const err = new Error('User already exists (email)')
        err.code = 409
        throw err
      }
      
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
      const created_at = new Date().toISOString()
      const record = { 
        id, 
        full_name, 
        firstName,
        lastName,
        role, 
        username: username || null, 
        email: email || null, 
        phone: phone || null, 
        password, 
        extra_data, 
        created_at 
      }
      users.push(record)
      save(users)
      
      const { password: _omit, ...safe } = record
      const authData = {
        user: safe,
        token: 'local-' + id,
        registeredAt: created_at,
        method: 'local'
      };
      saveAuthData(authData);
      return { user: safe, token: 'local-' + id }
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Enhanced login function with backend integration
export async function loginLocal({ role, username, email, phone, password }) {
  try {
    // Try backend login first
    try {
      const credentials = {
        email: email || `${username}@example.com`,
        password
      };
      
      const response = await authUtils.login(credentials);
      
      // Verify role matches
      if (response.user.role !== role) {
        throw new Error('Role mismatch');
      }
      
      const authData = {
        user: response.user,
        token: response.token,
        loginAt: new Date().toISOString(),
        method: 'backend'
      };
      saveAuthData(authData);
      
      return { user: response.user, token: response.token };
    } catch (backendError) {
      console.warn('Backend login failed, falling back to local storage:', backendError);
      
      // Fallback to local storage
      const users = load()
      const match = users.find((u) => {
        if (u.role !== role) return false
        if (username) return u.username === username
        if (email) return u.email === email
        if (phone) return u.phone === phone
        return false
      })
      
      if (!match) throw new Error('Invalid credentials')
      if ((match.password || '') !== (password || '')) throw new Error('Invalid credentials')
      
      const { password: _omit, ...safe } = match
      const authData = {
        user: safe,
        token: 'local-' + match.id,
        loginAt: new Date().toISOString(),
        method: 'local'
      };
      saveAuthData(authData);
      
      return { user: safe, token: 'local-' + match.id }
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Get current authenticated user
export function getCurrentUser() {
  const authData = loadAuthData();
  if (authData?.method === 'backend') {
    return authUtils.getUserInfo();
  }
  return authData?.user || null;
}

// Check if user is authenticated
export function isAuthenticated() {
  const authData = loadAuthData();
  return !!(authData?.token);
}

// Logout function
export async function logout() {
  try {
    const authData = loadAuthData();
    if (authData?.method === 'backend') {
      await apiService.logout();
    }
  } catch (error) {
    console.warn('Backend logout failed:', error);
  } finally {
    // Clear local auth data
    localStorage.removeItem(AUTH_KEY);
    apiService.setToken(null);
  }
}

// Get auth token
export function getAuthToken() {
  const authData = loadAuthData();
  return authData?.token || null;
}

// Enhanced auth utils
export const auth = {
  register: registerLocal,
  login: loginLocal,
  logout,
  getCurrentUser,
  isAuthenticated,
  getAuthToken,
  hasRole: (role) => {
    const user = getCurrentUser();
    return user?.role === role;
  }
};

export default auth;