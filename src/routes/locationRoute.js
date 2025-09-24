// server/routes/locationRoutes.js
const express = require("express");
const {
  getCountries,
  getAllZones,
  getZonesByCountry,
} = require("../controller/locationController");
// const { getCountries, getAllZones, getZonesByCountry } = require('../controller/countryCountroller');
const router = express.Router();

// Location routes
router.get("/countries", getCountries);
router.get("/zones", getAllZones);
router.get("/zones/:countryCode", getZonesByCountry);

module.exports = router;
