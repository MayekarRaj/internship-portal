import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Database configuration
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'internship_portal',
  port: parseInt(process.env.DB_PORT || '3306')
};

// Create database connection pool
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database initialization
export const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create admins table
    const createAdminsTable = `
      CREATE TABLE IF NOT EXISTS admins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role ENUM('super_admin', 'admin') DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_active (is_active)
      )
    `;
    
    // Create internships table
    const createInternshipsTable = `
      CREATE TABLE IF NOT EXISTS internships (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        department VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT NOT NULL,
        duration VARCHAR(100) NOT NULL,
        stipend VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        type ENUM('remote', 'onsite', 'hybrid') NOT NULL,
        application_deadline DATE NOT NULL,
        start_date DATE NOT NULL,
        skills_required TEXT NOT NULL,
        task_sheet_url VARCHAR(500) NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active (is_active),
        INDEX idx_department (department),
        INDEX idx_deadline (application_deadline)
      )
    `;
    
    // Create applications table
    const createApplicationsTable = `
      CREATE TABLE IF NOT EXISTS internship_applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        internship_id INT NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        university VARCHAR(255) NOT NULL,
        graduation_year YEAR NOT NULL,
        major VARCHAR(255) NOT NULL,
        gpa DECIMAL(3,2) NULL,
        motivation TEXT NOT NULL,
        project_submission_url VARCHAR(500) NOT NULL,
        application_status ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
        INDEX idx_email (email),
        INDEX idx_internship (internship_id),
        INDEX idx_status (application_status),
        INDEX idx_created_at (created_at),
        UNIQUE KEY unique_application (email, internship_id)
      )
    `;
    
    // Create email logs table
    const createEmailLogsTable = `
      CREATE TABLE IF NOT EXISTS email_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        recipient_email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        status ENUM('sent', 'failed') NOT NULL,
        message_id VARCHAR(255) NULL,
        error_message TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_recipient (recipient_email),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `;
    
    // Create admin notes table
    const createAdminNotesTable = `
      CREATE TABLE IF NOT EXISTS admin_notes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        application_id INT NOT NULL,
        admin_id INT NOT NULL,
        note TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES internship_applications(id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
        INDEX idx_application (application_id),
        INDEX idx_admin (admin_id),
        INDEX idx_created_at (created_at)
      )
    `;
    
    await connection.execute(createAdminsTable);
    await connection.execute(createInternshipsTable);
    await connection.execute(createApplicationsTable);
    await connection.execute(createEmailLogsTable);
    await connection.execute(createAdminNotesTable);
    
    // Add application_status column if it doesn't exist (for existing databases)
    try {
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'internship_applications' 
        AND COLUMN_NAME = 'application_status'
      `);
      
      if (!Array.isArray(columns) || columns.length === 0) {
        await connection.execute(`
          ALTER TABLE internship_applications 
          ADD COLUMN application_status ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted') DEFAULT 'pending'
        `);
        console.log('Added application_status column to internship_applications table');
      }
    } catch (error) {
      // Column might already exist, ignore error
      console.log('application_status column check:', error);
    }
    
    // Create default admin user if no admins exist
    const [existingAdmins] = await connection.execute('SELECT COUNT(*) as count FROM admins');
    if ((existingAdmins as any)[0].count === 0) {
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      
      await connection.execute(`
        INSERT INTO admins (email, password_hash, name, role)
        VALUES (?, ?, ?, 'super_admin')
      `, [
        process.env.ADMIN_DEFAULT_EMAIL || 'admin@getflytechnologies.com',
        passwordHash,
        'Admin User'
      ]);
      
      console.log(`Default admin created: ${process.env.ADMIN_DEFAULT_EMAIL || 'admin@getflytechnologies.com'}`);
      console.log(`Default password: ${defaultPassword}`);
    }
    
    // Insert sample internships if table is empty
    const [existingInternships] = await connection.execute('SELECT COUNT(*) as count FROM internships');
    if ((existingInternships as any)[0].count === 0) {
      const sampleInternships = [
        {
          title: 'Mobile App Developer Intern',
          department: 'Engineering',
          description: 'Join our mobile development team to build cutting-edge iOS and Android applications. You will work with Flutter, and native development frameworks while learning industry best practices.',
          requirements: "Currently in your Second Year or Third Year of Engineering from any field",
          duration: '1 months',
          stipend: 'Rs. 0',
          location: 'Sion, Mumbai',
          type: 'hybrid',
          application_deadline: '2025-05-31',
          start_date: '2025-06-03',
          skills_required: 'Flutter, Android development, API Integration, UI/UX Design, State Management',
          task_sheet_url: 'https://docs.google.com/document/d/1SECO2Ii9pIX4oaGMsqxwc1lQj4n1B3K-8hNR55Uaclg/edit?usp=sharing'
        },
      ];
      
      for (const internship of sampleInternships) {
        await connection.execute(`
          INSERT INTO internships (
            title, department, description, requirements, duration, stipend,
            location, type, application_deadline, start_date, skills_required, task_sheet_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          internship.title, internship.department, internship.description,
          internship.requirements, internship.duration, internship.stipend,
          internship.location, internship.type, internship.application_deadline,
          internship.start_date, internship.skills_required, internship.task_sheet_url
        ]);
      }
    }
    
    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

