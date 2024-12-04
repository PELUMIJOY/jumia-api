import passport from "passport";
import { initializePassportStrategies } from "../services/passportStrategies.js";

initializePassportStrategies(passport);

export default passport;
