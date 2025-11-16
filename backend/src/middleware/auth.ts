import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { JWT_SECRET } from '../config/jwt';
import { Admin } from '../types';

// Admin Authentication Middleware
export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { adminId: number };
      const connection = await pool.getConnection();
      
      try {
        const [admins] = await connection.execute(
          'SELECT id, email, name, role, is_active, last_login, created_at, updated_at FROM admins WHERE id = ? AND is_active = TRUE',
          [decoded.adminId]
        );
        
        if (!Array.isArray(admins) || admins.length === 0) {
          return res.status(401).json({
            success: false,
            message: 'Invalid token or admin not found'
          });
        }
        
        req.admin = admins[0] as Admin;
        connection.release();
        next();
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

