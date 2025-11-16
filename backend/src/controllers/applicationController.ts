import { Request, Response } from 'express';
import { pool } from '../config/database';
import { InternshipApplication } from '../types';
import { sendTemplatedEmail } from '../services/emailService';

// Submit application (public)
export const submitApplication = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const applicationData: InternshipApplication = req.body;
    
    const [internshipCheck] = await connection.execute(
      'SELECT id FROM internships WHERE id = ? AND is_active = TRUE AND application_deadline >= CURDATE()',
      [applicationData.internshipId]
    );
    
    if (!Array.isArray(internshipCheck) || internshipCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Internship not found or no longer accepting applications'
      });
    }
    
    const [existingApplications] = await connection.execute(
      'SELECT id FROM internship_applications WHERE email = ? AND internship_id = ?',
      [applicationData.email, applicationData.internshipId]
    );
    
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
    const applicationId = (result as any).insertId;
    
    // Send confirmation email to applicant
    try {
      // Get internship details for email
      const [internships] = await connection.execute(
        'SELECT title, department FROM internships WHERE id = ?',
        [applicationData.internshipId]
      );
      
      if (Array.isArray(internships) && internships.length > 0) {
        const internship = internships[0] as any;
        await sendTemplatedEmail('application_submitted', applicationData.email, {
          applicant_name: `${applicationData.firstName} ${applicationData.lastName}`,
          internship_title: internship.title,
          department: internship.department,
          application_id: applicationId.toString(),
        });
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if email fails
    }
    
    // Send notification email to admins
    try {
      const [admins] = await connection.execute(
        "SELECT email FROM admins WHERE is_active = TRUE AND role = 'super_admin'"
      );
      
      if (Array.isArray(admins) && admins.length > 0) {
        const adminEmails = (admins as any[]).map(a => a.email).join(',');
        const [internships] = await connection.execute(
          'SELECT title FROM internships WHERE id = ?',
          [applicationData.internshipId]
        );
        
        if (Array.isArray(internships) && internships.length > 0) {
          const internship = internships[0] as any;
          await sendTemplatedEmail('new_application_notification', adminEmails, {
            internship_title: internship.title,
            applicant_name: `${applicationData.firstName} ${applicationData.lastName}`,
            applicant_email: applicationData.email,
            university: applicationData.university,
            major: applicationData.major,
          });
        }
      }
    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: applicationId
    });
    
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Admin: Get applications for a specific internship
export const getApplicationsByInternship = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const internshipId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    if (isNaN(internshipId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid internship ID'
      });
    }
    
    // Get total count
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM internship_applications WHERE internship_id = ?',
      [internshipId]
    );
    const total = (countResult as any)[0].total;
    
    // Get applications with pagination
    const [applications] = await connection.execute(
      `SELECT a.*, i.title as internship_title 
       FROM internship_applications a
       JOIN internships i ON a.internship_id = i.id
       WHERE a.internship_id = ?
       ORDER BY a.created_at DESC 
       LIMIT ${limit} OFFSET ${offset}`,
      [internshipId]
    );
    
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
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Admin: Get all applications with filtering
export const getAllApplications = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const limitNum = Number(limit);
    const offsetNum = Number(offset);
    const internshipId = req.query.internship_id ? parseInt(req.query.internship_id as string) : null;
    const status = req.query.status as string || null;
    const search = req.query.search as string || null;
    const dateFrom = req.query.date_from as string || null;
    const dateTo = req.query.date_to as string || null;
    
    // Build WHERE clause
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    
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
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total 
       FROM internship_applications a
       ${whereClause}`,
      queryParams
    );
    const total = (countResult as any)[0].total;
    
    // Get applications with pagination and internship details
    const [applications] = await connection.execute(
      `SELECT a.*, i.title as internship_title, i.department
       FROM internship_applications a
       JOIN internships i ON a.internship_id = i.id
       ${whereClause}
       ORDER BY a.created_at DESC 
       LIMIT ${limitNum} OFFSET ${offsetNum}`,
      queryParams
    );
    
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
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Admin: Get single application
export const getApplicationById = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const applicationId = parseInt(req.params.id);
    
    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }
    
    const [applications] = await connection.execute(
      `SELECT a.*, i.title as internship_title, i.department, i.description as internship_description
       FROM internship_applications a
       JOIN internships i ON a.internship_id = i.id
       WHERE a.id = ?`,
      [applicationId]
    );
    
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
    
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Admin: Update application status
export const updateApplicationStatus = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
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
    
    const [result] = await connection.execute(
      'UPDATE internship_applications SET application_status = ?, updated_at = NOW() WHERE id = ?',
      [status, applicationId]
    );
    
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Send status update email to applicant
    try {
      const [applications] = await connection.execute(
        `SELECT a.*, i.title as internship_title 
         FROM internship_applications a
         JOIN internships i ON a.internship_id = i.id
         WHERE a.id = ?`,
        [applicationId]
      );
      
      if (Array.isArray(applications) && applications.length > 0) {
        const application = applications[0] as any;
        const statusMessages: Record<string, string> = {
          pending: 'Your application is pending review.',
          reviewed: 'Your application has been reviewed and is under consideration.',
          shortlisted: 'Congratulations! You have been shortlisted for the next round.',
          accepted: 'Congratulations! Your application has been accepted. We will contact you soon with next steps.',
          rejected: 'Thank you for your interest. Unfortunately, we are unable to proceed with your application at this time.',
        };
        
        await sendTemplatedEmail('application_status_update', application.email, {
          applicant_name: `${application.first_name} ${application.last_name}`,
          internship_title: application.internship_title,
          status: status.charAt(0).toUpperCase() + status.slice(1),
          message: statusMessages[status] || '',
        });
      }
    } catch (emailError) {
      console.error('Error sending status update email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.json({
      success: true,
      message: 'Application status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Admin: Delete application
export const deleteApplication = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const applicationId = parseInt(req.params.id);
    
    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }
    
    const [result] = await connection.execute(
      'DELETE FROM internship_applications WHERE id = ?',
      [applicationId]
    );
    
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

