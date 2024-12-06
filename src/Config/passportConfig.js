const passport = require("passport");
const { initializePassportStrategies } = require("../services/passportStrategies.js");

initializePassportStrategies(passport);

module.exports = passport;
