import { Request, Response } from 'express';
import { pool } from '../config/database';
import { sendTemplatedEmail } from '../services/emailService';

// Bulk update application status
export const bulkUpdateStatus = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const { application_ids, status } = req.body;

    if (!Array.isArray(application_ids) || application_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'application_ids must be a non-empty array'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Convert all IDs to integers
    const ids = application_ids.map(id => parseInt(id.toString())).filter(id => !isNaN(id));
    
    if (ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid application IDs provided'
      });
    }

    // Create placeholders for IN clause
    const placeholders = ids.map(() => '?').join(',');

    // Update applications
    const [result] = await connection.execute(
      `UPDATE internship_applications 
       SET application_status = ?, updated_at = NOW() 
       WHERE id IN (${placeholders})`,
      [status, ...ids]
    );

    const affectedRows = (result as any).affectedRows;

    // Send status update emails to applicants
    try {
      const [applications] = await connection.execute(
        `SELECT a.*, i.title as internship_title 
         FROM internship_applications a
         JOIN internships i ON a.internship_id = i.id
         WHERE a.id IN (${placeholders})`,
        ids
      );

      const statusMessages: Record<string, string> = {
        pending: 'Your application is pending review.',
        reviewed: 'Your application has been reviewed and is under consideration.',
        shortlisted: 'Congratulations! You have been shortlisted for the next round.',
        accepted: 'Congratulations! Your application has been accepted. We will contact you soon with next steps.',
        rejected: 'Thank you for your interest. Unfortunately, we are unable to proceed with your application at this time.',
      };

      // Send emails (don't wait for all to complete)
      if (Array.isArray(applications)) {
        applications.forEach(async (application: any) => {
          try {
            await sendTemplatedEmail('application_status_update', application.email, {
              applicant_name: `${application.first_name} ${application.last_name}`,
              internship_title: application.internship_title,
              status: status.charAt(0).toUpperCase() + status.slice(1),
              message: statusMessages[status] || '',
            });
          } catch (emailError) {
            console.error(`Error sending email to ${application.email}:`, emailError);
          }
        });
      }
    } catch (emailError) {
      console.error('Error sending bulk status update emails:', emailError);
      // Don't fail the request if emails fail
    }

    res.json({
      success: true,
      message: `Successfully updated ${affectedRows} application(s) to ${status}`,
      data: {
        updated_count: affectedRows,
        status: status
      }
    });

  } catch (error) {
    console.error('Error bulk updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Bulk delete applications
export const bulkDeleteApplications = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const { application_ids } = req.body;

    if (!Array.isArray(application_ids) || application_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'application_ids must be a non-empty array'
      });
    }

    // Convert all IDs to integers
    const ids = application_ids.map(id => parseInt(id.toString())).filter(id => !isNaN(id));
    
    if (ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid application IDs provided'
      });
    }

    // Create placeholders for IN clause
    const placeholders = ids.map(() => '?').join(',');

    // Delete applications
    const [result] = await connection.execute(
      `DELETE FROM internship_applications WHERE id IN (${placeholders})`,
      ids
    );

    const affectedRows = (result as any).affectedRows;

    res.json({
      success: true,
      message: `Successfully deleted ${affectedRows} application(s)`,
      data: {
        deleted_count: affectedRows
      }
    });

  } catch (error) {
    console.error('Error bulk deleting applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

