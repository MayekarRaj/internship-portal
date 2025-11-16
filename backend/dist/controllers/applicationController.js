"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteApplication = exports.updateApplicationStatus = exports.getApplicationById = exports.getAllApplications = exports.getApplicationsByInternship = exports.submitApplication = void 0;
const database_1 = require("../config/database");
// Submit application (public)
const submitApplication = async (req, res) => {
    const connection = await database_1.pool.getConnection();
    try {
        const applicationData = req.body;
        const [internshipCheck] = await connection.execute('SELECT id FROM internships WHERE id = ? AND is_active = TRUE AND application_deadline >= CURDATE()', [applicationData.internshipId]);
        if (!Array.isArray(internshipCheck) || internshipCheck.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Internship not found or no longer accepting applications'
            });
        }
        const [existingApplications] = await connection.execute('SELECT id FROM internship_applications WHERE email = ? AND internship_id = ?', [applicationData.email, applicationData.internshipId]);
        if (Array.isArray(existingApplications) && existingApplications.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'You have already applied for this internship'
            });
        }
        const insertQuery = `
      INSERT INTO internship_applications (
        internship_id, first_name, last_name, email, phone, university, graduation_year,
        major, gpa, motivation, project_submission_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const values = [
            applicationData.internshipId,
            applicationData.firstName,
            applicationData.lastName,
            applicationData.email,
            applicationData.phone,
            applicationData.university,
            applicationData.graduationYear,
            applicationData.major,
            applicationData.gpa || null,
            applicationData.motivation,
            applicationData.projectSubmissionUrl
        ];
        const [result] = await connection.execute(insertQuery, values);
        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            applicationId: result.insertId
        });
    }
    catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
    finally {
        connection.release();
    }
};
exports.submitApplication = submitApplication;
// Admin: Get applications for a specific internship
const getApplicationsByInternship = async (req, res) => {
    const connection = await database_1.pool.getConnection();
    try {
        const internshipId = parseInt(req.params.id);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        if (isNaN(internshipId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid internship ID'
            });
        }
        // Get total count
        const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM internship_applications WHERE internship_id = ?', [internshipId]);
        const total = countResult[0].total;
        // Get applications with pagination
        const [applications] = await connection.execute(`SELECT a.*, i.title as internship_title 
       FROM internship_applications a
       JOIN internships i ON a.internship_id = i.id
       WHERE a.internship_id = ?
       ORDER BY a.created_at DESC 
       LIMIT ${limit} OFFSET ${offset}`, [internshipId]);
        res.json({
            success: true,
            data: {
                applications,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
    finally {
        connection.release();
    }
};
exports.getApplicationsByInternship = getApplicationsByInternship;
// Admin: Get all applications with filtering
const getAllApplications = async (req, res) => {
    const connection = await database_1.pool.getConnection();
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const limitNum = Number(limit);
        const offsetNum = Number(offset);
        const internshipId = req.query.internship_id ? parseInt(req.query.internship_id) : null;
        const status = req.query.status || null;
        const search = req.query.search || null;
        const dateFrom = req.query.date_from || null;
        const dateTo = req.query.date_to || null;
        // Build WHERE clause
        let whereConditions = [];
        let queryParams = [];
        if (internshipId) {
            whereConditions.push('a.internship_id = ?');
            queryParams.push(internshipId);
        }
        if (status) {
            whereConditions.push('a.application_status = ?');
            queryParams.push(status);
        }
        if (dateFrom) {
            whereConditions.push('DATE(a.created_at) >= ?');
            queryParams.push(dateFrom);
        }
        if (dateTo) {
            whereConditions.push('DATE(a.created_at) <= ?');
            queryParams.push(dateTo);
        }
        if (search) {
            whereConditions.push('(a.first_name LIKE ? OR a.last_name LIKE ? OR a.email LIKE ? OR a.university LIKE ?)');
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';
        // Get total count
        const [countResult] = await connection.execute(`SELECT COUNT(*) as total 
       FROM internship_applications a
       ${whereClause}`, queryParams);
        const total = countResult[0].total;
        // Get applications with pagination and internship details
        const [applications] = await connection.execute(`SELECT a.*, i.title as internship_title, i.department
       FROM internship_applications a
       JOIN internships i ON a.internship_id = i.id
       ${whereClause}
       ORDER BY a.created_at DESC 
       LIMIT ${limitNum} OFFSET ${offsetNum}`, queryParams);
        res.json({
            success: true,
            data: {
                applications,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
    finally {
        connection.release();
    }
};
exports.getAllApplications = getAllApplications;
// Admin: Get single application
const getApplicationById = async (req, res) => {
    const connection = await database_1.pool.getConnection();
    try {
        const applicationId = parseInt(req.params.id);
        if (isNaN(applicationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID'
            });
        }
        const [applications] = await connection.execute(`SELECT a.*, i.title as internship_title, i.department, i.description as internship_description
       FROM internship_applications a
       JOIN internships i ON a.internship_id = i.id
       WHERE a.id = ?`, [applicationId]);
        if (!Array.isArray(applications) || applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        res.json({
            success: true,
            data: applications[0]
        });
    }
    catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
    finally {
        connection.release();
    }
};
exports.getApplicationById = getApplicationById;
// Admin: Update application status
const updateApplicationStatus = async (req, res) => {
    const connection = await database_1.pool.getConnection();
    try {
        const applicationId = parseInt(req.params.id);
        const { status } = req.body;
        if (isNaN(applicationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID'
            });
        }
        const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }
        const [result] = await connection.execute('UPDATE internship_applications SET application_status = ?, updated_at = NOW() WHERE id = ?', [status, applicationId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        res.json({
            success: true,
            message: 'Application status updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
    finally {
        connection.release();
    }
};
exports.updateApplicationStatus = updateApplicationStatus;
// Admin: Delete application
const deleteApplication = async (req, res) => {
    const connection = await database_1.pool.getConnection();
    try {
        const applicationId = parseInt(req.params.id);
        if (isNaN(applicationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID'
            });
        }
        const [result] = await connection.execute('DELETE FROM internship_applications WHERE id = ?', [applicationId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        res.json({
            success: true,
            message: 'Application deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
    finally {
        connection.release();
    }
};
exports.deleteApplication = deleteApplication;
