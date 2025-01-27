const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const MONGOURL = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGOURL);
    console.log("Database is connected successfully");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
