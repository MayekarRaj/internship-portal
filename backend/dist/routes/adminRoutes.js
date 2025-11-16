"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const authController_1 = require("../controllers/authController");
const internshipController_1 = require("../controllers/internshipController");
const applicationController_1 = require("../controllers/applicationController");
const dashboardController_1 = require("../controllers/dashboardController");
const router = (0, express_1.Router)();
// Admin authentication routes (no auth required)
router.post('/auth/login', authController_1.loginAdmin);
router.get('/auth/me', auth_1.authenticateAdmin, authController_1.getCurrentAdmin);
router.post('/auth/logout', auth_1.authenticateAdmin, authController_1.logoutAdmin);
// Admin dashboard
router.get('/dashboard', auth_1.authenticateAdmin, dashboardController_1.getDashboardMetrics);
// Admin internship routes
router.get('/internships', auth_1.authenticateAdmin, internshipController_1.getAllInternships);
router.get('/internships/:id', auth_1.authenticateAdmin, internshipController_1.getInternshipByIdAdmin);
router.post('/internships', auth_1.authenticateAdmin, internshipController_1.createInternship);
router.put('/internships/:id', auth_1.authenticateAdmin, internshipController_1.updateInternship);
router.delete('/internships/:id', auth_1.authenticateAdmin, internshipController_1.deleteInternship);
router.patch('/internships/:id/status', auth_1.authenticateAdmin, internshipController_1.toggleInternshipStatus);
// Admin application routes
router.get('/applications', auth_1.authenticateAdmin, applicationController_1.getAllApplications);
router.get('/applications/:id', auth_1.authenticateAdmin, applicationController_1.getApplicationById);
router.get('/internships/:id/applications', auth_1.authenticateAdmin, applicationController_1.getApplicationsByInternship);
router.patch('/applications/:id/status', auth_1.authenticateAdmin, applicationController_1.updateApplicationStatus);
router.delete('/applications/:id', auth_1.authenticateAdmin, applicationController_1.deleteApplication);
exports.default = router;
