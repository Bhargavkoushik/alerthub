import express from 'express';
import QuizResult from '../models/QuizResult.js';
import EmergencyKit from '../models/EmergencyKit.js';
import UserProgress from '../models/UserProgress.js';
import { authenticate, authorize, authorizeOwnerOrAdmin } from '../middleware/auth.js';
import { validateQuizResult, validateEmergencyKit } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ===== QUIZ RESULTS =====

// Submit quiz result
router.post('/quiz-results', validateQuizResult, async (req, res) => {
  try {
    const quizData = {
      ...req.body,
      userId: req.user._id
    };
    
    const quizResult = new QuizResult(quizData);
    await quizResult.save();
    
    // Update user progress
    const userProgress = await UserProgress.findOne({ userId: req.user._id });
    if (userProgress) {
      // Update quiz stats
      userProgress.quizStats.totalQuizzes += 1;
      userProgress.quizStats.totalTimeSpent += Math.ceil(quizData.timeSpent / 60); // convert to minutes
      userProgress.quizStats.lastQuizDate = new Date();
      
      // Update average score
      const allQuizzes = await QuizResult.find({ userId: req.user._id });
      const averageScore = allQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / allQuizzes.length;
      userProgress.quizStats.averageScore = Math.round(averageScore);
      
      // Update best score
      const bestScore = Math.max(...allQuizzes.map(quiz => quiz.score));
      userProgress.quizStats.bestScore = bestScore;
      
      // Add activity and update overall score
      userProgress.addActivity('quiz_completed', {
        category: quizData.category,
        score: quizData.score,
        quizType: quizData.quizType
      });
      
      userProgress.updateOverallScore();
      await userProgress.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Quiz result submitted successfully',
      data: quizResult
    });
    
  } catch (error) {
    console.error('Submit quiz result error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's quiz results
router.get('/quiz-results', async (req, res) => {
  try {
    const { category, limit = 10, page = 1 } = req.query;
    
    let query = { userId: req.user._id };
    if (category) {
      query.category = category;
    }
    
    const quizResults = await QuizResult.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await QuizResult.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        quizResults,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get quiz statistics
router.get('/quiz-stats', async (req, res) => {
  try {
    const userProgress = await UserProgress.findOne({ userId: req.user._id });
    
    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }
    
    // Get recent quiz results for detailed stats
    const recentQuizzes = await QuizResult.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Calculate category-wise performance
    const categoryStats = await QuizResult.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$category',
          averageScore: { $avg: '$score' },
          totalQuizzes: { $sum: 1 },
          bestScore: { $max: '$score' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overall: userProgress.quizStats,
        recent: recentQuizzes,
        categoryBreakdown: categoryStats
      }
    });
    
  } catch (error) {
    console.error('Get quiz stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ===== EMERGENCY KITS =====

// Create emergency kit
router.post('/emergency-kits', validateEmergencyKit, async (req, res) => {
  try {
    const kitData = {
      ...req.body,
      userId: req.user._id
    };
    
    const emergencyKit = new EmergencyKit(kitData);
    await emergencyKit.save();
    
    // Update user progress
    const userProgress = await UserProgress.findOne({ userId: req.user._id });
    if (userProgress) {
      userProgress.kitProgress.totalKits += 1;
      userProgress.kitProgress.lastUpdated = new Date();
      
      // Recalculate kit progress
      const allKits = await EmergencyKit.find({ userId: req.user._id });
      const completedKits = allKits.filter(kit => kit.completionPercentage === 100).length;
      const averageCompletion = allKits.reduce((sum, kit) => sum + kit.completionPercentage, 0) / allKits.length;
      
      userProgress.kitProgress.completedKits = completedKits;
      userProgress.kitProgress.averageCompletion = Math.round(averageCompletion);
      
      userProgress.updateOverallScore();
      await userProgress.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Emergency kit created successfully',
      data: emergencyKit
    });
    
  } catch (error) {
    console.error('Create emergency kit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's emergency kits
router.get('/emergency-kits', async (req, res) => {
  try {
    const kits = await EmergencyKit.find({ userId: req.user._id })
      .sort({ lastUpdated: -1 });
    
    res.status(200).json({
      success: true,
      data: kits
    });
    
  } catch (error) {
    console.error('Get emergency kits error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update emergency kit
router.put('/emergency-kits/:id', async (req, res) => {
  try {
    const kit = await EmergencyKit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!kit) {
      return res.status(404).json({
        success: false,
        message: 'Emergency kit not found'
      });
    }
    
    // Update user progress
    const userProgress = await UserProgress.findOne({ userId: req.user._id });
    if (userProgress) {
      userProgress.addActivity('kit_updated', { kitId: kit._id, kitName: kit.kitName });
      
      // Recalculate kit progress
      const allKits = await EmergencyKit.find({ userId: req.user._id });
      const completedKits = allKits.filter(kit => kit.completionPercentage === 100).length;
      const averageCompletion = allKits.reduce((sum, kit) => sum + kit.completionPercentage, 0) / allKits.length;
      
      userProgress.kitProgress.completedKits = completedKits;
      userProgress.kitProgress.averageCompletion = Math.round(averageCompletion);
      userProgress.kitProgress.lastUpdated = new Date();
      
      userProgress.updateOverallScore();
      await userProgress.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Emergency kit updated successfully',
      data: kit
    });
    
  } catch (error) {
    console.error('Update emergency kit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete emergency kit
router.delete('/emergency-kits/:id', async (req, res) => {
  try {
    const kit = await EmergencyKit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!kit) {
      return res.status(404).json({
        success: false,
        message: 'Emergency kit not found'
      });
    }
    
    // Update user progress
    const userProgress = await UserProgress.findOne({ userId: req.user._id });
    if (userProgress) {
      userProgress.kitProgress.totalKits = Math.max(0, userProgress.kitProgress.totalKits - 1);
      
      // Recalculate kit progress
      const allKits = await EmergencyKit.find({ userId: req.user._id });
      if (allKits.length > 0) {
        const completedKits = allKits.filter(kit => kit.completionPercentage === 100).length;
        const averageCompletion = allKits.reduce((sum, kit) => sum + kit.completionPercentage, 0) / allKits.length;
        
        userProgress.kitProgress.completedKits = completedKits;
        userProgress.kitProgress.averageCompletion = Math.round(averageCompletion);
      } else {
        userProgress.kitProgress.completedKits = 0;
        userProgress.kitProgress.averageCompletion = 0;
      }
      
      userProgress.kitProgress.lastUpdated = new Date();
      userProgress.updateOverallScore();
      await userProgress.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Emergency kit deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete emergency kit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ===== USER PROGRESS =====

// Get user progress
router.get('/progress', async (req, res) => {
  try {
    let userProgress = await UserProgress.findOne({ userId: req.user._id });
    
    if (!userProgress) {
      // Create initial progress record if not exists
      userProgress = new UserProgress({ userId: req.user._id });
      await userProgress.save();
    }
    
    res.status(200).json({
      success: true,
      data: userProgress
    });
    
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const userProgress = await UserProgress.findOne({ userId: req.user._id });
    const totalQuizzes = await QuizResult.countDocuments({ userId: req.user._id });
    const totalKits = await EmergencyKit.countDocuments({ userId: req.user._id });
    const recentQuiz = await QuizResult.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    
    const summary = {
      overallScore: userProgress?.overallScore || 0,
      totalQuizzes,
      totalKits,
      averageQuizScore: userProgress?.quizStats.averageScore || 0,
      kitCompletion: userProgress?.kitProgress.averageCompletion || 0,
      recentActivity: userProgress?.activityLog.slice(-5) || [],
      recentQuiz: recentQuiz || null,
      achievements: userProgress?.achievements.length || 0
    };
    
    res.status(200).json({
      success: true,
      data: summary
    });
    
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;