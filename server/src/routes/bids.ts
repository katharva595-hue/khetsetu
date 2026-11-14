import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * Place a Bid (Buyer)
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { listingId, offeredPrice, quantity, message } = req.body;
    const buyerId = req.user!.id;

    if (!listingId || !offeredPrice || !quantity) {
      res.status(400).json({ message: 'Listing, offered price, and quantity are required' });
      return;
    }

    const listing = await prisma.cropListing.findUnique({
      where: { id: listingId },
      include: { farmer: true },
    });

    if (!listing) {
      res.status(404).json({ message: 'Produce listing not found' });
      return;
    }

    if (listing.farmerId === buyerId) {
      res.status(400).json({ message: 'Farmers cannot bid on their own produce' });
      return;
    }

    const bid = await prisma.bid.create({
      data: {
        listingId,
        buyerId,
        offeredPrice: Number(offeredPrice),
        quantity: Number(quantity),
        message,
        status: 'PENDING',
      },
      include: {
        listing: true,
        buyer: { select: { id: true, name: true, phone: true } },
      },
    });

    // Notify Farmer
    await prisma.notification.create({
      data: {
        userId: listing.farmerId,
        title: 'New Bid Received!',
        message: `${req.user!.name} offered ₹${offeredPrice}/kg for ${quantity} kg of ${listing.cropName}.`,
        type: 'BID',
        link: `/farmer/bids`,
      },
    });

    res.status(201).json({ message: 'Bid submitted successfully', bid });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to place bid' });
  }
});

/**
 * Get User Bids (Farmer sees incoming bids, Buyer sees outgoing bids)
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const isFarmer = req.user!.role === 'FARMER';

    let bids;
    if (isFarmer) {
      bids = await prisma.bid.findMany({
        where: {
          listing: {
            farmerId: userId,
          },
        },
        include: {
          listing: {
            include: { images: true },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              phone: true,
              buyerProfile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      bids = await prisma.bid.findMany({
        where: { buyerId: userId },
        include: {
          listing: {
            include: {
              images: true,
              farmer: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  farmerProfile: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json(bids);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch bids' });
  }
});

/**
 * Respond to Bid (Accept, Reject, Counter)
 */
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, counterPrice, counterMessage } = req.body; // 'ACCEPTED' | 'REJECTED' | 'COUNTERED'

    const bid = await prisma.bid.findUnique({
      where: { id },
      include: {
        listing: true,
        buyer: true,
      },
    });

    if (!bid) {
      res.status(404).json({ message: 'Bid not found' });
      return;
    }

    const isFarmer = bid.listing.farmerId === req.user!.id;
    const isBuyer = bid.buyerId === req.user!.id;

    if (!isFarmer && !isBuyer && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const updatedBid = await prisma.bid.update({
      where: { id },
      data: {
        status,
        counterPrice: counterPrice ? Number(counterPrice) : undefined,
        counterMessage: counterMessage || undefined,
      },
      include: {
        listing: true,
        buyer: { select: { id: true, name: true, phone: true } },
      },
    });

    // Notify recipient
    const recipientId = isFarmer ? bid.buyerId : bid.listing.farmerId;
    let notificationText = `Bid status updated to ${status} for ${bid.listing.cropName}.`;
    if (status === 'COUNTERED') {
      notificationText = `Farmer countered your bid on ${bid.listing.cropName} with ₹${counterPrice}/kg: "${counterMessage || ''}"`;
    } else if (status === 'ACCEPTED') {
      notificationText = `Bid ACCEPTED for ${bid.quantity} kg of ${bid.listing.cropName} at ₹${bid.offeredPrice}/kg!`;
    }

    await prisma.notification.create({
      data: {
        userId: recipientId,
        title: `Bid ${status}`,
        message: notificationText,
        type: 'BID',
        link: isFarmer ? '/buyer/bids' : '/farmer/bids',
      },
    });

    res.json({ message: `Bid updated to ${status}`, bid: updatedBid });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update bid status' });
  }
});

/**
 * Convert Accepted Bid into an Order
 */
router.post('/:id/create-order', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { deliveryAddress = 'Direct Mandi Delivery / Farm Gate' } = req.body;

    const bid = await prisma.bid.findUnique({
      where: { id },
      include: {
        listing: { include: { farmer: true } },
        buyer: true,
      },
    });

    if (!bid || bid.status !== 'ACCEPTED') {
      res.status(400).json({ message: 'Only accepted bids can be converted to orders' });
      return;
    }

    if (bid.buyerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only buyer can execute order from accepted bid' });
      return;
    }

    const finalPrice = bid.counterPrice || bid.offeredPrice;
    const totalAmount = finalPrice * bid.quantity;
    const orderNumber = `KS-BID-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId: bid.buyerId,
          totalAmount,
          status: 'CONFIRMED',
          deliveryAddress,
          paymentStatus: 'ESCROW_HELD',
          paymentMethod: 'UPI / Escrow',
          notes: `Order created from accepted Bid #${bid.id.slice(0, 8)}`,
          items: {
            create: [
              {
                listingId: bid.listingId,
                farmerId: bid.listing.farmerId,
                quantity: bid.quantity,
                unitPrice: finalPrice,
                totalPrice: totalAmount,
                itemStatus: 'CONFIRMED',
              },
            ],
          },
          payments: {
            create: {
              amount: totalAmount,
              transactionId: `TXN-BID-${Date.now()}`,
              method: 'UPI / Escrow',
              status: 'COMPLETED',
            },
          },
        },
        include: { items: true },
      });

      // Deduct quantity from listing
      const newQty = Math.max(0, bid.listing.quantity - bid.quantity);
      await tx.cropListing.update({
        where: { id: bid.listingId },
        data: {
          quantity: newQty,
          status: newQty === 0 ? 'SOLD_OUT' : 'ACTIVE',
        },
      });

      return createdOrder;
    });

    res.status(201).json({ message: 'Order created successfully from accepted bid', order });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create order from bid' });
  }
});

export default router;
