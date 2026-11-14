import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * Get Orders (Filtered by role: Buyer, Farmer, Admin)
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let orders;
    if (role === 'ADMIN') {
      orders = await prisma.order.findMany({
        include: {
          buyer: { select: { id: true, name: true, phone: true, email: true, buyerProfile: true } },
          items: {
            include: {
              listing: true,
              farmer: { select: { id: true, name: true, phone: true, farmerProfile: true } },
            },
          },
          payments: true,
          disputes: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'BUYER') {
      orders = await prisma.order.findMany({
        where: { buyerId: userId },
        include: {
          items: {
            include: {
              listing: { include: { images: true } },
              farmer: { select: { id: true, name: true, phone: true, farmerProfile: true } },
            },
          },
          payments: true,
          disputes: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // FARMER: Return orders where farmer has items
      orders = await prisma.order.findMany({
        where: {
          items: {
            some: { farmerId: userId },
          },
        },
        include: {
          buyer: { select: { id: true, name: true, phone: true, buyerProfile: true } },
          items: {
            where: { farmerId: userId },
            include: {
              listing: { include: { images: true } },
            },
          },
          payments: true,
          disputes: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

/**
 * Get Single Order Details
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, phone: true, email: true, buyerProfile: true } },
        items: {
          include: {
            listing: { include: { images: true, farmLocation: true } },
            farmer: { select: { id: true, name: true, phone: true, farmerProfile: true } },
          },
        },
        payments: true,
        disputes: true,
      },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Role access check
    const isBuyer = order.buyerId === req.user!.id;
    const isFarmer = order.items.some((item) => item.farmerId === req.user!.id);
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isBuyer && !isFarmer && !isAdmin) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
});

/**
 * Update Order or OrderItem Status
 */
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, itemId, trackingNumber } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // If updating a specific item
    if (itemId) {
      const item = order.items.find((i) => i.id === itemId);
      if (!item) {
        res.status(404).json({ message: 'Order item not found' });
        return;
      }

      if (item.farmerId !== req.user!.id && req.user!.role !== 'ADMIN') {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      await prisma.orderItem.update({
        where: { id: itemId },
        data: {
          itemStatus: status,
          trackingNumber: trackingNumber || undefined,
          dispatchedAt: status === 'IN_TRANSIT' ? new Date() : undefined,
          deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
        },
      });
    }

    // Update parent order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status || undefined,
        paymentStatus: status === 'DELIVERED' ? 'RELEASED' : undefined,
      },
      include: { items: true },
    });

    // Notify parties
    await prisma.notification.create({
      data: {
        userId: order.buyerId,
        title: `Order Status: ${status}`,
        message: `Order #${order.orderNumber} status has changed to "${status}".`,
        type: 'ORDER',
        link: `/buyer/orders`,
      },
    });

    res.json({ message: 'Status updated successfully', order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

/**
 * Raise a Dispute on an Order
 */
router.post('/:id/dispute', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, description, againstUserId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const targetUser = againstUserId || (req.user!.id === order.buyerId ? order.items[0]?.farmerId : order.buyerId);

    const dispute = await prisma.dispute.create({
      data: {
        orderId: id,
        raisedById: req.user!.id,
        againstUserId: targetUser,
        reason: reason || 'Quality / Delivery discrepancy',
        description,
        status: 'OPEN',
      },
    });

    // Put payment in escrow hold
    await prisma.order.update({
      where: { id },
      data: { paymentStatus: 'ESCROW_HELD' },
    });

    res.status(201).json({ message: 'Dispute submitted for admin review', dispute });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to raise dispute' });
  }
});

export default router;
