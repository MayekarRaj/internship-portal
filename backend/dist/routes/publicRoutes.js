"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const internshipController_1 = require("../controllers/internshipController");
const applicationController_1 = require("../controllers/applicationController");
const validation_1 = require("../middleware/validation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});
// Public internship routes
router.get('/internships', internshipController_1.getInternships);
router.get('/internships/:id', internshipController_1.getInternshipById);
// Public application routes
router.post('/applications', rateLimiter_1.applicationLimiter, validation_1.validateApplication, validation_1.handleValidationErrors, applicationController_1.submitApplication);
exports.default = router;
