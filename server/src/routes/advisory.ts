import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate, optionalAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * Get Agricultural Advisories
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, crop, search } = req.query;
    const whereClause: any = {};

    if (category && category !== 'ALL') {
      whereClause.category = String(category);
    }

    if (crop && crop !== 'ALL') {
      whereClause.cropName = { contains: String(crop) };
    }

    if (search) {
      const q = String(search);
      whereClause.OR = [
        { title: { contains: q } },
        { cropName: { contains: q } },
        { description: { contains: q } },
        { solution: { contains: q } },
      ];
    }

    const advisories = await prisma.agriculturalAdvisory.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.json(advisories);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch advisories' });
  }
});

/**
 * Get Farmer's Farming Queries
 */
router.get('/queries', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const isFarmer = req.user!.role === 'FARMER';

    const queries = await prisma.farmingQuery.findMany({
      where: isFarmer ? { farmerId: userId } : {},
      include: {
        farmer: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(queries);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch queries' });
  }
});

/**
 * Submit a Farming Query & Get AI Diagnostic Guidance
 */
router.post('/queries', authenticate, requireRole(['FARMER']), async (req: AuthRequest, res: Response) => {
  try {
    const { cropName, queryText, imageUrl } = req.body;
    const farmerId = req.user!.id;

    if (!cropName || !queryText) {
      res.status(400).json({ message: 'Crop name and query details are required' });
      return;
    }

    // AI Agronomy Knowledge Engine
    const qLower = queryText.toLowerCase();
    let diagnosticSolution = '';
    let recommendation = '';

    if (qLower.includes('yellow') || qLower.includes('rust') || qLower.includes('leaf')) {
      diagnosticSolution =
        'Potential Nitrogen deficiency or Early Fungal Leaf Spot / Yellow Rust. Recommendation: Apply balanced foliar spray of Urea (2%) or micro-nutrient mixture. For rust symptoms, consider Propiconazole 25% EC @ 1ml/L.';
      recommendation = 'Maintain optimal field drainage and inspect leaf undersides for pustules.';
    } else if (qLower.includes('caterpillar') || qLower.includes('worm') || qLower.includes('borer') || qLower.includes('pest')) {
      diagnosticSolution =
        'Likely Fall Armyworm, Pod Borer (Helicoverpa), or Spodoptera infestation. Recommendation: Install pheromone traps (5 traps/acre). Use biological control like Neem oil (Azadirachtin 10,000 ppm @ 2-3ml/L) or Emamectin Benzoate 5% SG @ 0.5g/L during early instars.';
      recommendation = 'Spray during late afternoon hours to target nocturnal larvae.';
    } else if (qLower.includes('wilt') || qLower.includes('dry') || qLower.includes('root')) {
      diagnosticSolution =
        'Symptoms indicate Fusarium Wilt or Root Rot exacerbated by soil moisture imbalance. Recommendation: Drench root zone with Trichoderma viride @ 5g/L or Carbendazim @ 2g/L. Avoid water stagnation.';
      recommendation = 'Ensure solarization and practice crop rotation with non-host crops.';
    } else if (qLower.includes('yield') || qLower.includes('fertilizer') || qLower.includes('growth')) {
      diagnosticSolution =
        `For maximizing ${cropName} yield: Implement split nitrogen application (50% basal, 25% at first irrigation, 25% at tillering/flowering). Supplement with Zinc Sulphate (25 kg/ha basal) and bio-fertilizers (Azotobacter & PSB).`;
      recommendation = 'Conduct regular soil testing to calibrate N-P-K balance.';
    } else {
      diagnosticSolution =
        `Agronomy Assessment for ${cropName}: Ensure appropriate soil moisture and weed-free intervals during critical growth stages. Monitor for early vegetative pest pressure and maintain micronutrient balance.`;
      recommendation = 'For definitive laboratory identification, contact the nearest Krishi Vigyan Kendra (KVK).';
    }

    const aiResponseText = `[AI Agronomy Assistant]: ${diagnosticSolution}\n\nPreventive Advice: ${recommendation}\n\nDisclaimer: This diagnosis is advisory. Verify with your district agricultural extension officer before heavy chemical interventions.`;

    const query = await prisma.farmingQuery.create({
      data: {
        farmerId,
        cropName,
        queryText,
        imageUrl: imageUrl || null,
        status: 'ANSWERED',
        aiResponse: aiResponseText,
        answeredAt: new Date(),
      },
    });

    res.status(201).json({
      message: 'Query analyzed and recorded successfully',
      query,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to submit farming query' });
  }
});

/**
 * Admin: Add New Advisory
 */
router.post('/', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      category,
      cropName,
      description,
      symptoms,
      solution,
      preventiveMeasures,
      seasonalTiming,
      severity = 'MODERATE',
      imageUrl,
    } = req.body;

    const advisory = await prisma.agriculturalAdvisory.create({
      data: {
        title,
        category,
        cropName,
        description,
        symptoms,
        solution,
        preventiveMeasures,
        seasonalTiming,
        severity,
        imageUrl,
      },
    });

    res.status(201).json({ message: 'Advisory added successfully', advisory });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create advisory' });
  }
});

export default router;
