import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate, optionalAuth, requireRole, AuthRequest } from '../middleware/auth';
import { calculateDistanceKm } from '../utils/distance';

const router = Router();

/**
 * Get all crop categories
 */
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.cropCategory.findMany({
      include: {
        _count: {
          select: { listings: true },
        },
      },
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

/**
 * Browse Marketplace Listings (Public or Authenticated)
 */
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      crop,
      category,
      grade,
      minPrice,
      maxPrice,
      search,
      sortBy = 'newest',
      lat,
      lng,
    } = req.query;

    const whereClause: any = {
      status: 'ACTIVE',
      quantity: { gt: 0 },
    };

    if (crop) {
      whereClause.cropName = { contains: String(crop) };
    }

    if (category) {
      whereClause.category = { slug: String(category) };
    }

    if (grade && grade !== 'ALL') {
      whereClause.qualityGrade = String(grade);
    }

    if (minPrice || maxPrice) {
      whereClause.pricePerKg = {};
      if (minPrice) whereClause.pricePerKg.gte = Number(minPrice);
      if (maxPrice) whereClause.pricePerKg.lte = Number(maxPrice);
    }

    if (search) {
      const q = String(search);
      whereClause.OR = [
        { cropName: { contains: q } },
        { variety: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const listings = await prisma.cropListing.findMany({
      where: whereClause,
      include: {
        category: true,
        images: true,
        farmLocation: true,
        farmer: {
          select: {
            id: true,
            name: true,
            isVerified: true,
            avatarUrl: true,
            farmerProfile: {
              select: {
                village: true,
                district: true,
                state: true,
                verifiedBadge: true,
                farmAreaAcres: true,
                experienceYears: true,
                soilType: true,
              },
            },
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: sortBy === 'price_asc'
        ? { pricePerKg: 'asc' }
        : sortBy === 'price_desc'
        ? { pricePerKg: 'desc' }
        : { createdAt: 'desc' },
    });

    // Compute distance if lat & lng are provided
    const userLat = lat ? Number(lat) : null;
    const userLng = lng ? Number(lng) : null;

    let enrichedListings = listings.map((listing) => {
      let distanceKm: number | null = null;
      if (userLat !== null && userLng !== null) {
        const farmLat = listing.farmLocation?.latitude ?? 22.7196;
        const farmLng = listing.farmLocation?.longitude ?? 75.8577;
        distanceKm = calculateDistanceKm(userLat, userLng, farmLat, farmLng);
      }

      return {
        ...listing,
        distanceKm,
        // Hide private phone & email from open marketplace browsing
        farmer: {
          id: listing.farmer.id,
          name: listing.farmer.name,
          isVerified: listing.farmer.isVerified || listing.farmer.farmerProfile?.verifiedBadge,
          avatarUrl: listing.farmer.avatarUrl,
          location: listing.farmLocation
            ? `${listing.farmLocation.village}, ${listing.farmLocation.district}, ${listing.farmLocation.state}`
            : `${listing.farmer.farmerProfile?.village || 'Local'}, ${listing.farmer.farmerProfile?.district || 'Mandi'}`,
          farmAreaAcres: listing.farmer.farmerProfile?.farmAreaAcres,
          experienceYears: listing.farmer.farmerProfile?.experienceYears,
        },
      };
    });

    if (sortBy === 'distance' && userLat !== null && userLng !== null) {
      enrichedListings.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    res.json(enrichedListings);
  } catch (error: any) {
    console.error('Listings fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch marketplace listings' });
  }
});

/**
 * Get Single Listing Details
 */
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const listing = await prisma.cropListing.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        farmLocation: true,
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true, // Only exposed if authenticated buyer/farmer
            email: true,
            isVerified: true,
            avatarUrl: true,
            farmerProfile: true,
          },
        },
        bids: {
          where: req.user ? { buyerId: req.user.id } : { id: 'none' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!listing) {
      res.status(404).json({ message: 'Produce listing not found' });
      return;
    }

    // Increment view counter
    await prisma.cropListing.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    // Mask sensitive contact details if user is not authenticated or not the owner/admin
    const isOwner = req.user?.id === listing.farmerId;
    const isAdmin = req.user?.role === 'ADMIN';

    const sanitizedFarmer = {
      ...listing.farmer,
      phone: isOwner || isAdmin ? listing.farmer.phone : `${listing.farmer.phone.slice(0, 3)}****${listing.farmer.phone.slice(-3)}`,
      email: isOwner || isAdmin ? listing.farmer.email : `${listing.farmer.email.slice(0, 3)}***@***`,
    };

    res.json({
      ...listing,
      farmer: sanitizedFarmer,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch listing details' });
  }
});

/**
 * Farmer: Get My Listings
 */
router.get('/farmer/my', authenticate, requireRole(['FARMER']), async (req: AuthRequest, res: Response) => {
  try {
    const listings = await prisma.cropListing.findMany({
      where: { farmerId: req.user!.id },
      include: {
        category: true,
        images: true,
        farmLocation: true,
        bids: {
          include: {
            buyer: {
              select: { id: true, name: true, buyerProfile: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { bids: true, orderItems: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(listings);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch farmer listings' });
  }
});

/**
 * Farmer: Create New Produce Listing
 */
router.post('/', authenticate, requireRole(['FARMER']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      categoryId,
      cropName,
      variety,
      description,
      quantity,
      unit = 'kg',
      pricePerKg,
      qualityGrade = 'GRADE_A',
      harvestDate,
      availableUntil,
      deliveryRadiusKm = 50,
      imageUrls = [],
    } = req.body;

    if (!cropName || !categoryId || !quantity || !pricePerKg || !description) {
      res.status(400).json({ message: 'Missing required listing information' });
      return;
    }

    // Get farmer profile location
    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId: req.user!.id },
      include: { locations: true },
    });

    const primaryLocationId = farmerProfile?.locations?.[0]?.id || null;

    const listing = await prisma.cropListing.create({
      data: {
        farmerId: req.user!.id,
        categoryId,
        cropName,
        variety: variety || null,
        description,
        quantity: Number(quantity),
        unit,
        pricePerKg: Number(pricePerKg),
        qualityGrade,
        harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
        availableUntil: availableUntil
          ? new Date(availableUntil)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        deliveryRadiusKm: Number(deliveryRadiusKm),
        farmLocationId: primaryLocationId,
        status: 'ACTIVE',
      },
    });

    // Add crop images
    const imagesToCreate = Array.isArray(imageUrls) && imageUrls.length > 0
      ? imageUrls.map((url: string, index: number) => ({
          listingId: listing.id,
          imageUrl: url,
          isPrimary: index === 0,
        }))
      : [
          {
            listingId: listing.id,
            imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
            isPrimary: true,
          },
        ];

    await prisma.cropImage.createMany({
      data: imagesToCreate,
    });

    const fullListing = await prisma.cropListing.findUnique({
      where: { id: listing.id },
      include: {
        category: true,
        images: true,
        farmLocation: true,
      },
    });

    res.status(201).json({
      message: 'Produce listing created successfully',
      listing: fullListing,
    });
  } catch (error: any) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Failed to create produce listing', error: error.message });
  }
});

/**
 * Farmer: Update Listing
 */
router.put('/:id', authenticate, requireRole(['FARMER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      cropName,
      variety,
      description,
      quantity,
      pricePerKg,
      qualityGrade,
      status,
      deliveryRadiusKm,
    } = req.body;

    const existing = await prisma.cropListing.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Listing not found' });
      return;
    }

    if (existing.farmerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized to modify this listing' });
      return;
    }

    const updated = await prisma.cropListing.update({
      where: { id },
      data: {
        cropName: cropName || undefined,
        variety: variety !== undefined ? variety : undefined,
        description: description || undefined,
        quantity: quantity !== undefined ? Number(quantity) : undefined,
        pricePerKg: pricePerKg !== undefined ? Number(pricePerKg) : undefined,
        qualityGrade: qualityGrade || undefined,
        status: status || undefined,
        deliveryRadiusKm: deliveryRadiusKm !== undefined ? Number(deliveryRadiusKm) : undefined,
      },
      include: {
        category: true,
        images: true,
        farmLocation: true,
      },
    });

    res.json({ message: 'Listing updated successfully', listing: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update listing' });
  }
});

/**
 * Farmer / Admin: Delete Listing
 */
router.delete('/:id', authenticate, requireRole(['FARMER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.cropListing.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Listing not found' });
      return;
    }

    if (existing.farmerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Not authorized to delete this listing' });
      return;
    }

    await prisma.cropListing.delete({ where: { id } });
    res.json({ message: 'Listing deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete listing' });
  }
});

export default router;
