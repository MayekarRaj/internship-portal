"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = exports.validateApplication = void 0;
const express_validator_1 = require("express-validator");
// Validation middleware for internship applications
exports.validateApplication = [
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('First name is required and must be less than 100 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Last name is required and must be less than 100 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('phone')
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('university')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('University is required and must be less than 255 characters'),
    (0, express_validator_1.body)('graduationYear')
        .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 10 })
        .withMessage('Please provide a valid graduation year'),
    (0, express_validator_1.body)('major')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Major is required and must be less than 255 characters'),
    (0, express_validator_1.body)('gpa')
        .optional()
        .isFloat({ min: 0, max: 10 })
        .withMessage('GPA must be between 0.0 and 10.0'),
    (0, express_validator_1.body)('motivation')
        .trim()
        .isLength({ min: 20, max: 2000 })
        .withMessage('Motivation is required and must be between 20 and 2000 characters'),
    (0, express_validator_1.body)('projectSubmissionUrl')
        .isURL()
        .withMessage('Please provide a valid project submission URL (GitHub/Google Drive)'),
    (0, express_validator_1.body)('internshipId')
        .isInt({ min: 1 })
        .withMessage('Valid internship ID is required'),
];
// Error handling middleware for validation
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
exports.handleValidationErrors = handleValidationErrors;
