import { Request, Response } from 'express';
import { pool } from '../config/database';

// Admin Dashboard - Get Metrics
export const getDashboardMetrics = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    // Get total active internships
    const [activeInternships] = await connection.execute(
      'SELECT COUNT(*) as count FROM internships WHERE is_active = TRUE'
    );
    
    // Get total applications
    const [totalApplications] = await connection.execute(
      'SELECT COUNT(*) as count FROM internship_applications'
    );
    
    // Get pending applications
    const [pendingApplications] = await connection.execute(
      "SELECT COUNT(*) as count FROM internship_applications WHERE application_status = 'pending'"
    );
    
    // Get applications this week
    const [thisWeekApplications] = await connection.execute(
      `SELECT COUNT(*) as count FROM internship_applications 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );
    
    // Get applications this month
    const [thisMonthApplications] = await connection.execute(
      `SELECT COUNT(*) as count FROM internship_applications 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    
    // Get applications by status
    const [statusBreakdown] = await connection.execute(
      `SELECT application_status, COUNT(*) as count 
       FROM internship_applications 
       GROUP BY application_status`
    );
    
    // Get recent applications (last 10)
    const [recentApplications] = await connection.execute(
      `SELECT a.*, i.title as internship_title 
       FROM internship_applications a
       JOIN internships i ON a.internship_id = i.id
       ORDER BY a.created_at DESC 
       LIMIT 10`
    );
    
    res.json({
      success: true,
      data: {
        metrics: {
          totalActiveInternships: (activeInternships as any)[0].count,
          totalApplications: (totalApplications as any)[0].count,
          pendingApplications: (pendingApplications as any)[0].count,
          thisWeekApplications: (thisWeekApplications as any)[0].count,
          thisMonthApplications: (thisMonthApplications as any)[0].count,
          statusBreakdown: statusBreakdown,
        },
        recentApplications: recentApplications
      }
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

