const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./src/config/db.js");
const categoryRoute = require("./src/routes/categoryRoute.js");
const itemRoute = require("./src/routes/itemRoute.js");
const authRoute = require("./src/routes/authRoute.js");
const otpRoute = require("./src/routes/otpRoute.js");
const cartRoute = require("./src/routes/cartRoute.js");
const locationRoute = require("./src/routes/locationRoute.js");
const { toNodeHandler } = require("better-auth/node");
const cors = require("cors");
const dotenv = require("dotenv");
const { auth } = require("./src/utils/auth.js");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",

    credentials: true,
  })
);

const port = process.env.PORT || 3000;

connectDB();

// Allow all origins

app.all("/api/auth/*", toNodeHandler(auth));
app.use(bodyParser.json());
app.use("/api/categories", categoryRoute);
app.use("/api/items", itemRoute);
app.use("/api/locations", locationRoute);
app.use("/auth", authRoute);
app.use("/otp", otpRoute);
app.use("/api/cart", cartRoute);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
