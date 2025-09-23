import Joi from 'joi';

// User registration validation schemas
const registerStudentSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  role: Joi.string().valid('student').required(),
  studentInfo: Joi.object({
    dateOfBirth: Joi.date().max('now').optional(),
    grade: Joi.string().trim().optional(),
    schoolName: Joi.string().trim().optional(),
    studentId: Joi.string().trim().optional(),
    emergencyContact: Joi.object({
      name: Joi.string().trim().optional(),
      relationship: Joi.string().trim().optional(),
      phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional()
    }).optional()
  }).optional(),
  address: Joi.object({
    street: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    zipCode: Joi.string().trim().optional(),
    country: Joi.string().trim().optional()
  }).optional()
});

const registerTeacherSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  role: Joi.string().valid('teacher').required(),
  teacherInfo: Joi.object({
    employeeId: Joi.string().trim().optional(),
    schoolName: Joi.string().trim().optional(),
    subjects: Joi.array().items(Joi.string().trim()).optional(),
    grades: Joi.array().items(Joi.string().trim()).optional(),
    qualification: Joi.string().trim().optional(),
    experienceYears: Joi.number().min(0).optional()
  }).optional(),
  address: Joi.object({
    street: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    zipCode: Joi.string().trim().optional(),
    country: Joi.string().trim().optional()
  }).optional()
});

const registerParentSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  role: Joi.string().valid('parent').required(),
  parentInfo: Joi.object({
    occupation: Joi.string().trim().optional(),
    children: Joi.array().items(Joi.object({
      name: Joi.string().trim().required(),
      age: Joi.number().min(0).max(25).required(),
      grade: Joi.string().trim().optional(),
      schoolName: Joi.string().trim().optional()
    })).optional()
  }).optional(),
  address: Joi.object({
    street: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    zipCode: Joi.string().trim().optional(),
    country: Joi.string().trim().optional()
  }).optional()
});

const registerAuthoritySchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  role: Joi.string().valid('authority').required(),
  authorityInfo: Joi.object({
    department: Joi.string().trim().optional(),
    position: Joi.string().trim().optional(),
    badgeNumber: Joi.string().trim().optional(),
    jurisdiction: Joi.string().trim().optional(),
    clearanceLevel: Joi.string().valid('basic', 'intermediate', 'advanced', 'admin').optional()
  }).optional(),
  address: Joi.object({
    street: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    zipCode: Joi.string().trim().optional(),
    country: Joi.string().trim().optional()
  }).optional()
});

const registerInstitutionSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
  role: Joi.string().valid('institution').required(),
  institutionInfo: Joi.object({
    institutionName: Joi.string().trim().required(),
    institutionType: Joi.string().valid('school', 'college', 'university', 'government', 'ngo', 'corporate').required(),
    registrationNumber: Joi.string().trim().optional(),
    establishedYear: Joi.number().min(1800).max(new Date().getFullYear()).optional(),
    capacity: Joi.number().min(1).optional(),
    contactPerson: Joi.object({
      name: Joi.string().trim().optional(),
      designation: Joi.string().trim().optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional()
    }).optional()
  }).required(),
  address: Joi.object({
    street: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    zipCode: Joi.string().trim().optional(),
    country: Joi.string().trim().optional()
  }).optional()
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Quiz result validation schema
const quizResultSchema = Joi.object({
  quizType: Joi.string().valid('disaster-preparedness', 'emergency-response', 'safety-quiz', 'general-knowledge').required(),
  category: Joi.string().valid('earthquake', 'flood', 'fire', 'hurricane', 'tornado', 'tsunami', 'general').required(),
  score: Joi.number().min(0).max(100).required(),
  totalQuestions: Joi.number().min(1).required(),
  correctAnswers: Joi.number().min(0).required(),
  timeSpent: Joi.number().min(0).required(),
  answers: Joi.array().items(Joi.object({
    questionId: Joi.string().required(),
    questionText: Joi.string().required(),
    selectedAnswer: Joi.string().required(),
    correctAnswer: Joi.string().required(),
    isCorrect: Joi.boolean().required(),
    timeSpent: Joi.number().min(0).optional()
  })).required(),
  difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').optional()
});

// Emergency kit validation schema
const emergencyKitSchema = Joi.object({
  kitName: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  items: Joi.array().items(Joi.object({
    name: Joi.string().trim().required(),
    category: Joi.string().valid('food', 'water', 'medical', 'tools', 'clothing', 'documents', 'communication', 'lighting', 'other').required(),
    quantity: Joi.number().min(1).required(),
    unit: Joi.string().optional(),
    isCompleted: Joi.boolean().optional(),
    priority: Joi.string().valid('high', 'medium', 'low').optional(),
    notes: Joi.string().trim().optional()
  })).required(),
  templateType: Joi.string().valid('home', 'office', 'car', 'school', 'custom').optional()
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    next();
  };
};

// Role-specific registration validation
export const validateRegistration = (req, res, next) => {
  const { role } = req.body;
  
  let schema;
  switch (role) {
    case 'student':
      schema = registerStudentSchema;
      break;
    case 'teacher':
      schema = registerTeacherSchema;
      break;
    case 'parent':
      schema = registerParentSchema;
      break;
    case 'authority':
      schema = registerAuthoritySchema;
      break;
    case 'institution':
      schema = registerInstitutionSchema;
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
  }
  
  return validate(schema)(req, res, next);
};

export const validateLogin = validate(loginSchema);
export const validateQuizResult = validate(quizResultSchema);
export const validateEmergencyKit = validate(emergencyKitSchema);

export default {
  validateRegistration,
  validateLogin,
  validateQuizResult,
  validateEmergencyKit,
  validate
};