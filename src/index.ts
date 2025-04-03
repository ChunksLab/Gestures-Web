import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import textureRoute from "./api/v1/texture/texture.route";
import secretChecker from "./middleware/secret";
import logger from "morgan";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.set("trust proxy", 1);
app.use(express.json());
app.use(logger("tiny"));
app.use(secretChecker);

app.use("/api/v1/texture", textureRoute);

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("could not connect to mongo!");
    console.log(err.message);
  });