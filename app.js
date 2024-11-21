import bodyParser from "body-parser";
import express from "express";
import connectDB from "./src/Config/db.js";
import categoryRoute from "./src/routes/categoryRoute.js";
import itemRoute from "./src/routes/itemRoute.js";

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(bodyParser.json());
app.use("/api/categories", categoryRoute);
app.use("/api/items", itemRoute);

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
