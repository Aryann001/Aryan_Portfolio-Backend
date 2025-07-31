import mongoose from "mongoose";

const connDB = async () => {
  try {
    const db = await mongoose.connect(process.env.DB_URI, {
      dbName: "aryan",
    });

    console.log(
      `DB is connected to host : ${db.connections[0].host} and port : ${db.connections[0].port}`
    );
  } catch (error) {
    console.log("MongoDB connection error : ", error.message);
    process.exit(1);
  }
};

export default connDB;
