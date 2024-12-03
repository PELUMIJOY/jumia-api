import express from "express";
import bodyParser from "body-parser";
import connectDB from "./src/Config/db.js";
import passport from "./src/Config/passportConfig.js";
import categoryRoute from "./src/routes/categoryRoute.js";
import itemRoute from "./src/routes/itemRoute.js";
import authRoute from "./src/routes/authRoute.js";
import otpRoute from "./src/routes/otpRoute.js";

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(passport.initialize());
app.use(bodyParser.json());
app.use("/api/categories", categoryRoute);
app.use("/api/items", itemRoute);
app.use("/auth", authRoute);
app.use("/otp", otpRoute);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
