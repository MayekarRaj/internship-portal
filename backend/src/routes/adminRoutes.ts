import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth';
import {
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin
} from '../controllers/authController';
import {
  getAllInternships,
  getInternshipByIdAdmin,
  createInternship,
  updateInternship,
  deleteInternship,
  toggleInternshipStatus
} from '../controllers/internshipController';
import {
  getAllApplications,
  getApplicationById,
  getApplicationsByInternship,
  updateApplicationStatus,
  deleteApplication
} from '../controllers/applicationController';
import { getDashboardMetrics } from '../controllers/dashboardController';
import {
  createNote,
  getNotes,
  updateNote,
  deleteNote
} from '../controllers/notesController';
import { exportApplications } from '../controllers/exportController';
import {
  bulkUpdateStatus,
  bulkDeleteApplications
} from '../controllers/bulkController';

const router = Router();

// Admin authentication routes (no auth required)
router.post('/auth/login', loginAdmin);
router.get('/auth/me', authenticateAdmin, getCurrentAdmin);
router.post('/auth/logout', authenticateAdmin, logoutAdmin);

// Admin dashboard
router.get('/dashboard', authenticateAdmin, getDashboardMetrics);

// Admin internship routes
router.get('/internships', authenticateAdmin, getAllInternships);
router.get('/internships/:id', authenticateAdmin, getInternshipByIdAdmin);
router.post('/internships', authenticateAdmin, createInternship);
router.put('/internships/:id', authenticateAdmin, updateInternship);
router.delete('/internships/:id', authenticateAdmin, deleteInternship);
router.patch('/internships/:id/status', authenticateAdmin, toggleInternshipStatus);

// Admin application routes
// IMPORTANT: More specific routes must come before parameterized routes
router.get('/applications/export', authenticateAdmin, exportApplications);
router.get('/applications', authenticateAdmin, getAllApplications);
router.get('/applications/:id', authenticateAdmin, getApplicationById);
router.get('/internships/:id/applications', authenticateAdmin, getApplicationsByInternship);
router.patch('/applications/:id/status', authenticateAdmin, updateApplicationStatus);
router.delete('/applications/:id', authenticateAdmin, deleteApplication);

// Admin notes routes
router.post('/applications/:id/notes', authenticateAdmin, createNote);
router.get('/applications/:id/notes', authenticateAdmin, getNotes);
router.put('/notes/:noteId', authenticateAdmin, updateNote);
router.delete('/notes/:noteId', authenticateAdmin, deleteNote);

// Admin bulk operations routes
router.patch('/applications/bulk/status', authenticateAdmin, bulkUpdateStatus);
router.delete('/applications/bulk', authenticateAdmin, bulkDeleteApplications);

export default router;

