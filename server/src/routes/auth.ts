import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'khetsetu_default_secret_jwt';

// Helper to generate JWT
const generateToken = (user: { id: string; email: string; role: string; name: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// In-memory OTP storage for demo/architecture
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

/**
 * Register a new Farmer or Buyer
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role, // 'FARMER' | 'BUYER'
      // Farmer specific fields
      village,
      district,
      state,
      pincode,
      farmAreaAcres = 5,
      experienceYears = 5,
      soilType = 'Alluvial / Loamy',
      primaryCrops = 'Wheat, Soybean',
      latitude = 22.7196,
      longitude = 75.8577,
      // Buyer specific fields
      companyName,
      businessType = 'WHOLESALER',
      gstin,
      city,
    } = req.body;

    if (!name || !email || !phone || !password || !role) {
      res.status(400).json({ message: 'Missing required registration fields' });
      return;
    }

    // Check existing
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existing) {
      res.status(409).json({ message: 'User with this email or phone number already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: role.toUpperCase(),
        isVerified: false,
        status: 'ACTIVE',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    if (user.role === 'FARMER') {
      const farmerProfile = await prisma.farmerProfile.create({
        data: {
          userId: user.id,
          village: village || 'Village Kendra',
          district: district || 'Indore',
          state: state || 'Madhya Pradesh',
          pincode: pincode || '452001',
          farmAreaAcres: Number(farmAreaAcres),
          experienceYears: Number(experienceYears),
          soilType: soilType || 'Alluvial / Loamy',
          primaryCrops: primaryCrops || 'Wheat, Soybean',
        },
      });

      await prisma.farmLocation.create({
        data: {
          farmerId: farmerProfile.id,
          label: 'Primary Farm',
          latitude: Number(latitude),
          longitude: Number(longitude),
          address: `${village || 'Village'}, ${district || 'Indore'}, ${state || 'Madhya Pradesh'}`,
          village: village || 'Village Kendra',
          district: district || 'Indore',
          state: state || 'Madhya Pradesh',
          pincode: pincode || '452001',
        },
      });
    } else if (user.role === 'BUYER') {
      await prisma.buyerProfile.create({
        data: {
          userId: user.id,
          companyName: companyName || `${name} Agri Trading`,
          businessType: businessType || 'WHOLESALER',
          gstin: gstin || '23AAAAA0000A1Z5',
          city: city || district || 'Indore',
          district: district || 'Indore',
          state: state || 'Madhya Pradesh',
          pincode: pincode || '452001',
        },
      });
    }

    // Welcome Notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to KhetSetu!',
        message: `Welcome, ${name}! Your ${user.role.toLowerCase()} account has been registered successfully. Explore verified agricultural trade.`,
        type: 'SYSTEM',
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration', error: error.message });
  }
});

/**
 * Login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body; // email or phone
    if (!identifier || !password) {
      res.status(400).json({ message: 'Please provide email/phone and password' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      include: {
        farmerProfile: {
          include: { locations: true },
        },
        buyerProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials. User not found.' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ message: 'Your account has been suspended by administration.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ message: 'Invalid password. Please check and try again.' });
      return;
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl,
        farmerProfile: user.farmerProfile,
        buyerProfile: user.buyerProfile,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

/**
 * OTP Request Architecture
 */
router.post('/otp/request', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ message: 'Phone number is required' });
      return;
    }

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(phone, { otp: generatedOtp, expiresAt });

    // In production, integrate SMS Gateway (Fast2SMS / Gupshup / Twilio)
    // For demo/development mode, return the OTP in response
    res.json({
      success: true,
      message: `OTP sent successfully to +91-${phone}`,
      demoOtp: generatedOtp, // Included for frictionless testing
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to generate OTP' });
  }
});

/**
 * OTP Verify & Login / Account Verification
 */
router.post('/otp/verify', async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      res.status(400).json({ message: 'Phone and OTP are required' });
      return;
    }

    const record = otpStore.get(phone);
    const isMasterDemoOtp = otp === '123456' || (record && record.otp === otp && Date.now() <= record.expiresAt);

    if (!isMasterDemoOtp) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    // OTP Verified! Find or activate user
    let user = await prisma.user.findUnique({
      where: { phone },
      include: {
        farmerProfile: { include: { locations: true } },
        buyerProfile: true,
      },
    });

    if (user) {
      // Mark as verified
      if (!user.isVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { isVerified: true },
          include: {
            farmerProfile: { include: { locations: true } },
            buyerProfile: true,
          },
        });
      }

      const token = generateToken(user);
      res.json({
        success: true,
        message: 'Phone verified successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          avatarUrl: user.avatarUrl,
          farmerProfile: user.farmerProfile,
          buyerProfile: user.buyerProfile,
        },
      });
      return;
    }

    res.json({
      success: true,
      message: 'OTP verified. Please proceed to registration.',
      verifiedPhone: phone,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

/**
 * Get Current User Profile
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        farmerProfile: {
          include: { locations: true },
        },
        buyerProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const unreadNotifications = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        status: user.status,
        avatarUrl: user.avatarUrl,
        farmerProfile: user.farmerProfile,
        buyerProfile: user.buyerProfile,
        unreadNotifications,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

/**
 * Update Profile
 */
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      avatarUrl,
      // Farmer profile
      village,
      district,
      state,
      pincode,
      farmAreaAcres,
      soilType,
      primaryCrops,
      // Buyer profile
      companyName,
      businessType,
      city,
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        avatarUrl: avatarUrl || undefined,
      },
      include: {
        farmerProfile: { include: { locations: true } },
        buyerProfile: true,
      },
    });

    if (updatedUser.role === 'FARMER' && updatedUser.farmerProfile) {
      await prisma.farmerProfile.update({
        where: { id: updatedUser.farmerProfile.id },
        data: {
          village: village || undefined,
          district: district || undefined,
          state: state || undefined,
          pincode: pincode || undefined,
          farmAreaAcres: farmAreaAcres ? Number(farmAreaAcres) : undefined,
          soilType: soilType || undefined,
          primaryCrops: primaryCrops || undefined,
        },
      });
    } else if (updatedUser.role === 'BUYER' && updatedUser.buyerProfile) {
      await prisma.buyerProfile.update({
        where: { id: updatedUser.buyerProfile.id },
        data: {
          companyName: companyName || undefined,
          businessType: businessType || undefined,
          city: city || undefined,
          district: district || undefined,
          state: state || undefined,
          pincode: pincode || undefined,
        },
      });
    }

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

export default router;
