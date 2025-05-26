// server.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3011;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'internship_portal',
  port: parseInt(process.env.DB_PORT || '3306')
};

// Create database connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000' || 'https://localhost:5173' || 'https://localhost:5174',
  credentials: true
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (PDFs)
app.use('/static', express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Specific rate limiting for application submission
const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 applications per hour
  message: 'Too many application submissions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Types
interface Internship {
  id: number;
  title: string;
  department: string;
  description: string;
  requirements: string;
  duration: string;
  stipend: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  application_deadline: string;
  start_date: string;
  skills_required: string;
  task_sheet_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface InternshipApplication {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  graduationYear: number;
  major: string;
  gpa?: number;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredTechnologies?: string;
  motivation: string;
  availabilityStart: string;
  projectSubmissionUrl: string; // New field for project submission
  internshipId: number; // New field to link to specific internship
}

// Validation middleware for internship applications
const validateApplication = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('university')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('University is required and must be less than 255 characters'),
  
  body('graduationYear')
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 10 })
    .withMessage('Please provide a valid graduation year'),
  
  body('major')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Major is required and must be less than 255 characters'),
  
  body('gpa')
    .optional()
    .isFloat({ min: 0, max: 4 })
    .withMessage('GPA must be between 0.0 and 4.0'),
  
  // body('githubUrl')
  //   .optional()
  //   .isURL()
  //   .withMessage('Please provide a valid GitHub URL'),
  
  // body('linkedinUrl')
  //   .optional()
  //   .isURL()
  //   .withMessage('Please provide a valid LinkedIn URL'),
  
  // body('portfolioUrl')
  //   .optional()
  //   .isURL()
  //   .withMessage('Please provide a valid portfolio URL'),
  
  // body('experienceLevel')
  //   .isIn(['beginner', 'intermediate', 'advanced'])
  //   .withMessage('Experience level must be beginner, intermediate, or advanced'),
  
  // body('preferredTechnologies')
  //   .optional()
  //   .trim()
  //   .isLength({ max: 1000 })
  //   .withMessage('Preferred technologies must be less than 1000 characters'),
  
  body('motivation')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Motivation is required and must be between 50 and 2000 characters'),
  
  // body('availabilityStart')
  //   .isISO8601()
  //   .toDate()
  //   .withMessage('Please provide a valid start date'),
  
  body('projectSubmissionUrl')
    .isURL()
    .withMessage('Please provide a valid project submission URL (GitHub/Google Drive)'),
  
  body('internshipId')
    .isInt({ min: 1 })
    .withMessage('Valid internship ID is required'),
];

// Error handling middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
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

// Database initialization
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
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
    
    // Create applications table (updated)
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
        -- github_url VARCHAR(500) NULL,
        -- linkedin_url VARCHAR(500) NULL,
        -- portfolio_url VARCHAR(500) NULL,
        -- experience_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
        -- preferred_technologies TEXT NULL,
        motivation TEXT NOT NULL,
        -- availability_start DATE NOT NULL,
        project_submission_url VARCHAR(500) NOT NULL,
        -- application_status ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted') DEFAULT 'pending',
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
    
    await connection.execute(createInternshipsTable);
    await connection.execute(createApplicationsTable);
    
    // Insert sample internships if table is empty
    const [existingInternships] = await connection.execute('SELECT COUNT(*) as count FROM internships');
    if ((existingInternships as any)[0].count === 0) {
      const sampleInternships = [
        {
          title: 'Mobile App Developer Intern',
          department: 'Engineering',
          description: 'Join our mobile development team to build cutting-edge iOS and Android applications. You will work with Flutter, and native development frameworks while learning industry best practices.',
          // requirements: 'Currently pursuing Bachelor\'s or Master\'s in Computer Science, Software Engineering, or related field. Basic knowledge of mobile development frameworks. Strong problem-solving skills and eagerness to learn.',
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
        // {
        //   title: 'Frontend Development Intern',
        //   department: 'Engineering',
        //   description: 'Work with our frontend team to create beautiful, responsive web applications using modern JavaScript frameworks and libraries.',
        //   requirements: 'Pursuing degree in Computer Science or related field. Experience with HTML, CSS, JavaScript. Knowledge of React, Vue, or Angular is a plus.',
        //   duration: '3-4 months',
        //   stipend: '$800-1200/month',
        //   location: 'New York, NY',
        //   type: 'remote',
        //   application_deadline: '2025-06-30',
        //   start_date: '2025-07-15',
        //   skills_required: 'HTML, CSS, JavaScript, React, Vue.js, Responsive Design',
        //   task_sheet_url: '/static/frontend-task-sheet.pdf'
        // },
        // {
        //   title: 'Data Science Intern',
        //   department: 'Analytics',
        //   description: 'Analyze large datasets, build predictive models, and create data visualizations to drive business decisions.',
        //   requirements: 'Pursuing degree in Data Science, Statistics, Computer Science, or related field. Proficiency in Python or R. Basic knowledge of machine learning concepts.',
        //   duration: '4-6 months',
        //   stipend: '$1200-1800/month',
        //   location: 'Austin, TX',
        //   type: 'onsite',
        //   application_deadline: '2025-08-01',
        //   start_date: '2025-08-15',
        //   skills_required: 'Python, R, SQL, Machine Learning, Data Visualization, Pandas, NumPy',
        //   task_sheet_url: '/static/data-science-task-sheet.pdf'
        // }
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
    process.exit(1);
  }
};

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/internships', async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const [internships] = await connection.execute(`
      SELECT 
        id, title, department, description, requirements, duration, stipend,
        location, type, application_deadline, start_date, skills_required,
        task_sheet_url, created_at
      FROM internships 
      WHERE is_active = TRUE AND application_deadline >= CURDATE()
      ORDER BY application_deadline ASC
    `);
    
    res.json({
      success: true,
      data: internships
    });
    
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
});

app.get('/api/internships/:id', async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const internshipId = parseInt(req.params.id);
    
    if (isNaN(internshipId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid internship ID'
      });
    }
    
    const [internships] = await connection.execute(`
      SELECT * FROM internships 
      WHERE id = ? AND is_active = TRUE AND application_deadline >= CURDATE()
    `, [internshipId]);
    
    if (!Array.isArray(internships) || internships.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found or no longer accepting applications'
      });
    }
    
    res.json({
      success: true,
      data: internships[0]
    });
    
  } catch (error) {
    console.error('Error fetching internship:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
});

app.post('/api/applications', 
  applicationLimiter,
  validateApplication,
  handleValidationErrors,
  async (req: Request, res: Response) => {
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
        // applicationData.githubUrl || null,
        // applicationData.linkedinUrl || null,
        // applicationData.portfolioUrl || null,
        // applicationData.experienceLevel,
        // applicationData.preferredTechnologies || null,
        applicationData.motivation,
        // applicationData.availabilityStart,
        applicationData.projectSubmissionUrl
      ];
      
      const [result] = await connection.execute(insertQuery, values);
      
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        applicationId: (result as any).insertId
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
  }
);

// Get applications for a specific internship (admin endpoint)
app.get('/api/internships/:id/applications', async (req: Request, res: Response) => {
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
       LIMIT ? OFFSET ?`,
      [internshipId, limit, offset]
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
});

// Get all applications (admin endpoint)
app.get('/api/applications', async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Get total count
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM internship_applications'
    );
    const total = (countResult as any)[0].total;
    
    // Get applications with pagination and internship details
    const [applications] = await connection.execute(
      `SELECT a.*, i.title as internship_title, i.department
       FROM internship_applications a
       JOIN internships i ON a.internship_id = i.id
       ORDER BY a.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
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
});

// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Internships API: http://localhost:${PORT}/api/internships`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();