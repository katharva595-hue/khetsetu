import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireRole(['ADMIN']));

/**
 * Platform Analytics & KPI Statistics (Calculated from real DB records)
 */
router.get('/analytics', async (_req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalBuyers,
      totalListings,
      activeListings,
      totalOrders,
      activeBids,
      orders,
      listings,
      farmerProfiles,
      disputesCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.cropListing.count(),
      prisma.cropListing.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.bid.count({ where: { status: 'PENDING' } }),
      prisma.order.findMany({ select: { totalAmount: true, status: true } }),
      prisma.cropListing.findMany({ select: { cropName: true, quantity: true } }),
      prisma.farmerProfile.findMany({ select: { district: true, state: true } }),
      prisma.dispute.count({ where: { status: 'OPEN' } }),
    ]);

    // Calculate GMV
    const totalProcurementValue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const completedTrades = orders.filter((o) => o.status === 'DELIVERED').length;
    const pendingOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;

    // Crop distribution
    const cropVolumeMap: Record<string, number> = {};
    for (const item of listings) {
      cropVolumeMap[item.cropName] = (cropVolumeMap[item.cropName] || 0) + item.quantity;
    }
    const popularCrops = Object.entries(cropVolumeMap)
      .map(([crop, volume]) => ({ crop, volume }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 6);

    // Geographic distribution
    const districtCountMap: Record<string, number> = {};
    for (const fp of farmerProfiles) {
      districtCountMap[fp.district] = (districtCountMap[fp.district] || 0) + 1;
    }
    const geographicDistribution = Object.entries(districtCountMap)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      totalUsers,
      totalFarmers,
      totalBuyers,
      totalListings,
      activeListings,
      totalOrders,
      completedTrades,
      pendingOrders,
      activeBids,
      totalProcurementValue: Math.round(totalProcurementValue),
      openDisputes: disputesCount,
      popularCrops,
      geographicDistribution,
    });
  } catch (error: any) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ message: 'Failed to calculate analytics' });
  }
});

/**
 * Manage Users
 */
router.get('/users', async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        farmerProfile: true,
        buyerProfile: true,
        _count: {
          select: { listings: true, orders: true, bids: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

/**
 * Verify or Suspend User Account
 */
router.put('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isVerified, status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        isVerified: isVerified !== undefined ? Boolean(isVerified) : undefined,
        status: status || undefined,
      },
      include: { farmerProfile: true, buyerProfile: true },
    });

    if (user.farmerProfile && isVerified !== undefined) {
      await prisma.farmerProfile.update({
        where: { id: user.farmerProfile.id },
        data: { verifiedBadge: Boolean(isVerified) },
      });
    }

    if (user.buyerProfile && isVerified !== undefined) {
      await prisma.buyerProfile.update({
        where: { id: user.buyerProfile.id },
        data: { verifiedBadge: Boolean(isVerified) },
      });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

/**
 * Verification Requests
 */
router.get('/verifications', async (_req: AuthRequest, res: Response) => {
  try {
    const requests = await prisma.verificationRequest.findMany({
      include: {
        user: {
          include: { farmerProfile: true, buyerProfile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch verification requests' });
  }
});

router.put('/verifications/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body; // 'APPROVED' | 'REJECTED'

    const reqRecord = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status,
        adminNotes,
        reviewedAt: new Date(),
      },
      include: { user: true },
    });

    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: reqRecord.userId },
        data: { isVerified: true },
      });
    }

    res.json({ message: `Verification request ${status}`, request: reqRecord });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update verification request' });
  }
});

/**
 * Disputes Management
 */
router.get('/disputes', async (_req: AuthRequest, res: Response) => {
  try {
    const disputes = await prisma.dispute.findMany({
      include: {
        order: true,
        raisedBy: { select: { id: true, name: true, role: true } },
        againstUser: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(disputes);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch disputes' });
  }
});

router.put('/disputes/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminResolution } = req.body;

    const dispute = await prisma.dispute.update({
      where: { id },
      data: {
        status,
        adminResolution,
        resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
      },
    });

    res.json({ message: 'Dispute updated successfully', dispute });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update dispute' });
  }
});

export default router;
