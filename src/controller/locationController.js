// server/controllers/locationController.js
const asyncHandler = require('express-async-handler');

// Sample data - you can replace with database queries in production
const countries = [
  { code: "NG", name: "Nigeria" },
  { code: "EG", name: "Egypt" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "MA", name: "Morocco" },
  { code: "TN", name: "Tunisia" },
  { code: "UG", name: "Uganda" },
  { code: "SN", name: "Senegal" },
  { code: "ZA", name: "South Africa" },
  { code: "DZ", name: "Algeria" },
  { code: "CM", name: "Cameroon" }
];

// These zones are mapped to popular business/shopping areas in Jumia's operating countries
const zones = [
  // Nigeria
  { id: "NG-LAG", name: "Lagos", country: "NG" },
  { id: "NG-ABJ", name: "Abuja", country: "NG" },
  { id: "NG-PHC", name: "Port Harcourt", country: "NG" },
  { id: "NG-KAN", name: "Kano", country: "NG" },
  { id: "NG-IBD", name: "Ibadan", country: "NG" },
  
  // Egypt
  { id: "EG-CAI", name: "Cairo", country: "EG" },
  { id: "EG-ALE", name: "Alexandria", country: "EG" },
  { id: "EG-GIZ", name: "Giza", country: "EG" },
  
  // Kenya
  { id: "KE-NBO", name: "Nairobi", country: "KE" },
  { id: "KE-MSA", name: "Mombasa", country: "KE" },
  { id: "KE-KSM", name: "Kisumu", country: "KE" },
  
  // Ghana
  { id: "GH-ACC", name: "Accra", country: "GH" },
  { id: "GH-KUM", name: "Kumasi", country: "GH" },
  { id: "GH-TAM", name: "Tamale", country: "GH" },
  
  // Côte d'Ivoire
  { id: "CI-ABJ", name: "Abidjan", country: "CI" },
  { id: "CI-YAM", name: "Yamoussoukro", country: "CI" },
  
  // Morocco
  { id: "MA-CAS", name: "Casablanca", country: "MA" },
  { id: "MA-RAB", name: "Rabat", country: "MA" },
  { id: "MA-FEZ", name: "Fez", country: "MA" },
  
  // South Africa
  { id: "ZA-JHB", name: "Johannesburg", country: "ZA" },
  { id: "ZA-CPT", name: "Cape Town", country: "ZA" },
  { id: "ZA-DUR", name: "Durban", country: "ZA" },
  { id: "ZA-PRE", name: "Pretoria", country: "ZA" }
];

/**
 * @desc    Get all countries
 * @route   GET /api/locations/countries
 * @access  Public
 */
const getCountries = asyncHandler(async (req, res) => {
  res.status(200).json(countries);
});

/**
 * @desc    Get zones by country
 * @route   GET /api/locations/zones/:countryCode
 * @access  Public
 */
const getZonesByCountry = asyncHandler(async (req, res) => {
  const { countryCode } = req.params;
  
  // If country code is provided, filter zones by country
  if (countryCode) {
    const filteredZones = zones.filter(zone => zone.country === countryCode);
    return res.status(200).json(filteredZones);
  }
  
  // Otherwise return all zones
  res.status(200).json(zones);
});

/**
 * @desc    Get all zones
 * @route   GET /api/locations/zones
 * @access  Public
 */
const getAllZones = asyncHandler(async (req, res) => {
  res.status(200).json(zones);
});

module.exports = {
  getCountries,
  getZonesByCountry,
  getAllZones
};