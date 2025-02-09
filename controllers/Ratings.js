const calculateConnectivity = (connectivity) => {
  let score = 0;

  if (connectivity.metro <= 1) score += 5;
  else if (connectivity.metro <= 5) score += 4;
  else if (connectivity.metro <= 10) score += 3;
  else score += 2;

  if (connectivity.airport <= 1) score += 5;
  else if (connectivity.airport <= 5) score += 4;
  else if (connectivity.airport <= 10) score += 3;
  else score += 2;

  if (connectivity.busStation <= 1) score += 5;
  else if (connectivity.busStation <= 5) score += 4;
  else if (connectivity.busStation <= 10) score += 3;
  else score += 2;

  if (connectivity.railwayStation <= 1) score += 5;
  else if (connectivity.railwayStation <= 5) score += 4;
  else if (connectivity.railwayStation <= 10) score += 3;
  else score += 2;

  return Math.min(5, score / 4); // Normalize the score between 1-5
};

// Calculate Livability Rating based on amenities
const calculateLivability = (amenities) => {
  const essentialAmenities = [
    'Swimming Pool', 'Gym', 'Parking', 'Wi-Fi', 'Intercom', 'Laundry', 'Security', 'Fire Extinguisher', 'Balcony'
  ];
  
  let score = 0;

  // Add score for each essential amenity present
  essentialAmenities.forEach((amenity) => {
    if (amenities.includes(amenity)) score += 1;
  });

  // Calculate rating based on the number of essential amenities present
  if (score >= 8) return 5;
  if (score >= 6) return 4;
  if (score >= 4) return 3;
  if (score >= 2) return 2;
  return 1;
};

// Calculate Safety Rating based on safety-related amenities
const calculateSafety = (amenities) => {
  const safetyFeatures = [
    'CCTV', '24/7 Security', 'Fire Extinguisher', 'Smoke Detectors', 'Gated Community', 'Security Guards'
  ];

  let score = 0;

  safetyFeatures.forEach((feature) => {
    if (amenities.includes(feature)) score += 1;
  });

  if (score >= 5) return 5;
  if (score >= 4) return 4;
  if (score >= 3) return 3;
  if (score >= 2) return 2;
  return 1;
};

module.exports={calculateConnectivity,calculateLivability,calculateSafety};