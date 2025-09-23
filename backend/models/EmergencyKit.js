import mongoose from 'mongoose';

const emergencyKitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  kitName: {
    type: String,
    required: true,
    trim: true,
    maxLength: [100, 'Kit name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  items: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['food', 'water', 'medical', 'tools', 'clothing', 'documents', 'communication', 'lighting', 'other']
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      default: 'piece'
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    notes: {
      type: String,
      trim: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    }
  }],
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateType: {
    type: String,
    enum: ['home', 'office', 'car', 'school', 'custom']
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate completion percentage
emergencyKitSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    const completedItems = this.items.filter(item => item.isCompleted).length;
    this.completionPercentage = Math.round((completedItems / this.items.length) * 100);
  } else {
    this.completionPercentage = 0;
  }
  this.lastUpdated = Date.now();
  next();
});

// Index for better performance
emergencyKitSchema.index({ userId: 1 });
emergencyKitSchema.index({ isTemplate: 1 });

const EmergencyKit = mongoose.model('EmergencyKit', emergencyKitSchema);

export default EmergencyKit;