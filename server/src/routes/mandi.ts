import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * Get Mandi Prices with Filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { commodity, state, district, search } = req.query;

    const whereClause: any = {};

    if (commodity && commodity !== 'ALL') {
      whereClause.commodity = { contains: String(commodity) };
    }

    if (state && state !== 'ALL') {
      whereClause.state = String(state);
    }

    if (district && district !== 'ALL') {
      whereClause.district = String(district);
    }

    if (search) {
      const q = String(search);
      whereClause.OR = [
        { commodity: { contains: q } },
        { marketName: { contains: q } },
        { district: { contains: q } },
      ];
    }

    const prices = await prisma.marketPrice.findMany({
      where: whereClause,
      orderBy: { priceDate: 'desc' },
    });

    // Compute distinct lists for dropdowns
    const commodities = await prisma.marketPrice.findMany({
      select: { commodity: true },
      distinct: ['commodity'],
    });

    const states = await prisma.marketPrice.findMany({
      select: { state: true },
      distinct: ['state'],
    });

    res.json({
      prices,
      commodities: commodities.map((c) => c.commodity),
      states: states.map((s) => s.state),
      source: 'APMC Electronic Price Feeds & Agmarknet Daily Reporting',
      lastRefreshed: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch mandi prices' });
  }
});

/**
 * Admin: Add or Update Mandi Price
 */
router.post('/', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      commodity,
      state,
      district,
      marketName,
      minPrice,
      maxPrice,
      modalPrice,
      source = 'Official State Agricultural Marketing Board',
    } = req.body;

    if (!commodity || !state || !district || !marketName || !modalPrice) {
      res.status(400).json({ message: 'Missing required mandi price fields' });
      return;
    }

    const newPrice = await prisma.marketPrice.create({
      data: {
        commodity,
        state,
        district,
        marketName,
        minPrice: Number(minPrice || modalPrice * 0.9),
        maxPrice: Number(maxPrice || modalPrice * 1.1),
        modalPrice: Number(modalPrice),
        source,
        isVerifiedGov: true,
      },
    });

    res.status(201).json({ message: 'Mandi price recorded successfully', price: newPrice });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to record mandi price' });
  }
});

export default router;
