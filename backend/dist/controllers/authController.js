"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutAdmin = exports.getCurrentAdmin = exports.loginAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const jwt_1 = require("../config/jwt");
// Admin Login
const loginAdmin = async (req, res) => {
    const connection = await database_1.pool.getConnection();
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        const [admins] = await connection.execute('SELECT id, email, password_hash, name, role, is_active FROM admins WHERE email = ?', [email]);
        if (!Array.isArray(admins) || admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        const admin = admins[0];
        if (!admin.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Admin account is inactive'
            });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, admin.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Update last login
        await connection.execute('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ adminId: admin.id }, jwt_1.JWT_SECRET, { expiresIn: '7d' });
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
    finally {
        connection.release();
    }
};
exports.loginAdmin = loginAdmin;
// Get Current Admin (Verify Token)
const getCurrentAdmin = async (req, res) => {
    res.json({
        success: true,
        data: {
            admin: req.admin
        }
    });
};
exports.getCurrentAdmin = getCurrentAdmin;
// Admin Logout
const logoutAdmin = async (req, res) => {
    // In a stateless JWT system, logout is handled client-side by removing the token
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};
exports.logoutAdmin = logoutAdmin;
