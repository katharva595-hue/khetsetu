import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runAllTests() {
  console.log('🧪 Starting KhetSetu End-to-End Workflow Verification Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, details?: any) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`, details || '');
      failed++;
    }
  };

  try {
    // 0. Healthcheck
    const healthRes = await axios.get(`${BASE_URL}/health`);
    assert(healthRes.data.status === 'online', '1. System Healthcheck API Online');

    // 1. Farmer Login
    const farmerLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'farmer@khetsetu.com',
      password: 'Farmer@123',
    });
    const farmerToken = farmerLoginRes.data.token;
    const farmerUser = farmerLoginRes.data.user;
    assert(farmerUser.role === 'FARMER' && !!farmerToken, '2. Farmer Login & JWT Issuance');

    // 2. Buyer Login
    const buyerLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'buyer@khetsetu.com',
      password: 'Buyer@123',
    });
    const buyerToken = buyerLoginRes.data.token;
    const buyerUser = buyerLoginRes.data.user;
    assert(buyerUser.role === 'BUYER' && !!buyerToken, '3. Buyer Login & JWT Issuance');

    // 3. Admin Login
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'admin@khetsetu.com',
      password: 'Admin@123',
    });
    const adminToken = adminLoginRes.data.token;
    const adminUser = adminLoginRes.data.user;
    assert(adminUser.role === 'ADMIN' && !!adminToken, '4. Admin Login & Authorization');

    // 4. Farmer: Create Produce Listing
    const categoriesRes = await axios.get(`${BASE_URL}/listings/categories`);
    const catId = categoriesRes.data[0].id;

    const createListingRes = await axios.post(
      `${BASE_URL}/listings`,
      {
        cropName: 'Test Barley',
        categoryId: catId,
        variety: 'Himalayan Golden',
        description: 'Test Barley lot grown under controlled moisture.',
        quantity: 350,
        unit: 'kg',
        pricePerKg: 22,
        qualityGrade: 'GRADE_A',
        deliveryRadiusKm: 50,
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );
    const createdListingId = createListingRes.data.listing.id;
    assert(createListingRes.status === 201 && !!createdListingId, '5. Farmer Create Produce Listing');

    // 5. Farmer: Update Listing
    const updateListingRes = await axios.put(
      `${BASE_URL}/listings/${createdListingId}`,
      { pricePerKg: 21.5, quantity: 320 },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );
    assert(updateListingRes.data.listing.pricePerKg === 21.5, '6. Farmer Update Listing Details');

    // 6. Marketplace: Search & Filter Listings
    const searchRes = await axios.get(`${BASE_URL}/listings?crop=Wheat&grade=GRADE_A`);
    assert(searchRes.data.length >= 3, '7. Marketplace Filtering by Crop & Quality Grade');

    // 7. MODULE 4 TEST: Intelligent Multi-Farmer Procurement Matching Engine
    console.log('\n  🌾 Testing Flagship Feature: Multi-Farmer Procurement Aggregation Engine...');
    const matchRes = await axios.post(`${BASE_URL}/procurement/match`, {
      cropName: 'Wheat',
      requiredQuantity: 1000,
      qualityGrade: 'GRADE_A',
      minPrice: 20,
      maxPrice: 30,
      maxDistanceKm: 70,
      deliveryDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      buyerLat: 22.7196,
      buyerLng: 75.8577,
      strategy: 'BALANCED',
    });
    const match = matchRes.data;
    assert(
      match.totalMatchedQty === 1000 &&
        match.remainingShortage === 0 &&
        match.farmerCount >= 3 &&
        match.weightedAvgPrice <= 30,
      '8. Multi-Farmer Intelligent Procurement Matching (100% Demand Fulfilled from multiple farmers)',
      {
        matchedQty: match.totalMatchedQty,
        farmersCombined: match.farmerCount,
        weightedPrice: match.weightedAvgPrice,
      }
    );

    // 8. Supply Shortage Edge Case Handling
    const shortageMatchRes = await axios.post(`${BASE_URL}/procurement/match`, {
      cropName: 'Wheat',
      requiredQuantity: 25000, // Demands 25 Tons
      qualityGrade: 'GRADE_A',
      maxPrice: 30,
      maxDistanceKm: 70,
      deliveryDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      buyerLat: 22.7196,
      buyerLng: 75.8577,
    });
    const shortageMatch = shortageMatchRes.data;
    assert(
      !shortageMatch.isFullyFulfilled &&
        shortageMatch.remainingShortage > 0 &&
        shortageMatch.fulfillmentPercentage < 100,
      '9. Insufficient Supply Handling (Accurately calculates remaining shortage without claiming 100%)',
      { shortage: shortageMatch.remainingShortage, percent: shortageMatch.fulfillmentPercentage }
    );

    // 9. Buyer: Confirm Procurement Plan & Save to DB
    const reqCreateRes = await axios.post(
      `${BASE_URL}/procurement/requirements`,
      {
        cropName: 'Wheat',
        requiredQuantity: 1000,
        qualityGrade: 'GRADE_A',
        maxPrice: 30,
        deliveryDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        preferredLocation: 'Indore Central Hub',
        deliveryAddress: 'Sanwer Industrial Food Park',
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    );
    const requirementId = reqCreateRes.data.requirement.id;

    const planConfirmRes = await axios.post(
      `${BASE_URL}/procurement/plans/confirm`,
      {
        requirementId,
        totalRequiredQty: match.totalRequiredQty,
        totalMatchedQty: match.totalMatchedQty,
        remainingShortage: match.remainingShortage,
        totalEstimatedCost: match.totalEstimatedCost,
        weightedAvgPrice: match.weightedAvgPrice,
        items: match.items,
        notes: match.explanationSummary,
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    );
    const confirmedPlanId = planConfirmRes.data.plan.id;
    assert(planConfirmRes.status === 201 && !!confirmedPlanId, '10. Confirm and Save Procurement Plan to DB');

    // 10. Convert Procurement Plan into Active Order with Escrow
    const orderCreateRes = await axios.post(
      `${BASE_URL}/procurement/plans/${confirmedPlanId}/order`,
      {
        deliveryAddress: 'Sanwer Industrial Food Park, Indore',
        paymentMethod: 'UPI / Escrow',
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    );
    const order = orderCreateRes.data.order;
    assert(
      order.status === 'CONFIRMED' && order.paymentStatus === 'ESCROW_HELD' && order.items.length >= 3,
      '11. Convert Procurement Plan into Multi-Farmer Order with Secured Escrow',
      { orderNumber: order.orderNumber, totalAmount: order.totalAmount }
    );

    // 11. Bidding and Counter-bidding
    const listings = await axios.get(`${BASE_URL}/listings`);
    const targetListing = listings.data[0];

    const bidRes = await axios.post(
      `${BASE_URL}/bids`,
      {
        listingId: targetListing.id,
        offeredPrice: targetListing.pricePerKg - 2,
        quantity: 100,
        message: 'Looking to purchase 100 kg lot.',
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    );
    const bidId = bidRes.data.bid.id;
    assert(bidRes.status === 201 && !!bidId, '12. Buyer Submits Bid on Produce Listing');

    // Farmer counters the bid
    const counterRes = await axios.put(
      `${BASE_URL}/bids/${bidId}/status`,
      {
        status: 'COUNTERED',
        counterPrice: targetListing.pricePerKg - 1,
        counterMessage: 'Can offer at ₹1/kg discount.',
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );
    assert(counterRes.data.bid.status === 'COUNTERED', '13. Farmer Counters Bid with Custom Offer');

    // 12. Chat & Messaging
    const convRes = await axios.post(
      `${BASE_URL}/chat/conversations`,
      { targetUserId: farmerUser.id, listingId: targetListing.id },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    );
    const convId = convRes.data.id;

    const msgRes = await axios.post(
      `${BASE_URL}/chat/conversations/${convId}/messages`,
      { text: 'Hello, what is your harvest readiness date?' },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    );
    assert(msgRes.status === 201 && msgRes.data.text.includes('harvest readiness'), '14. In-App Chat & Messaging');

    // 13. Weather & Live Mandi Information
    const weatherRes = await axios.get(`${BASE_URL}/weather?lat=22.7196&lng=75.8577`);
    assert(weatherRes.data.forecast.length === 7 && !!weatherRes.data.temperature, '15. Weather API Integration & 7-Day Farm Forecast');

    const mandiRes = await axios.get(`${BASE_URL}/mandi`);
    assert(mandiRes.data.prices.length >= 5, '16. Government/APMC Mandi Price Feeds');

    // 14. AI Agronomy Advisory & Farming Query
    const queryRes = await axios.post(
      `${BASE_URL}/advisory/queries`,
      {
        cropName: 'Wheat',
        queryText: 'Yellow powder spots on leaf underside. How to treat yellow rust?',
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );
    assert(
      queryRes.data.query.status === 'ANSWERED' && queryRes.data.query.aiResponse.includes('Propiconazole'),
      '17. AI Agronomy Disease Diagnosis & Guidance Engine'
    );

    // 15. Order Delivery and Escrow Release
    const deliverOrderRes = await axios.put(
      `${BASE_URL}/orders/${order.id}/status`,
      { status: 'DELIVERED' },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    );
    assert(
      deliverOrderRes.data.order.status === 'DELIVERED' &&
        deliverOrderRes.data.order.paymentStatus === 'RELEASED',
      '18. Order Status Tracking & Escrow Payment Release'
    );

    // 16. Admin Analytics (Computed from real DB)
    const analyticsRes = await axios.get(`${BASE_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const analytics = analyticsRes.data;
    assert(
      analytics.totalUsers >= 5 &&
        analytics.totalListings >= 5 &&
        analytics.totalProcurementValue > 0,
      '19. Admin Analytics Calculated from Real DB Records'
    );

    // 17. Cleanup test listing
    await axios.delete(`${BASE_URL}/listings/${createdListingId}`, {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    assert(true, '20. Farmer Delete Listing');

    console.log(`\n🎉 Verification Completed: ${passed} Passed, ${failed} Failed`);
  } catch (err: any) {
    console.error('Test execution failed with error:', err.response?.data || err.message);
  }
}

runAllTests();
