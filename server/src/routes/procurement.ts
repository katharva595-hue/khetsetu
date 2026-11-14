import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { runProcurementMatching } from '../services/procurementMatcher';

const router = Router();

/**
 * Run Ad-hoc Intelligent Procurement Matching
 */
router.post('/match', async (req: Request, res: Response) => {
  try {
    const {
      cropName,
      requiredQuantity,
      qualityGrade = 'GRADE_A',
      minPrice = 0,
      maxPrice,
      maxDistanceKm = 100,
      deliveryDeadline,
      buyerLat = 22.7196, // Default Indore Hub
      buyerLng = 75.8577,
      strategy = 'BALANCED',
    } = req.body;

    if (!cropName || !requiredQuantity || !maxPrice || !deliveryDeadline) {
      res.status(400).json({
        message: 'Missing required parameters: cropName, requiredQuantity, maxPrice, deliveryDeadline',
      });
      return;
    }

    const matchingResult = await runProcurementMatching({
      cropName,
      requiredQuantity: Number(requiredQuantity),
      qualityGrade,
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      maxDistanceKm: Number(maxDistanceKm),
      deliveryDeadline,
      buyerLat: Number(buyerLat),
      buyerLng: Number(buyerLng),
      strategy,
    });

    res.json(matchingResult);
  } catch (error: any) {
    console.error('Procurement matching error:', error);
    res.status(500).json({ message: 'Error executing procurement matching algorithm', error: error.message });
  }
});

/**
 * Buyer: Create Bulk Procurement Requirement
 */
router.post(
  '/requirements',
  authenticate,
  requireRole(['BUYER', 'ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        cropName,
        requiredQuantity,
        unit = 'kg',
        qualityGrade = 'GRADE_A',
        minPrice = 0,
        maxPrice,
        maxDistanceKm = 100,
        deliveryDeadline,
        preferredLocation,
        deliveryAddress,
        latitude = 22.7196,
        longitude = 75.8577,
        notes,
      } = req.body;

      if (!cropName || !requiredQuantity || !maxPrice || !deliveryDeadline || !deliveryAddress) {
        res.status(400).json({ message: 'Missing required procurement fields' });
        return;
      }

      const requirement = await prisma.buyerRequirement.create({
        data: {
          buyerId: req.user!.id,
          cropName,
          requiredQuantity: Number(requiredQuantity),
          unit,
          qualityGrade,
          minPrice: Number(minPrice),
          maxPrice: Number(maxPrice),
          maxDistanceKm: Number(maxDistanceKm),
          deliveryDeadline: new Date(deliveryDeadline),
          preferredLocation: preferredLocation || 'Indore Hub',
          deliveryAddress,
          latitude: Number(latitude),
          longitude: Number(longitude),
          notes,
          status: 'OPEN',
        },
      });

      res.status(201).json({
        message: 'Bulk procurement requirement created successfully',
        requirement,
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to create requirement' });
    }
  }
);

/**
 * Get Procurement Requirements (Public / Authenticated)
 * Allows farmers to view open buyer requirements and buyers to view their own
 */
router.get('/requirements', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const isFarmer = req.user?.role === 'FARMER';
    const whereClause: any = {};

    if (isFarmer) {
      // Farmers see open requirements
      whereClause.status = 'OPEN';
    } else if (req.user?.role === 'BUYER') {
      // Buyer sees their own requirements
      whereClause.buyerId = req.user.id;
    }

    const requirements = await prisma.buyerRequirement.findMany({
      where: whereClause,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            buyerProfile: {
              select: {
                companyName: true,
                city: true,
                district: true,
                state: true,
                verifiedBadge: true,
              },
            },
          },
        },
        procurementPlans: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requirements);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch requirements' });
  }
});

/**
 * Run Matching for an existing Requirement
 */
router.post(
  '/requirements/:id/match',
  authenticate,
  requireRole(['BUYER', 'ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { strategy = 'BALANCED' } = req.body;

      const requirement = await prisma.buyerRequirement.findUnique({
        where: { id },
      });

      if (!requirement) {
        res.status(404).json({ message: 'Requirement not found' });
        return;
      }

      if (requirement.buyerId !== req.user!.id && req.user!.role !== 'ADMIN') {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      const matchResult = await runProcurementMatching({
        cropName: requirement.cropName,
        requiredQuantity: requirement.requiredQuantity,
        qualityGrade: requirement.qualityGrade,
        minPrice: requirement.minPrice,
        maxPrice: requirement.maxPrice,
        maxDistanceKm: requirement.maxDistanceKm,
        deliveryDeadline: requirement.deliveryDeadline,
        buyerLat: requirement.latitude,
        buyerLng: requirement.longitude,
        strategy,
      });

      res.json(matchResult);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to run matching' });
    }
  }
);

/**
 * Confirm and Save Procurement Plan
 */
router.post(
  '/plans/confirm',
  authenticate,
  requireRole(['BUYER', 'ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        requirementId,
        totalRequiredQty,
        totalMatchedQty,
        remainingShortage,
        totalEstimatedCost,
        weightedAvgPrice,
        items,
        notes,
      } = req.body;

      if (!requirementId || !items || items.length === 0) {
        res.status(400).json({ message: 'Invalid procurement plan confirmation data' });
        return;
      }

      // Create plan
      const plan = await prisma.procurementPlan.create({
        data: {
          requirementId,
          buyerId: req.user!.id,
          totalRequiredQty: Number(totalRequiredQty),
          totalMatchedQty: Number(totalMatchedQty),
          remainingShortage: Number(remainingShortage),
          totalEstimatedCost: Number(totalEstimatedCost),
          weightedAvgPrice: Number(weightedAvgPrice),
          status: 'CONFIRMED',
          notes,
          items: {
            create: items.map((item: any) => ({
              listingId: item.listingId,
              farmerId: item.farmerId,
              allocatedQty: Number(item.allocatedQty),
              pricePerKg: Number(item.pricePerKg),
              itemTotalCost: Number(item.itemTotalCost),
              distanceKm: Number(item.distanceKm),
              fulfillmentTimelineDays: Number(item.fulfillmentTimelineDays),
              reasonSelected: item.reasonSelected || 'Qualified match by procurement engine',
            })),
          },
        },
        include: {
          items: {
            include: { listing: true },
          },
        },
      });

      // Update requirement status
      await prisma.buyerRequirement.update({
        where: { id: requirementId },
        data: {
          status: remainingShortage === 0 ? 'MATCHED' : 'OPEN',
        },
      });

      res.status(201).json({
        message: 'Procurement plan confirmed successfully',
        plan,
      });
    } catch (error: any) {
      console.error('Confirm plan error:', error);
      res.status(500).json({ message: 'Failed to confirm procurement plan' });
    }
  }
);

/**
 * Convert Confirmed Procurement Plan into Live Order
 */
router.post(
  '/plans/:id/order',
  authenticate,
  requireRole(['BUYER', 'ADMIN']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { deliveryAddress, paymentMethod = 'UPI / Escrow' } = req.body;

      const plan = await prisma.procurementPlan.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              listing: {
                include: { farmer: true },
              },
            },
          },
          requirement: true,
        },
      });

      if (!plan) {
        res.status(404).json({ message: 'Procurement plan not found' });
        return;
      }

      if (plan.buyerId !== req.user!.id && req.user!.role !== 'ADMIN') {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      const orderNumber = `KS-ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      // Create Order and OrderItems in transaction
      const order = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
          data: {
            orderNumber,
            buyerId: plan.buyerId,
            planId: plan.id,
            totalAmount: plan.totalEstimatedCost,
            status: 'CONFIRMED',
            deliveryAddress: deliveryAddress || plan.requirement.deliveryAddress,
            latitude: plan.requirement.latitude,
            longitude: plan.requirement.longitude,
            paymentStatus: 'ESCROW_HELD',
            paymentMethod,
            notes: `Auto-generated from Procurement Plan #${plan.id.slice(0, 8)}`,
            items: {
              create: plan.items.map((item) => ({
                listingId: item.listingId,
                farmerId: item.farmerId,
                quantity: item.allocatedQty,
                unitPrice: item.pricePerKg,
                totalPrice: item.itemTotalCost,
                itemStatus: 'CONFIRMED',
              })),
            },
            payments: {
              create: {
                amount: plan.totalEstimatedCost,
                transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
                method: paymentMethod,
                status: 'COMPLETED',
              },
            },
          },
          include: {
            items: true,
            payments: true,
          },
        });

        // Deduct quantities from active listings
        for (const item of plan.items) {
          const listing = await tx.cropListing.findUnique({ where: { id: item.listingId } });
          if (listing) {
            const newQty = Math.max(0, listing.quantity - item.allocatedQty);
            await tx.cropListing.update({
              where: { id: item.listingId },
              data: {
                quantity: newQty,
                status: newQty === 0 ? 'SOLD_OUT' : 'ACTIVE',
              },
            });
          }

          // Create notification for farmer
          await tx.notification.create({
            data: {
              userId: item.farmerId,
              title: 'New Bulk Procurement Order Confirmed!',
              message: `A buyer confirmed an aggregated procurement order for ${item.allocatedQty} kg of ${item.listing.cropName} at ₹${item.pricePerKg}/kg (Total: ₹${item.itemTotalCost}).`,
              type: 'ORDER',
              link: `/farmer/orders`,
            },
          });
        }

        // Update plan status
        await tx.procurementPlan.update({
          where: { id: plan.id },
          data: { status: 'ORDERED' },
        });

        // Update requirement status
        await tx.buyerRequirement.update({
          where: { id: plan.requirementId },
          data: { status: 'FULFILLED' },
        });

        return createdOrder;
      });

      res.status(201).json({
        message: 'Order created successfully from procurement plan',
        order,
      });
    } catch (error: any) {
      console.error('Order creation error:', error);
      res.status(500).json({ message: 'Failed to create order from procurement plan' });
    }
  }
);

/**
 * Get Buyer's Procurement Plans
 */
router.get('/plans', authenticate, requireRole(['BUYER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const plans = await prisma.procurementPlan.findMany({
      where: req.user?.role === 'ADMIN' ? {} : { buyerId: req.user!.id },
      include: {
        requirement: true,
        items: {
          include: {
            listing: {
              include: {
                farmer: {
                  select: { id: true, name: true, phone: true },
                },
              },
            },
          },
        },
        orders: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch procurement plans' });
  }
});

export default router;
