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
exports.uploadProfileImage = exports.updateProfile = exports.getProfile = exports.register = void 0;
const cloudinary_1 = require("cloudinary");
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
const register = async (req, res) => {
    try {
        const { name, email, password, phone, bio } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone: phone || null,
                bio: bio || null,
            }
        });
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.status(201).json(userWithoutPassword);
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
};
exports.register = register;
const getProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                bio: true,
                image: true
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching profile' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { name, phone, bio } = req.body;
        const user = await prisma.user.update({
            where: { id: userId },
            data: { name, phone, bio },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                bio: true,
                image: true
            }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating profile' });
    }
};
exports.updateProfile = updateProfile;
const uploadProfileImage = async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        try {
            const result = await cloudinary_1.v2.uploader.upload(req.file.path, {
                folder: 'nexttalkv2/profile-images',
                public_id: `user-${req.user.id}`,
                overwrite: true,
                resource_type: 'auto'
            });
            fs_1.default.unlink(req.file.path, (err) => {
                if (err)
                    console.error('Error deleting local file:', err);
            });
            const updatedUser = await prisma.user.update({
                where: { id: req.user.id },
                data: { profileImage: result.secure_url },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profileImage: true
                }
            });
            res.json({
                success: true,
                imageUrl: result.secure_url,
                user: updatedUser
            });
        }
        catch (uploadError) {
            fs_1.default.unlink(req.file.path, (err) => {
                if (err)
                    console.error('Error deleting local file:', err);
            });
            throw uploadError;
        }
    }
    catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({
            error: 'Failed to upload image',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.uploadProfileImage = uploadProfileImage;
//# sourceMappingURL=userController.js.map