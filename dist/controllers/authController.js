"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const crypto_1 = require("crypto");
const register = async (req, res) => {
    try {
        const { name, email, password, phone, bio, profileImage, generation } = req.body;
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const userData = {
            name,
            email,
            password: hashedPassword,
            generation: generation || 'millennial',
            phone: phone || null,
            bio: bio || null,
            profileImage: profileImage || null
        };
        const user = await prisma_1.prisma.user.create({
            data: userData,
            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                generation: true
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ user, token });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                profileImage: true
            }
        });
        if (!user || !await bcrypt_1.default.compare(password, user.password)) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.json({ user: userWithoutPassword, token });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000);
        await prisma_1.prisma.user.update({
            where: { email },
            data: { resetToken, resetTokenExpiry }
        });
        res.json({ message: 'Password reset email sent' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error processing request' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });
        if (!user) {
            res.status(400).json({ error: 'Invalid or expired reset token' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        res.json({ message: 'Password reset successful' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error resetting password' });
    }
};
exports.resetPassword = resetPassword;
const getCurrentUser = async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                profileImage: true,
                phone: true,
                bio: true
            }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching user' });
    }
};
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=authController.js.map