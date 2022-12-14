const mongoose = require("mongoose");
async function connectDB(mongoURI) {
  return new Promise(async (resolve, reject) => {
    try {
      const conn = await mongoose.connect(mongoURI);
      console.log(`Connected to databse ${conn.connection.host}`);
      resolve();
    } catch (err) {
      console.log("Couldn't connect to database");
      console.error(err);
      reject();
    }
  });
}

module.exports = connectDB;
