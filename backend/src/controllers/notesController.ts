import { Request, Response } from 'express';
import { pool } from '../config/database';

// Create note
export const createNote = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const applicationId = parseInt(req.params.id);
    const { note } = req.body;
    const adminId = req.admin?.id;

    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note is required'
      });
    }

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Verify application exists
    const [applications] = await connection.execute(
      'SELECT id FROM internship_applications WHERE id = ?',
      [applicationId]
    );

    if (!Array.isArray(applications) || applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const [result] = await connection.execute(
      'INSERT INTO admin_notes (application_id, admin_id, note) VALUES (?, ?, ?)',
      [applicationId, adminId, note.trim()]
    );

    const noteId = (result as any).insertId;

    // Fetch created note with admin info
    const [notes] = await connection.execute(
      `SELECT n.*, a.name as admin_name, a.email as admin_email 
       FROM admin_notes n
       JOIN admins a ON n.admin_id = a.id
       WHERE n.id = ?`,
      [noteId]
    );

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: (notes as any[])[0]
    });

  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Get all notes for an application
export const getNotes = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const applicationId = parseInt(req.params.id);

    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }

    const [notes] = await connection.execute(
      `SELECT n.*, a.name as admin_name, a.email as admin_email 
       FROM admin_notes n
       JOIN admins a ON n.admin_id = a.id
       WHERE n.application_id = ?
       ORDER BY n.created_at DESC`,
      [applicationId]
    );

    res.json({
      success: true,
      data: notes
    });

  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Update note
export const updateNote = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const noteId = parseInt(req.params.noteId);
    const { note } = req.body;
    const adminId = req.admin?.id;

    if (isNaN(noteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
    }

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note is required'
      });
    }

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Check if note exists and belongs to admin (optional: allow any admin to edit)
    const [result] = await connection.execute(
      'UPDATE admin_notes SET note = ?, updated_at = NOW() WHERE id = ?',
      [note.trim(), noteId]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Fetch updated note
    const [notes] = await connection.execute(
      `SELECT n.*, a.name as admin_name, a.email as admin_email 
       FROM admin_notes n
       JOIN admins a ON n.admin_id = a.id
       WHERE n.id = ?`,
      [noteId]
    );

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: (notes as any[])[0]
    });

  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Delete note
export const deleteNote = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const noteId = parseInt(req.params.noteId);

    if (isNaN(noteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
    }

    const [result] = await connection.execute(
      'DELETE FROM admin_notes WHERE id = ?',
      [noteId]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

