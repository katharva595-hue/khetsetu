import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * Get User's Active Conversations
 */
router.get('/conversations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ farmerId: userId }, { buyerId: userId }],
      },
      include: {
        farmer: { select: { id: true, name: true, avatarUrl: true, role: true } },
        buyer: { select: { id: true, name: true, avatarUrl: true, role: true } },
        listing: { select: { id: true, cropName: true, pricePerKg: true, quantity: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    const enriched = conversations.map((conv) => {
      const otherUser = conv.farmerId === userId ? conv.buyer : conv.farmer;
      const lastMsg = conv.messages[0] || null;
      return {
        id: conv.id,
        otherUser,
        listing: conv.listing,
        lastMessage: lastMsg ? lastMsg.text : 'Start of conversation',
        lastMessageAt: conv.lastMessageAt,
      };
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

/**
 * Start or Get Conversation with a user / listing
 */
router.post('/conversations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { targetUserId, listingId } = req.body;
    const currentUserId = req.user!.id;

    if (!targetUserId) {
      res.status(400).json({ message: 'Target user ID is required' });
      return;
    }

    const isFarmer = req.user!.role === 'FARMER';
    const farmerId = isFarmer ? currentUserId : targetUserId;
    const buyerId = isFarmer ? targetUserId : currentUserId;

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        farmerId,
        buyerId,
        ...(listingId ? { listingId } : {}),
      },
      include: {
        farmer: { select: { id: true, name: true, avatarUrl: true } },
        buyer: { select: { id: true, name: true, avatarUrl: true } },
        listing: true,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          farmerId,
          buyerId,
          listingId: listingId || null,
        },
        include: {
          farmer: { select: { id: true, name: true, avatarUrl: true } },
          buyer: { select: { id: true, name: true, avatarUrl: true } },
          listing: true,
        },
      });
    }

    res.json(conversation);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create conversation' });
  }
});

/**
 * Get Messages in Conversation
 */
router.get('/conversations/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    if (conversation.farmerId !== userId && conversation.buyerId !== userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

/**
 * Send Message (REST fallback)
 */
router.post('/conversations/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const senderId = req.user!.id;

    if (!text || text.trim() === '') {
      res.status(400).json({ message: 'Message text cannot be empty' });
      return;
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId,
        text,
      },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    });

    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    // Receiver ID
    const receiverId = conversation.farmerId === senderId ? conversation.buyerId : conversation.farmerId;
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: `New Message from ${req.user!.name}`,
        message: text.slice(0, 100),
        type: 'SYSTEM',
        link: `/messages`,
      },
    });

    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to send message' });
  }
});

export default router;
