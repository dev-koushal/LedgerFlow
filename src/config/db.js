const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected!!");
  } catch (error) {
    console.log("Error in Connecting to DB!", error);
  }
};

module.exports = connectToDB;
