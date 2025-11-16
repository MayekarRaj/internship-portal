"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const jwt_1 = require("../config/jwt");
// Admin Authentication Middleware
const authenticateAdmin = async (req, res, next) => {
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
            const decoded = jsonwebtoken_1.default.verify(token, jwt_1.JWT_SECRET);
            const connection = await database_1.pool.getConnection();
            try {
                const [admins] = await connection.execute('SELECT id, email, name, role, is_active, last_login, created_at, updated_at FROM admins WHERE id = ? AND is_active = TRUE', [decoded.adminId]);
                if (!Array.isArray(admins) || admins.length === 0) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid token or admin not found'
                    });
                }
                req.admin = admins[0];
                connection.release();
                next();
            }
            catch (error) {
                connection.release();
                throw error;
            }
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.authenticateAdmin = authenticateAdmin;
