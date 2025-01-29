const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./src/Config/db.js");
const passport = require("./src/Config/passportConfig.js");
const categoryRoute = require("./src/routes/categoryRoute.js");
const itemRoute = require("./src/routes/itemRoute.js");
const authRoute = require("./src/routes/authRoute.js");
const otpRoute = require("./src/routes/otpRoute.js");
const cartRoute = require("./src/routes/cartRoute.js");

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(passport.initialize());
app.use(bodyParser.json());
app.use("/api/categories", categoryRoute);
app.use("/api/items", itemRoute);
app.use("/auth", authRoute);
app.use("/otp", otpRoute);
app.use('/api/cart', cartRoute);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
