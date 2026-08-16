import express from 'express';
import {
  register,
  login,
  getMe,
  getDietitians,
  sendOtp,
  verifyOtp,
  registerWithOtp,
  loginWithOtp
} from '../controllers/authController.js';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getClientProfile,
  updateClientProfile
} from '../controllers/patientController.js';
import { submitAssessment, getAssessmentHistory } from '../controllers/assessmentController.js';
import { getFoods, createDietPlan, getDietPlansByPatient, updateDietPlanStatus } from '../controllers/dietController.js';
import { generateClientReport } from '../controllers/aiController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// --- Public Auth Routes (Standard & OTP-based) ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/register-otp', registerWithOtp);
router.post('/auth/login-otp', loginWithOtp);
router.get('/dietitians', getDietitians);

// --- Protected Routes (All Authenticated Users) ---
router.get('/auth/me', authenticateToken, getMe);
router.get('/foods', authenticateToken, getFoods);
router.post('/assessments', authenticateToken, submitAssessment);
router.get('/assessments/:patientId', authenticateToken, getAssessmentHistory);
router.get('/diet-plans/:patientId', authenticateToken, getDietPlansByPatient);

// --- Client Specific Routes ---
router.get('/client/profile', authenticateToken, requireRole('client'), getClientProfile);
router.put('/client/profile', authenticateToken, requireRole('client'), updateClientProfile);

// --- Dietitian Specific Routes ---
router.get('/patients', authenticateToken, requireRole('dietitian'), getAllPatients);
router.get('/patients/:id', authenticateToken, requireRole('dietitian'), getPatientById);
router.post('/patients', authenticateToken, requireRole('dietitian'), createPatient);
router.put('/patients/:id', authenticateToken, requireRole('dietitian'), updatePatient);
router.delete('/patients/:id', authenticateToken, requireRole('dietitian'), deletePatient);

router.post('/diet-plans', authenticateToken, requireRole('dietitian'), createDietPlan);
router.put('/diet-plans/:id/status', authenticateToken, requireRole('dietitian'), updateDietPlanStatus);

// --- AI Integration Route ---
router.get('/ai/analyze-client/:patientId', authenticateToken, requireRole('dietitian'), generateClientReport);

export default router;
