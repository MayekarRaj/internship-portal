import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation middleware for internship applications
export const validateApplication = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('university')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('University is required and must be less than 255 characters'),
  
  body('graduationYear')
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 10 })
    .withMessage('Please provide a valid graduation year'),
  
  body('major')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Major is required and must be less than 255 characters'),
  
  body('gpa')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('GPA must be between 0.0 and 10.0'),
  
  body('motivation')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Motivation is required and must be between 20 and 2000 characters'),
  
  body('projectSubmissionUrl')
    .isURL()
    .withMessage('Please provide a valid project submission URL (GitHub/Google Drive)'),
  
  body('internshipId')
    .isInt({ min: 1 })
    .withMessage('Valid internship ID is required'),
];

// Error handling middleware for validation
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        type: error.type,
        message: error.msg,
        errors: errors.array()
      }))
    });
  }
  next();
};

