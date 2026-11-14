import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive KhetSetu database seed...');

  // Clean old data in safe sequence
  await prisma.dispute.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.procurementPlanItem.deleteMany();
  await prisma.procurementPlan.deleteMany();
  await prisma.buyerRequirement.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.cropImage.deleteMany();
  await prisma.cropListing.deleteMany();
  await prisma.farmLocation.deleteMany();
  await prisma.farmingQuery.deleteMany();
  await prisma.agriculturalAdvisory.deleteMany();
  await prisma.marketPrice.deleteMany();
  await prisma.weatherRecord.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.cropCategory.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Farmer@123', 10);
  const buyerPasswordHash = await bcrypt.hash('Buyer@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  // 1. Categories
  const catGrains = await prisma.cropCategory.create({
    data: {
      name: 'Grains & Cereals',
      slug: 'grains-cereals',
      description: 'Staple grain crops including Wheat, Basmati Rice, Maize, Pearl Millet',
      icon: 'Wheat',
    },
  });

  const catOilseeds = await prisma.cropCategory.create({
    data: {
      name: 'Oilseeds',
      slug: 'oilseeds',
      description: 'High-oil content crops including Soybean, Mustard, Groundnut, Sunflower',
      icon: 'Droplet',
    },
  });

  const catPulses = await prisma.cropCategory.create({
    data: {
      name: 'Pulses & Legumes',
      slug: 'pulses',
      description: 'Protein rich pulses including Desi Chana, Tur/Arhar, Moong, Urad',
      icon: 'Sprout',
    },
  });

  const catVegetables = await prisma.cropCategory.create({
    data: {
      name: 'Fresh Vegetables',
      slug: 'vegetables',
      description: 'Direct farm fresh vegetables including Red Onion, Tomato, Potato, Garlic',
      icon: 'Carrot',
    },
  });

  const catCashCrops = await prisma.cropCategory.create({
    data: {
      name: 'Commercial & Cash Crops',
      slug: 'cash-crops',
      description: 'Industrial and commercial farm commodities including Cotton, Sugarcane',
      icon: 'Layers',
    },
  });

  // 2. Administrator
  const admin = await prisma.user.create({
    data: {
      name: 'KhetSetu System Administrator',
      email: 'admin@khetsetu.com',
      phone: '9893000001',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isVerified: true,
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    },
  });

  // 3. Primary Buyer Demo Account
  const buyerUser = await prisma.user.create({
    data: {
      name: 'Vikas Agrawal',
      email: 'buyer@khetsetu.com',
      phone: '9893111222',
      passwordHash: buyerPasswordHash,
      role: 'BUYER',
      isVerified: true,
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  });

  await prisma.buyerProfile.create({
    data: {
      userId: buyerUser.id,
      companyName: 'Malwa Agro Food Processing & Mills Ltd',
      businessType: 'WHOLESALER',
      gstin: '23AABCM8921K1ZN',
      city: 'Indore',
      district: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '452010',
      tradeLicense: 'MP-MANDI-AGR-4091',
      verifiedBadge: true,
    },
  });

  // 4. Primary Farmer Demo Account
  const primaryFarmer = await prisma.user.create({
    data: {
      name: 'Rameshwar Patel',
      email: 'farmer@khetsetu.com',
      phone: '9893222333',
      passwordHash,
      role: 'FARMER',
      isVerified: true,
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
    },
  });

  const pfProfile = await prisma.farmerProfile.create({
    data: {
      userId: primaryFarmer.id,
      village: 'Sanwer',
      district: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '453551',
      farmAreaAcres: 12.5,
      experienceYears: 18,
      soilType: 'Deep Black Cotton Soil',
      primaryCrops: 'Sharbati Wheat, Soybean JS-9560, Chickpea',
      kisanCreditCardNo: 'KCC-IND-9021-44',
      verifiedBadge: true,
    },
  });

  const pfLocation = await prisma.farmLocation.create({
    data: {
      farmerId: pfProfile.id,
      label: 'Sanwer Farm Estate',
      latitude: 22.9772,
      longitude: 75.8286,
      address: 'Survey No 142, Kshipra Road, Sanwer',
      village: 'Sanwer',
      district: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '453551',
    },
  });

  // 5. Additional Realistic Farmers for Multi-Farmer Procurement Matching
  const farmersData = [
    {
      name: 'Suresh Mandloi',
      email: 'suresh.mandloi@khetsetu.com',
      phone: '9893333001',
      village: 'Mangliya',
      district: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '453771',
      lat: 22.8122,
      lng: 75.9082,
      acres: 8.0,
      verified: true,
      crop: 'Wheat',
      variety: 'Sharbati Supreme',
      category: catGrains.id,
      qty: 400,
      price: 26,
      grade: 'GRADE_A',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      desc: 'Export quality golden Sharbati wheat, hand-harvested, zero moisture damage, 100% sortex cleaned.',
    },
    {
      name: 'Digvijay Singh Rathore',
      email: 'digvijay.rathore@khetsetu.com',
      phone: '9893333002',
      village: 'Depalpur',
      district: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '453115',
      lat: 22.8532,
      lng: 75.5471,
      acres: 15.0,
      verified: true,
      crop: 'Wheat',
      variety: 'Malavraj HD-2967',
      category: catGrains.id,
      qty: 350,
      price: 27,
      grade: 'GRADE_A',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      desc: 'Prime grain wheat grown under drip irrigation. High protein 12.8%, low husk percentage.',
    },
    {
      name: 'Bhawani Prasad Verma',
      email: 'bhawani.verma@khetsetu.com',
      phone: '9893333003',
      village: 'Hatod',
      district: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '453111',
      lat: 22.7935,
      lng: 75.7275,
      acres: 6.5,
      verified: true,
      crop: 'Wheat',
      variety: 'Lokwan Premium',
      category: catGrains.id,
      qty: 250,
      price: 25,
      grade: 'GRADE_A',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      desc: 'Lokwan Grade-A wheat directly from farm thrashers. Bold grain with bright luster.',
    },
    {
      name: 'Kamlesh Solanki',
      email: 'kamlesh.solanki@khetsetu.com',
      phone: '9893333004',
      village: 'Ujjain Road / Panthpiplai',
      district: 'Ujjain',
      state: 'Madhya Pradesh',
      pincode: '456006',
      lat: 23.1765,
      lng: 75.7885,
      acres: 22.0,
      verified: true,
      crop: 'Wheat',
      variety: 'Sharbati Traditional',
      category: catGrains.id,
      qty: 500,
      price: 28,
      grade: 'GRADE_A',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      desc: 'Pure Sharbati Wheat from certified organic farm plot. Ideal for premium stone-ground chakki flour.',
    },
    {
      name: 'Mukesh Patidar',
      email: 'mukesh.patidar@khetsetu.com',
      phone: '9893333005',
      village: 'Betma',
      district: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '453001',
      lat: 22.6833,
      lng: 75.6167,
      acres: 10.0,
      verified: true,
      crop: 'Soybean',
      variety: 'JS-9560 Certified',
      category: catOilseeds.id,
      qty: 1200,
      price: 44,
      grade: 'GRADE_A',
      image: 'https://images.unsplash.com/photo-1599818816834-8c83a54d5d36?auto=format&fit=crop&w=800&q=80',
      desc: 'High oil content yellow soybean, moisture under 9.5%, certified germination tested seed grade.',
    },
    {
      name: 'Gokul Dhakad',
      email: 'gokul.dhakad@khetsetu.com',
      phone: '9893333006',
      village: 'Tarana',
      district: 'Ujjain',
      state: 'Madhya Pradesh',
      pincode: '456665',
      lat: 23.2333,
      lng: 76.0333,
      acres: 18.0,
      verified: true,
      crop: 'Soybean',
      variety: 'NRC-37',
      category: catOilseeds.id,
      qty: 1800,
      price: 43,
      grade: 'GRADE_A',
      image: 'https://images.unsplash.com/photo-1599818816834-8c83a54d5d36?auto=format&fit=crop&w=800&q=80',
      desc: 'Bulk lot of yellow soybean. Zero foreign matter, mechanically winnowed and bagged in 50kg jute bags.',
    },
    {
      name: 'Radheshyam Sharma',
      email: 'radheshyam.sharma@khetsetu.com',
      phone: '9893333007',
      village: 'Kshipra',
      district: 'Dewas',
      state: 'Madhya Pradesh',
      pincode: '455001',
      lat: 22.9676,
      lng: 76.0534,
      acres: 14.0,
      verified: true,
      crop: 'Rice',
      variety: 'Pusa 1121 Traditional',
      category: catGrains.id,
      qty: 900,
      price: 64,
      grade: 'GRADE_A',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      desc: 'Long slender aromatic Pusa 1121 Paddy, kernel length 8.2mm+, dried to 12% moisture.',
    },
    {
      name: 'Arjun Choudhary',
      email: 'arjun.choudhary@khetsetu.com',
      phone: '9893333008',
      village: 'Pithampur Agrarian Zone',
      district: 'Dhar',
      state: 'Madhya Pradesh',
      pincode: '454775',
      lat: 22.6145,
      lng: 75.6821,
      acres: 7.0,
      verified: true,
      crop: 'Onion',
      variety: 'Nashik Red Hybrid',
      category: catVegetables.id,
      qty: 2200,
      price: 24,
      grade: 'GRADE_A',
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
      desc: 'Firm, uniform size 50mm+ red onions. Naturally cured skins, perfect for long-distance transport.',
    },
    {
      name: 'Narendra Sisodia',
      email: 'narendra.sisodia@khetsetu.com',
      phone: '9893333009',
      village: 'Rau Agro Cluster',
      district: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '453331',
      lat: 22.6288,
      lng: 75.8078,
      acres: 5.5,
      verified: true,
      crop: 'Tomato',
      variety: 'Abhinav Seminis Hybrid',
      category: catVegetables.id,
      qty: 1500,
      price: 18,
      grade: 'GRADE_A',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      desc: 'Thick-walled processing and table variety red tomatoes. Firm texture suitable for refrigerated logistics.',
    },
    {
      name: 'Jitendra Yadav',
      email: 'jitendra.yadav@khetsetu.com',
      phone: '9893333010',
      village: 'Mhow Rural',
      district: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '453441',
      lat: 22.5539,
      lng: 75.7648,
      acres: 11.0,
      verified: false,
      crop: 'Cotton',
      variety: 'Bt Cotton Shankar-6',
      category: catCashCrops.id,
      qty: 800,
      price: 74,
      grade: 'GRADE_B',
      image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80',
      desc: 'Long staple Shankar-6 raw seed cotton. Staple length 29mm, minimal trash percentage.',
    },
  ];

  // Seed Primary Farmer's own listings first
  const primaryListing1 = await prisma.cropListing.create({
    data: {
      farmerId: primaryFarmer.id,
      categoryId: catGrains.id,
      cropName: 'Wheat',
      variety: 'C-306 Sharbati Golden',
      description: 'Authentic MP Sharbati wheat, rainfed and sun-cured. Highest chapati softness and natural sweetness.',
      quantity: 300,
      unit: 'kg',
      pricePerKg: 28,
      qualityGrade: 'GRADE_A',
      harvestDate: new Date('2026-10-25'),
      availableUntil: new Date('2026-12-30'),
      farmLocationId: pfLocation.id,
      deliveryRadiusKm: 60,
      status: 'ACTIVE',
      viewsCount: 38,
    },
  });

  await prisma.cropImage.create({
    data: {
      listingId: primaryListing1.id,
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      isPrimary: true,
    },
  });

  const primaryListing2 = await prisma.cropListing.create({
    data: {
      farmerId: primaryFarmer.id,
      categoryId: catPulses.id,
      cropName: 'Desi Chana (Chickpea)',
      variety: 'JG-11 Bold',
      description: 'Bold yellow gram, machine graded, zero pesticide residue on pod maturity.',
      quantity: 650,
      unit: 'kg',
      pricePerKg: 58,
      qualityGrade: 'GRADE_A',
      harvestDate: new Date('2026-10-18'),
      availableUntil: new Date('2026-12-15'),
      farmLocationId: pfLocation.id,
      deliveryRadiusKm: 50,
      status: 'ACTIVE',
      viewsCount: 22,
    },
  });

  await prisma.cropImage.create({
    data: {
      listingId: primaryListing2.id,
      imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80',
      isPrimary: true,
    },
  });

  // Seed additional farmers and their listings
  for (const f of farmersData) {
    const user = await prisma.user.create({
      data: {
        name: f.name,
        email: f.email,
        phone: f.phone,
        passwordHash,
        role: 'FARMER',
        isVerified: f.verified,
        status: 'ACTIVE',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(f.name)}`,
      },
    });

    const profile = await prisma.farmerProfile.create({
      data: {
        userId: user.id,
        village: f.village,
        district: f.district,
        state: f.state,
        pincode: f.pincode,
        farmAreaAcres: f.acres,
        experienceYears: Math.floor(6 + Math.random() * 15),
        soilType: 'Deep Black Cotton Soil',
        primaryCrops: f.crop,
        verifiedBadge: f.verified,
      },
    });

    const location = await prisma.farmLocation.create({
      data: {
        farmerId: profile.id,
        label: `${f.village} Farm`,
        latitude: f.lat,
        longitude: f.lng,
        address: `${f.village}, Tehsil, ${f.district}`,
        village: f.village,
        district: f.district,
        state: f.state,
        pincode: f.pincode,
      },
    });

    const listing = await prisma.cropListing.create({
      data: {
        farmerId: user.id,
        categoryId: f.category,
        cropName: f.crop,
        variety: f.variety,
        description: f.desc,
        quantity: f.qty,
        unit: 'kg',
        pricePerKg: f.price,
        qualityGrade: f.grade,
        harvestDate: new Date('2026-10-20'),
        availableUntil: new Date('2026-12-25'),
        farmLocationId: location.id,
        deliveryRadiusKm: 80,
        status: 'ACTIVE',
        viewsCount: Math.floor(10 + Math.random() * 40),
      },
    });

    await prisma.cropImage.create({
      data: {
        listingId: listing.id,
        imageUrl: f.image,
        isPrimary: true,
      },
    });
  }

  // 6. Pre-seeded Live Mandi Prices (Agmarknet data for Central/Western India)
  const mandiRates = [
    { commodity: 'Wheat', state: 'Madhya Pradesh', district: 'Indore', marketName: 'Indore APMC Mandi (Chhawani)', minPrice: 2450, maxPrice: 3100, modalPrice: 2750 },
    { commodity: 'Wheat', state: 'Madhya Pradesh', district: 'Ujjain', marketName: 'Ujjain Krishi Upaj Mandi', minPrice: 2400, maxPrice: 2950, modalPrice: 2680 },
    { commodity: 'Wheat', state: 'Madhya Pradesh', district: 'Dewas', marketName: 'Dewas Sub-Mandi', minPrice: 2380, maxPrice: 2850, modalPrice: 2620 },
    { commodity: 'Soybean', state: 'Madhya Pradesh', district: 'Indore', marketName: 'Indore APMC Mandi', minPrice: 4100, maxPrice: 4750, modalPrice: 4420 },
    { commodity: 'Soybean', state: 'Madhya Pradesh', district: 'Ujjain', marketName: 'Ujjain Krishi Upaj Mandi', minPrice: 4050, maxPrice: 4680, modalPrice: 4380 },
    { commodity: 'Soybean', state: 'Madhya Pradesh', district: 'Dhar', marketName: 'Dhar Grain Yard', minPrice: 4000, maxPrice: 4600, modalPrice: 4310 },
    { commodity: 'Gram (Chana)', state: 'Madhya Pradesh', district: 'Indore', marketName: 'Indore Pulse Mandi', minPrice: 5400, maxPrice: 6200, modalPrice: 5850 },
    { commodity: 'Gram (Chana)', state: 'Madhya Pradesh', district: 'Neemuch', marketName: 'Neemuch Mandi', minPrice: 5350, maxPrice: 6100, modalPrice: 5790 },
    { commodity: 'Onion', state: 'Madhya Pradesh', district: 'Indore', marketName: 'Indore F&V Yard (Choithram)', minPrice: 1800, maxPrice: 2700, modalPrice: 2250 },
    { commodity: 'Onion', state: 'Maharashtra', district: 'Nashik', marketName: 'Lasalgaon APMC', minPrice: 1900, maxPrice: 2850, modalPrice: 2400 },
    { commodity: 'Tomato', state: 'Madhya Pradesh', district: 'Indore', marketName: 'Indore F&V Yard (Choithram)', minPrice: 1200, maxPrice: 2100, modalPrice: 1650 },
    { commodity: 'Cotton', state: 'Madhya Pradesh', district: 'Khargone', marketName: 'Khargone Cotton Market', minPrice: 6800, maxPrice: 7700, modalPrice: 7280 },
    { commodity: 'Paddy (Basmati)', state: 'Madhya Pradesh', district: 'Raisen', marketName: 'Raisen Mandi', minPrice: 3800, maxPrice: 4600, modalPrice: 4250 },
    { commodity: 'Mustard', state: 'Rajasthan', district: 'Kota', marketName: 'Kota Bhamashah Mandi', minPrice: 5100, maxPrice: 5800, modalPrice: 5480 },
  ];

  for (const m of mandiRates) {
    await prisma.marketPrice.create({
      data: {
        commodity: m.commodity,
        state: m.state,
        district: m.district,
        marketName: m.marketName,
        minPrice: m.minPrice,
        maxPrice: m.maxPrice,
        modalPrice: m.modalPrice,
        priceDate: new Date(),
        source: 'Directorate of Marketing & Inspection (Agmarknet Live Sync)',
        isVerifiedGov: true,
      },
    });
  }

  // 7. Agricultural Advisory Knowledge Items
  const advisories = [
    {
      title: 'Management of Yellow Rust & Powdery Mildew in Rabi Wheat',
      category: 'DISEASE_CONTROL',
      cropName: 'Wheat',
      description: 'Yellow rust (Puccinia striiformis) appears as bright yellow pustules arranged in linear stripes along wheat leaves during cool, humid spells.',
      symptoms: 'Yellow stripes along leaf veins, chlorosis, reduced photosynthetic leaf area, grain shrivelling.',
      solution: 'At initial onset, apply foliar spray of Propiconazole 25% EC @ 1.0 ml/litre or Tebuconazole 25.9% EC @ 1.0 ml/litre of water using a hollow cone nozzle.',
      preventiveMeasures: 'Sow resistant varieties like GW-322 or HI-1544. Avoid late sowing and over-irrigation in January/February.',
      seasonalTiming: 'Rabi Mid-Season (Dec - Feb)',
      severity: 'HIGH',
    },
    {
      title: 'Integrated Pest Management (IPM) for Pod Borer in Chickpea & Soybean',
      category: 'PEST_MANAGEMENT',
      cropName: 'Chickpea / Soybean',
      description: 'Helicoverpa armigera caterpillars feed on tender leaves, flowers and bore into developing pods, causing severe yield reduction.',
      symptoms: 'Circular holes bored into pods, defoliation, droppings beneath the canopy.',
      solution: 'Install 5 Pheromone traps/acre for adult monitoring. If larval count exceeds economic threshold (1 larva/meter row), spray Emamectin Benzoate 5% SG @ 0.5g/L or Chlorantraniliprole 18.5% SC @ 0.3ml/L.',
      preventiveMeasures: 'Intercrop chickpea with coriander or mustard to encourage natural parasites. Use bird perches (15-20 per acre).',
      seasonalTiming: 'Vegetative to Pod Formation',
      severity: 'HIGH',
    },
    {
      title: 'Split Fertilizer Schedule & Irrigation for High-Yield Sharbati Wheat',
      category: 'CROP_RECOMMENDATION',
      cropName: 'Wheat',
      description: 'Optimizing nitrogen and micronutrient application to maximize grain test weight, protein content, and gluten index for premium market value.',
      symptoms: 'Pale green foliage, stunting, lower tillering count.',
      solution: 'Apply 120 kg N : 60 kg P2O5 : 40 kg K2O per hectare. Split N into 50% basal at sowing, 25% at Crown Root Initiation (21 DAS), and 25% at late tillering.',
      preventiveMeasures: 'Incorporate 25 kg Zinc Sulphate per hectare once every 2 years to counter widespread zinc deficiency in black soils.',
      seasonalTiming: 'Crown Root Initiation to Flag Leaf',
      severity: 'MODERATE',
    },
    {
      title: 'Curing and Storage Guidelines to Prevent Onion Sprouting & Rot',
      category: 'SEASONAL_GUIDANCE',
      cropName: 'Onion',
      description: 'Post-harvest losses in Rabi onions can reach 30% without adequate field curing, sorting, and well-ventilated storage.',
      symptoms: 'Bulb soft rot, neck rot, premature sprouting in storage.',
      solution: 'Field cure onions for 3-5 days under partial foliage shade until the neck dries thin. Store in raised bottom, mesh-ventilated Chawl storage.',
      preventiveMeasures: 'Spray Maleic Hydrazide (MH) @ 2500 ppm 15 days before harvest when 50% tops have collapsed to inhibit storage sprouting.',
      seasonalTiming: 'Post-Harvest / Summer Storage',
      severity: 'MODERATE',
    },
  ];

  for (const adv of advisories) {
    await prisma.agriculturalAdvisory.create({ data: adv });
  }

  // 8. Sample Pre-created Buyer Requirement & Intelligent Procurement Match
  const sampleReq = await prisma.buyerRequirement.create({
    data: {
      buyerId: buyerUser.id,
      cropName: 'Wheat',
      requiredQuantity: 1000,
      unit: 'kg',
      qualityGrade: 'GRADE_A',
      minPrice: 20,
      maxPrice: 30,
      maxDistanceKm: 60,
      deliveryDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      preferredLocation: 'Indore Central Agro-Hub',
      deliveryAddress: 'Plot 42, Mandi Warehouse Zone, Sanwer Road, Indore 452015',
      latitude: 22.7196,
      longitude: 75.8577,
      notes: 'Need 1,000 kg Grade A Sharbati / Lokwan wheat for industrial stone-grinding. Delivery within 5 days.',
      status: 'OPEN',
    },
  });

  // 9. Sample Bid on Primary Farmer's Wheat Listing
  await prisma.bid.create({
    data: {
      listingId: primaryListing1.id,
      buyerId: buyerUser.id,
      offeredPrice: 27,
      quantity: 200,
      message: 'Greetings Rameshwar-ji. We need 200 kg sample lot of your Sharbati wheat for lab analysis before placing a 2,000 kg seasonal contract.',
      status: 'PENDING',
    },
  });

  // 10. Sample Verified KYC Request
  await prisma.verificationRequest.create({
    data: {
      userId: primaryFarmer.id,
      role: 'FARMER',
      documentType: 'KISAN_CREDIT_CARD',
      documentNumber: 'KCC-MP-IND-88219',
      status: 'APPROVED',
      adminNotes: 'Verified against State Revenue & Land Record Portal (MP Bhulekh)',
      reviewedAt: new Date(),
    },
  });

  // 11. Initial Notifications
  await prisma.notification.create({
    data: {
      userId: primaryFarmer.id,
      title: 'New Bid on Sharbati Wheat!',
      message: 'Vikas Agrawal (Malwa Agro Food Processing) offered ₹27/kg for 200 kg.',
      type: 'BID',
      link: '/farmer/bids',
    },
  });

  await prisma.notification.create({
    data: {
      userId: buyerUser.id,
      title: 'Marketplace Update',
      message: '10 new verified farmer listings added in Indore, Ujjain, and Dhar districts.',
      type: 'SYSTEM',
      link: '/buyer/marketplace',
    },
  });

  console.log('✅ KhetSetu database seeded successfully with realistic Indian agricultural ecosystem data!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
