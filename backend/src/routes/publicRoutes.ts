import { Router } from 'express';
import { getInternships, getInternshipById } from '../controllers/internshipController';
import { submitApplication } from '../controllers/applicationController';
import { validateApplication, handleValidationErrors } from '../middleware/validation';
import { applicationLimiter } from '../middleware/rateLimiter';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Public internship routes
router.get('/internships', getInternships);
router.get('/internships/:id', getInternshipById);

// Public application routes
router.post(
  '/applications',
  applicationLimiter,
  validateApplication,
  handleValidationErrors,
  submitApplication
);

export default router;

