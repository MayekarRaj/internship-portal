import { createObjectCsvWriter } from 'csv-writer';
import { pool } from '../config/database';
import path from 'path';
import fs from 'fs';

export interface ExportOptions {
  internshipId?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Export applications to CSV
export const exportApplicationsToCSV = async (
  options: ExportOptions = {}
): Promise<string> => {
  const connection = await pool.getConnection();
  
  try {
    // Build WHERE clause
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    
    if (options.internshipId) {
      whereConditions.push('a.internship_id = ?');
      queryParams.push(options.internshipId);
    }
    
    if (options.status) {
      whereConditions.push('a.application_status = ?');
      queryParams.push(options.status);
    }
    
    if (options.dateFrom) {
      whereConditions.push('DATE(a.created_at) >= ?');
      queryParams.push(options.dateFrom);
    }
    
    if (options.dateTo) {
      whereConditions.push('DATE(a.created_at) <= ?');
      queryParams.push(options.dateTo);
    }
    
    if (options.search) {
      whereConditions.push('(a.first_name LIKE ? OR a.last_name LIKE ? OR a.email LIKE ? OR a.university LIKE ?)');
      const searchPattern = `%${options.search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';
    
    // Fetch applications
    const [applications] = await connection.execute(
      `SELECT 
        a.id,
        a.first_name,
        a.last_name,
        a.email,
        a.phone,
        a.university,
        a.graduation_year,
        a.major,
        a.gpa,
        a.motivation,
        a.project_submission_url,
        a.application_status,
        a.created_at,
        i.title as internship_title,
        i.department
       FROM internship_applications a
       JOIN internships i ON a.internship_id = i.id
       ${whereClause}
       ORDER BY a.created_at DESC`,
      queryParams
    );
    
    // Create export directory if it doesn't exist
    const exportDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `applications-${timestamp}.csv`;
    const filepath = path.join(exportDir, filename);
    
    // Define CSV headers
    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'id', title: 'Application ID' },
        { id: 'first_name', title: 'First Name' },
        { id: 'last_name', title: 'Last Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'university', title: 'University' },
        { id: 'graduation_year', title: 'Graduation Year' },
        { id: 'major', title: 'Major' },
        { id: 'gpa', title: 'GPA' },
        { id: 'internship_title', title: 'Internship Title' },
        { id: 'department', title: 'Department' },
        { id: 'application_status', title: 'Status' },
        { id: 'project_submission_url', title: 'Project URL' },
        { id: 'created_at', title: 'Submitted Date' },
      ],
    });
    
    // Write data
    await csvWriter.writeRecords(applications as any[]);
    
    return filepath;
  } finally {
    connection.release();
  }
};

// Get CSV file as buffer for download
export const getCSVBuffer = async (options: ExportOptions = {}): Promise<Buffer> => {
  const filepath = await exportApplicationsToCSV(options);
  const buffer = fs.readFileSync(filepath);
  
  // Optionally delete the file after reading (or keep for a while)
  // fs.unlinkSync(filepath);
  
  return buffer;
};

