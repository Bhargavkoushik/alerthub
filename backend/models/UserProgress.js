import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Overall Progress
  overallScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Quiz Progress
  quizStats: {
    totalQuizzes: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 }, // in minutes
    streakDays: { type: Number, default: 0 },
    lastQuizDate: { type: Date },
    categoriesCompleted: [{
      category: { type: String },
      completedAt: { type: Date },
      bestScore: { type: Number }
    }]
  },
  
  // Emergency Kit Progress
  kitProgress: {
    totalKits: { type: Number, default: 0 },
    completedKits: { type: Number, default: 0 },
    averageCompletion: { type: Number, default: 0 },
    lastUpdated: { type: Date }
  },
  
  // Learning Modules Progress
  modules: [{
    moduleId: { type: String, required: true },
    moduleName: { type: String, required: true },
    category: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    timeSpent: { type: Number, default: 0 }, // in minutes
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    lastAccessedAt: { type: Date, default: Date.now }
  }],
  
  // Activity Tracking
  activityLog: [{
    action: {
      type: String,
      required: true,
      enum: ['quiz_completed', 'module_started', 'module_completed', 'kit_updated', 'login', 'profile_updated']
    },
    details: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Achievements and Badges
  achievements: [{
    badgeId: { type: String, required: true },
    badgeName: { type: String, required: true },
    description: { type: String },
    earnedAt: { type: Date, default: Date.now },
    category: { type: String }
  }],
  
  // Goals and Targets
  goals: [{
    goalType: {
      type: String,
      enum: ['quiz_score', 'module_completion', 'kit_completion', 'weekly_activity'],
      required: true
    },
    target: { type: Number, required: true },
    current: { type: Number, default: 0 },
    deadline: { type: Date },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date }
  }],
  
  // Statistics
  stats: {
    loginStreak: { type: Number, default: 0 },
    totalLoginDays: { type: Number, default: 0 },
    lastLoginDate: { type: Date },
    totalTimeSpent: { type: Number, default: 0 }, // in minutes
    favoriteCategory: { type: String },
    weeklyProgress: { type: Number, default: 0 },
    monthlyProgress: { type: Number, default: 0 }
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better performance
userProgressSchema.index({ userId: 1 });
userProgressSchema.index({ 'stats.lastLoginDate': -1 });

// Method to update overall score
userProgressSchema.methods.updateOverallScore = function() {
  const quizWeight = 0.4;
  const moduleWeight = 0.4;
  const kitWeight = 0.2;
  
  const quizScore = this.quizStats.averageScore || 0;
  const moduleScore = this.modules.length > 0 ? 
    this.modules.reduce((sum, mod) => sum + mod.progress, 0) / this.modules.length : 0;
  const kitScore = this.kitProgress.averageCompletion || 0;
  
  this.overallScore = Math.round(
    (quizScore * quizWeight) + 
    (moduleScore * moduleWeight) + 
    (kitScore * kitWeight)
  );
  
  this.lastUpdated = Date.now();
};

// Method to add activity
userProgressSchema.methods.addActivity = function(action, details = {}) {
  this.activityLog.push({
    action,
    details,
    timestamp: new Date()
  });
  
  // Keep only last 100 activities
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }
  
  this.lastUpdated = Date.now();
};

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export default UserProgress;