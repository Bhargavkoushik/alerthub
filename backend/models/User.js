import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxLength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxLength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  
  // Role-based Information
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['student', 'teacher', 'parent', 'authority', 'institution'],
      message: 'Role must be one of: student, teacher, parent, authority, institution'
    }
  },
  
  // Contact Information
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  
  // Address Information
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' }
  },
  
  // Student-specific fields
  studentInfo: {
    dateOfBirth: { type: Date },
    grade: { type: String, trim: true },
    schoolName: { type: String, trim: true },
    studentId: { type: String, trim: true },
    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phoneNumber: { type: String, trim: true }
    }
  },
  
  // Teacher-specific fields
  teacherInfo: {
    employeeId: { type: String, trim: true },
    schoolName: { type: String, trim: true },
    subjects: [{ type: String, trim: true }],
    grades: [{ type: String, trim: true }],
    qualification: { type: String, trim: true },
    experienceYears: { type: Number, min: 0 }
  },
  
  // Parent-specific fields
  parentInfo: {
    occupation: { type: String, trim: true },
    children: [{
      name: { type: String, trim: true },
      age: { type: Number, min: 0, max: 25 },
      grade: { type: String, trim: true },
      schoolName: { type: String, trim: true }
    }]
  },
  
  // Authority-specific fields
  authorityInfo: {
    department: { type: String, trim: true },
    position: { type: String, trim: true },
    badgeNumber: { type: String, trim: true },
    jurisdiction: { type: String, trim: true },
    clearanceLevel: {
      type: String,
      enum: ['basic', 'intermediate', 'advanced', 'admin'],
      default: 'basic'
    }
  },
  
  // Institution-specific fields
  institutionInfo: {
    institutionName: { type: String, trim: true },
    institutionType: {
      type: String,
      enum: ['school', 'college', 'university', 'government', 'ngo', 'corporate'],
      trim: true
    },
    registrationNumber: { type: String, trim: true },
    establishedYear: { type: Number, min: 1800, max: new Date().getFullYear() },
    capacity: { type: Number, min: 1 },
    contactPerson: {
      name: { type: String, trim: true },
      designation: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true }
    }
  },
  
  // Profile and Settings
  profilePicture: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Asia/Kolkata' }
  },
  
  // Security
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  loginAttempts: { type: Number, default: 0, select: false },
  lockUntil: { type: Date, select: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.emailVerificationToken;
  delete userObj.emailVerificationExpires;
  delete userObj.passwordResetToken;
  delete userObj.passwordResetExpires;
  delete userObj.loginAttempts;
  delete userObj.lockUntil;
  return userObj;
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role: role, isActive: true });
};

const User = mongoose.model('User', userSchema);

export default User;