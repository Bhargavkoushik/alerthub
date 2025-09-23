import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
    issuer: 'alerthub-api',
    audience: 'alerthub-users'
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'alerthub-api',
      audience: 'alerthub-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Generate random token for email verification
export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Create token response
export const createTokenResponse = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  };
  
  const token = generateToken(payload);
  
  return {
    token,
    user: user.getPublicProfile(),
    expiresIn: process.env.JWT_EXPIRE || '7d'
  };
};

// Password validation
export const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  
  // Optional: require special characters and uppercase
  // if (!hasUpperCase) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }
  
  // if (!hasSpecialChar) {
  //   errors.push('Password must contain at least one special character');
  // }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting helper
export const createRateLimitMessage = (retryAfter) => {
  const minutes = Math.ceil(retryAfter / 60);
  return `Too many login attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
};

export default {
  generateToken,
  verifyToken,
  generateRandomToken,
  createTokenResponse,
  validatePassword,
  createRateLimitMessage
};