import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGOURL = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGOURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database is connected succesfully");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
