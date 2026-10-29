import mongoose from "mongoose";

export default async function connectDatabase() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/job-portal";
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
