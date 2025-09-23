import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizType: {
    type: String,
    required: true,
    enum: ['disaster-preparedness', 'emergency-response', 'safety-quiz', 'general-knowledge']
  },
  category: {
    type: String,
    required: true,
    enum: ['earthquake', 'flood', 'fire', 'hurricane', 'tornado', 'tsunami', 'general']
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  timeSpent: {
    type: Number, // in seconds
    required: true,
    min: 0
  },
  answers: [{
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    selectedAnswer: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    timeSpent: { type: Number, default: 0 } // time for this question in seconds
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better performance
quizResultSchema.index({ userId: 1, createdAt: -1 });
quizResultSchema.index({ category: 1 });
quizResultSchema.index({ quizType: 1 });

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

export default QuizResult;