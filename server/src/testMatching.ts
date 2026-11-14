import { runProcurementMatching } from './services/procurementMatcher';

async function test() {
  console.log('Testing Intelligent Procurement Matching Algorithm for 1,000 kg Wheat...');

  const result = await runProcurementMatching({
    cropName: 'Wheat',
    requiredQuantity: 1000,
    qualityGrade: 'GRADE_A',
    minPrice: 20,
    maxPrice: 30,
    maxDistanceKm: 70,
    deliveryDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    buyerLat: 22.7196,
    buyerLng: 75.8577,
    strategy: 'BALANCED',
  });

  console.log('Result:');
  console.log(`- Total Required: ${result.totalRequiredQty} kg`);
  console.log(`- Total Matched: ${result.totalMatchedQty} kg (${result.fulfillmentPercentage}%)`);
  console.log(`- Remaining Shortage: ${result.remainingShortage} kg`);
  console.log(`- Farmers Combined: ${result.farmerCount}`);
  console.log(`- Weighted Avg Price: ₹${result.weightedAvgPrice}/kg`);
  console.log(`- Total Estimated Cost: ₹${result.totalEstimatedCost}`);
  console.log(`- Avg Distance: ${result.averageDistanceKm} km`);
  console.log(`- Estimated Delivery: within ${result.estimatedDeliveryTimelineDays} days`);
  console.log('\nSelected Farmers Breakdown:');
  result.items.forEach((item, idx) => {
    console.log(`  ${idx + 1}. ${item.farmerName} (${item.farmLocation}): ${item.allocatedQty} kg @ ₹${item.pricePerKg}/kg (Dist: ${item.distanceKm} km) - Total: ₹${item.itemTotalCost}`);
    console.log(`     Reason: ${item.reasonSelected}`);
  });
  console.log('\nExplanation Summary:\n', result.explanationSummary);
}

test().catch(console.error);
