import app from "./app.js";
import { config } from "dotenv";
import connDB from "./config/db.js";
import { v2 as cloudinary } from "cloudinary";

process.on("uncaughtException", (error) => {
  console.log("uncaughtException error : ", error.message);
  console.log("Shutting down the server due to uncaught exception");

  process.exit(1);
});

// ENV config
config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Database connection
connDB();

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port : ${process.env.PORT}`);
});

process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection error : ", error.message);
  console.log("Shutting down the server due to unhandled rejection");

  server.close(() => {
    process.exit(1);
  });
});
