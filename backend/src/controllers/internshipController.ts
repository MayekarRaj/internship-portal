import { Request, Response } from 'express';
import { pool } from '../config/database';

// Get all active internships (public)
export const getInternships = async (req: Request, res: Response) => {
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
};

// Get single internship (public)
export const getInternshipById = async (req: Request, res: Response) => {
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
};

// Admin: Get all internships (including inactive)
export const getAllInternships = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const [internships] = await connection.execute(`
      SELECT * FROM internships 
      ORDER BY created_at DESC
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
};

// Admin: Get single internship
export const getInternshipByIdAdmin = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const internshipId = parseInt(req.params.id);
    
    if (isNaN(internshipId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid internship ID'
      });
    }
    
    const [internships] = await connection.execute(
      'SELECT * FROM internships WHERE id = ?',
      [internshipId]
    );
    
    if (!Array.isArray(internships) || internships.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
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
};

// Admin: Create internship
export const createInternship = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      title, department, description, requirements, duration, stipend,
      location, type, application_deadline, start_date, skills_required, task_sheet_url, is_active
    } = req.body;
    
    // Validation
    if (!title || !department || !description || !requirements || !duration || !stipend ||
        !location || !type || !application_deadline || !start_date || !skills_required) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    if (!['remote', 'onsite', 'hybrid'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be remote, onsite, or hybrid'
      });
    }
    
    const [result] = await connection.execute(`
      INSERT INTO internships (
        title, department, description, requirements, duration, stipend,
        location, type, application_deadline, start_date, skills_required, task_sheet_url, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, department, description, requirements, duration, stipend,
      location, type, application_deadline, start_date, skills_required, task_sheet_url || null, is_active !== undefined ? is_active : true
    ]);
    
    const insertId = (result as any).insertId;
    
    // Fetch the created internship
    const [internships] = await connection.execute(
      'SELECT * FROM internships WHERE id = ?',
      [insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Internship created successfully',
      data: (internships as any[])[0]
    });
    
  } catch (error) {
    console.error('Error creating internship:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Admin: Update internship
export const updateInternship = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const internshipId = parseInt(req.params.id);
    
    if (isNaN(internshipId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid internship ID'
      });
    }
    
    const {
      title, department, description, requirements, duration, stipend,
      location, type, application_deadline, start_date, skills_required, task_sheet_url, is_active
    } = req.body;
    
    if (type && !['remote', 'onsite', 'hybrid'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be remote, onsite, or hybrid'
      });
    }
    
    const [result] = await connection.execute(`
      UPDATE internships SET
        title = COALESCE(?, title),
        department = COALESCE(?, department),
        description = COALESCE(?, description),
        requirements = COALESCE(?, requirements),
        duration = COALESCE(?, duration),
        stipend = COALESCE(?, stipend),
        location = COALESCE(?, location),
        type = COALESCE(?, type),
        application_deadline = COALESCE(?, application_deadline),
        start_date = COALESCE(?, start_date),
        skills_required = COALESCE(?, skills_required),
        task_sheet_url = ?,
        is_active = COALESCE(?, is_active),
        updated_at = NOW()
      WHERE id = ?
    `, [
      title, department, description, requirements, duration, stipend,
      location, type, application_deadline, start_date, skills_required, task_sheet_url, is_active, internshipId
    ]);
    
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }
    
    // Fetch updated internship
    const [internships] = await connection.execute(
      'SELECT * FROM internships WHERE id = ?',
      [internshipId]
    );
    
    res.json({
      success: true,
      message: 'Internship updated successfully',
      data: (internships as any[])[0]
    });
    
  } catch (error) {
    console.error('Error updating internship:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Admin: Delete internship
export const deleteInternship = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const internshipId = parseInt(req.params.id);
    
    if (isNaN(internshipId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid internship ID'
      });
    }
    
    const [result] = await connection.execute(
      'DELETE FROM internships WHERE id = ?',
      [internshipId]
    );
    
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Internship deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting internship:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Admin: Toggle internship active status
export const toggleInternshipStatus = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const internshipId = parseInt(req.params.id);
    const { is_active } = req.body;
    
    if (isNaN(internshipId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid internship ID'
      });
    }
    
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_active must be a boolean'
      });
    }
    
    const [result] = await connection.execute(
      'UPDATE internships SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [is_active, internshipId]
    );
    
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }
    
    res.json({
      success: true,
      message: `Internship ${is_active ? 'activated' : 'deactivated'} successfully`
    });
    
  } catch (error) {
    console.error('Error updating internship status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

