import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { JWT_SECRET } from '../config/jwt';

// Admin Login
export const loginAdmin = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const [admins] = await connection.execute(
      'SELECT id, email, password_hash, name, role, is_active FROM admins WHERE email = ?',
      [email]
    );
    
    if (!Array.isArray(admins) || admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const admin = admins[0] as any;
    
    if (!admin.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is inactive'
      });
    }
    
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Update last login
    await connection.execute(
      'UPDATE admins SET last_login = NOW() WHERE id = ?',
      [admin.id]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Get Current Admin (Verify Token)
export const getCurrentAdmin = async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      admin: req.admin
    }
  });
};

// Admin Logout
export const logoutAdmin = async (req: Request, res: Response) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

