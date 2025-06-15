import { v2 as cloudinary } from 'cloudinary';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, bio } = req.body;

    // Check if user already exists 
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        bio: bio || null,
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
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
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
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
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile' });
  }
};

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'nexttalkv2/profile-images',
        public_id: `user-${req.user.id}`,
        overwrite: true,
        resource_type: 'auto'
      });

      // Clean up the local file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting local file:', err);
      });

      // Update user profile
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

    } catch (uploadError) {
      // Clean up the local file on upload error
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting local file:', err);
      });
      throw uploadError;
    }

  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
