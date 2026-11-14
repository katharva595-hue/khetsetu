import prisma from '../prisma';
import { calculateDistanceKm } from '../utils/distance';

export interface MatchingRequest {
  cropName: string;
  requiredQuantity: number;
  qualityGrade?: string; // 'GRADE_A' | 'GRADE_B' | 'GRADE_C' | 'ANY'
  minPrice?: number;
  maxPrice: number;
  maxDistanceKm?: number;
  deliveryDeadline: Date | string;
  buyerLat: number;
  buyerLng: number;
  preferredLocation?: string;
  strategy?: 'BALANCED' | 'LOWEST_PRICE' | 'SHORTEST_DISTANCE';
}

export interface MatchedFarmerItem {
  listingId: string;
  farmerId: string;
  farmerName: string;
  farmLocation: string;
  village: string;
  district: string;
  state: string;
  verifiedBadge: boolean;
  cropName: string;
  qualityGrade: string;
  availableStock: number;
  allocatedQty: number;
  pricePerKg: number;
  itemTotalCost: number;
  distanceKm: number;
  harvestDate: string;
  fulfillmentTimelineDays: number;
  score: number;
  reasonSelected: string;
}

export interface ProcurementMatchingResult {
  cropName: string;
  totalRequiredQty: number;
  totalMatchedQty: number;
  remainingShortage: number;
  fulfillmentPercentage: number;
  isFullyFulfilled: boolean;
  farmerCount: number;
  totalEstimatedCost: number;
  weightedAvgPrice: number;
  averageDistanceKm: number;
  estimatedDeliveryTimelineDays: number;
  strategyUsed: string;
  candidateListingsFound: number;
  items: MatchedFarmerItem[];
  explanationSummary: string;
}

/**
 * Intelligent Multi-Farmer Procurement Matching Engine
 */
export async function runProcurementMatching(
  params: MatchingRequest
): Promise<ProcurementMatchingResult> {
  const {
    cropName,
    requiredQuantity,
    qualityGrade,
    minPrice = 0,
    maxPrice,
    maxDistanceKm = 150,
    deliveryDeadline,
    buyerLat,
    buyerLng,
    strategy = 'BALANCED',
  } = params;

  const deadlineDate = new Date(deliveryDeadline);
  const now = new Date();
  const daysUntilDeadline = Math.max(
    1,
    Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  // 1. Fetch active listings for this crop or category
  const activeListings = await prisma.cropListing.findMany({
    where: {
      status: 'ACTIVE',
      quantity: { gt: 0 },
      pricePerKg: {
        gte: minPrice,
        lte: maxPrice,
      },
      OR: [
        { cropName: { contains: cropName } },
        { variety: { contains: cropName } },
      ],
    },
    include: {
      farmer: {
        include: {
          farmerProfile: {
            include: {
              locations: true,
            },
          },
        },
      },
      farmLocation: true,
      images: true,
    },
  });

  // 2. Score and Filter candidates
  const evaluatedCandidates: (MatchedFarmerItem & { sortKey: number })[] = [];

  for (const listing of activeListings) {
    // Quality grade filter
    if (qualityGrade && qualityGrade !== 'ANY' && listing.qualityGrade !== qualityGrade) {
      continue;
    }

    // Determine farm coordinates
    let fLat = buyerLat;
    let fLng = buyerLng;
    let locationLabel = 'Local Farm';
    let village = 'Local';
    let district = 'Local';
    let state = 'Local';

    if (listing.farmLocation) {
      fLat = listing.farmLocation.latitude;
      fLng = listing.farmLocation.longitude;
      locationLabel = `${listing.farmLocation.village}, ${listing.farmLocation.district}`;
      village = listing.farmLocation.village;
      district = listing.farmLocation.district;
      state = listing.farmLocation.state;
    } else if (listing.farmer.farmerProfile?.locations?.[0]) {
      const loc = listing.farmer.farmerProfile.locations[0];
      fLat = loc.latitude;
      fLng = loc.longitude;
      locationLabel = `${loc.village}, ${loc.district}`;
      village = loc.village;
      district = loc.district;
      state = loc.state;
    } else if (listing.farmer.farmerProfile) {
      village = listing.farmer.farmerProfile.village;
      district = listing.farmer.farmerProfile.district;
      state = listing.farmer.farmerProfile.state;
      locationLabel = `${village}, ${district}`;
    }

    const distanceKm = calculateDistanceKm(buyerLat, buyerLng, fLat, fLng);

    // Distance boundary check
    if (distanceKm > maxDistanceKm) {
      continue;
    }

    // Estimate transit and preparation timeline
    // Typical rural logistics: 1 day prep + 1 day per 150km transit
    const transitDays = Math.max(1, Math.ceil(distanceKm / 120));
    const fulfillmentTimelineDays = 1 + transitDays;

    if (fulfillmentTimelineDays > daysUntilDeadline) {
      // Exceeds buyer's required delivery window
      continue;
    }

    // Scoring system (multi-criteria decision analysis)
    // - Price weight: lower price relative to maxPrice is better
    // - Distance weight: shorter distance is better
    // - Farmer reliability / verification badge
    const priceScore = Math.max(0, (maxPrice - listing.pricePerKg) / (maxPrice || 1));
    const distanceScore = Math.max(0, (maxDistanceKm - distanceKm) / (maxDistanceKm || 1));
    const isVerified = listing.farmer.farmerProfile?.verifiedBadge || listing.farmer.isVerified;
    const verificationScore = isVerified ? 0.2 : 0;

    let overallScore = 0;
    let sortKey = 0;

    if (strategy === 'LOWEST_PRICE') {
      overallScore = priceScore * 0.7 + distanceScore * 0.2 + verificationScore;
      sortKey = listing.pricePerKg; // ascending
    } else if (strategy === 'SHORTEST_DISTANCE') {
      overallScore = distanceScore * 0.7 + priceScore * 0.2 + verificationScore;
      sortKey = distanceKm; // ascending
    } else {
      // BALANCED
      overallScore = priceScore * 0.45 + distanceScore * 0.45 + verificationScore * 0.1;
      sortKey = -overallScore; // descending
    }

    let reasonParts: string[] = [];
    if (listing.pricePerKg < maxPrice) {
      const savings = Math.round(((maxPrice - listing.pricePerKg) / maxPrice) * 100);
      reasonParts.push(`${savings}% below maximum budget (₹${listing.pricePerKg}/kg)`);
    } else {
      reasonParts.push(`Exact budget match at ₹${listing.pricePerKg}/kg`);
    }

    reasonParts.push(`${distanceKm} km transit distance (${village}, ${district})`);

    if (isVerified) {
      reasonParts.push(`Government-verified KYC Farmer`);
    }

    if (listing.qualityGrade === 'GRADE_A') {
      reasonParts.push(`High Grade A export quality`);
    }

    reasonParts.push(`Dispatch ready within ${fulfillmentTimelineDays} days`);

    evaluatedCandidates.push({
      listingId: listing.id,
      farmerId: listing.farmerId,
      farmerName: listing.farmer.name,
      farmLocation: locationLabel,
      village,
      district,
      state,
      verifiedBadge: isVerified,
      cropName: listing.cropName,
      qualityGrade: listing.qualityGrade,
      availableStock: listing.quantity,
      allocatedQty: 0,
      pricePerKg: listing.pricePerKg,
      itemTotalCost: 0,
      distanceKm,
      harvestDate: listing.harvestDate.toISOString().split('T')[0],
      fulfillmentTimelineDays,
      score: Math.round(overallScore * 100),
      reasonSelected: reasonParts.join(' • '),
      sortKey,
    });
  }

  // 3. Sort candidates according to chosen strategy
  if (strategy === 'LOWEST_PRICE') {
    evaluatedCandidates.sort((a, b) => a.pricePerKg - b.pricePerKg || a.distanceKm - b.distanceKm);
  } else if (strategy === 'SHORTEST_DISTANCE') {
    evaluatedCandidates.sort((a, b) => a.distanceKm - b.distanceKm || a.pricePerKg - b.pricePerKg);
  } else {
    // BALANCED
    evaluatedCandidates.sort((a, b) => b.score - a.score || a.pricePerKg - b.pricePerKg);
  }

  // 4. Greedy / Multi-farmer Supply Allocation
  let remainingNeed = requiredQuantity;
  const selectedItems: MatchedFarmerItem[] = [];
  let totalEstimatedCost = 0;
  let totalMatchedQty = 0;
  let totalWeightedDistance = 0;
  let maxTimelineDays = 1;

  for (const candidate of evaluatedCandidates) {
    if (remainingNeed <= 0) break;

    const allocation = Math.min(candidate.availableStock, remainingNeed);
    if (allocation > 0) {
      const itemCost = allocation * candidate.pricePerKg;
      totalEstimatedCost += itemCost;
      totalMatchedQty += allocation;
      totalWeightedDistance += candidate.distanceKm * allocation;
      remainingNeed -= allocation;

      if (candidate.fulfillmentTimelineDays > maxTimelineDays) {
        maxTimelineDays = candidate.fulfillmentTimelineDays;
      }

      selectedItems.push({
        listingId: candidate.listingId,
        farmerId: candidate.farmerId,
        farmerName: candidate.farmerName,
        farmLocation: candidate.farmLocation,
        village: candidate.village,
        district: candidate.district,
        state: candidate.state,
        verifiedBadge: candidate.verifiedBadge,
        cropName: candidate.cropName,
        qualityGrade: candidate.qualityGrade,
        availableStock: candidate.availableStock,
        allocatedQty: allocation,
        pricePerKg: candidate.pricePerKg,
        itemTotalCost: Math.round(itemCost * 100) / 100,
        distanceKm: candidate.distanceKm,
        harvestDate: candidate.harvestDate,
        fulfillmentTimelineDays: candidate.fulfillmentTimelineDays,
        score: candidate.score,
        reasonSelected: candidate.reasonSelected,
      });
    }
  }

  const remainingShortage = Math.max(0, requiredQuantity - totalMatchedQty);
  const fulfillmentPercentage =
    requiredQuantity > 0 ? Math.min(100, Math.round((totalMatchedQty / requiredQuantity) * 1000) / 10) : 0;
  const weightedAvgPrice =
    totalMatchedQty > 0 ? Math.round((totalEstimatedCost / totalMatchedQty) * 100) / 100 : 0;
  const averageDistanceKm =
    totalMatchedQty > 0 ? Math.round((totalWeightedDistance / totalMatchedQty) * 10) / 10 : 0;

  // Build human-readable explanation
  let explanationSummary = '';
  if (selectedItems.length === 0) {
    explanationSummary = `No active listings found matching "${cropName}" within ${maxDistanceKm}km and max budget ₹${maxPrice}/kg. Consider increasing distance or max price parameters.`;
  } else if (remainingShortage === 0) {
    explanationSummary = `Successfully matched 100% of ${requiredQuantity} kg ${cropName} across ${selectedItems.length} nearby farmer${
      selectedItems.length > 1 ? 's' : ''
    } at a weighted average price of ₹${weightedAvgPrice}/kg (Avg distance: ${averageDistanceKm} km). All produce can be delivered within ${maxTimelineDays} days.`;
  } else {
    explanationSummary = `Partial match: Secured ${totalMatchedQty} kg (${fulfillmentPercentage}%) from ${selectedItems.length} nearby farmer${
      selectedItems.length > 1 ? 's' : ''
    }. Remaining shortage: ${remainingShortage} kg. Weighted average price ₹${weightedAvgPrice}/kg.`;
  }

  return {
    cropName,
    totalRequiredQty: requiredQuantity,
    totalMatchedQty,
    remainingShortage,
    fulfillmentPercentage,
    isFullyFulfilled: remainingShortage === 0 && totalMatchedQty > 0,
    farmerCount: selectedItems.length,
    totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
    weightedAvgPrice,
    averageDistanceKm,
    estimatedDeliveryTimelineDays: maxTimelineDays,
    strategyUsed: strategy,
    candidateListingsFound: activeListings.length,
    items: selectedItems,
    explanationSummary,
  };
}
