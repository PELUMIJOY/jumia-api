const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./src/config/db.js");
const passport = require("./src/config/passportConfig.js");
const categoryRoute = require("./src/routes/categoryRoute.js");
const itemRoute = require("./src/routes/itemRoute.js");
const authRoute = require("./src/routes/authRoute.js");
const otpRoute = require("./src/routes/otpRoute.js");
const cartRoute = require("./src/routes/cartRoute.js");
const locationRoute = require("./src/routes/locationRoute.js");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

connectDB();
// Allow all origins
app.use(cors());

// Allow specific origins
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});
app.use(passport.initialize());
app.use(bodyParser.json());
app.use("/api/categories", categoryRoute);
app.use("/api/items", itemRoute);
app.use("/api/locations", locationRoute);
app.use("/auth", authRoute);
app.use("/otp", otpRoute);
app.use('/api/cart', cartRoute);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
