import User from '../models/User.js';
import { verifyToken } from '../utils/auth.js';

// Middleware to verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = verifyToken(token);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('+isActive');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. User not found.'
        });
      }
      
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated.'
        });
      }
      
      // Add user to request object
      req.user = user;
      next();
      
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Middleware to check if user has required role(s)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    
    next();
  };
};

// Middleware to check if user can access their own data or is admin
export const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }
  
  const requestedUserId = req.params.userId || req.params.id;
  const currentUserId = req.user._id.toString();
  
  // Allow if user is accessing their own data or is an authority
  if (currentUserId === requestedUserId || req.user.role === 'authority') {
    return next();
  }
  
  // For parents, allow access to their children's data
  if (req.user.role === 'parent') {
    // This would need additional logic to check if the requested user is a child of the parent
    // For now, we'll allow it and implement this check in the controller
    return next();
  }
  
  // For teachers, allow access to their students' data
  if (req.user.role === 'teacher') {
    // This would need additional logic to check if the requested user is a student of the teacher
    // For now, we'll allow it and implement this check in the controller
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own data.'
  });
};

// Optional: Middleware to check if user is email verified
export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }
  
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required to access this resource.'
    });
  }
  
  next();
};

// Middleware for admin-only routes
export const requireAdmin = authorize('authority');

// Middleware for teacher or authority access
export const requireTeacherOrAuthority = authorize('teacher', 'authority');

// Middleware for parent access
export const requireParent = authorize('parent');

// Middleware for student access
export const requireStudent = authorize('student');

export default {
  authenticate,
  authorize,
  authorizeOwnerOrAdmin,
  requireEmailVerification,
  requireAdmin,
  requireTeacherOrAuthority,
  requireParent,
  requireStudent
};