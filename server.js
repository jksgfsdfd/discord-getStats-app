const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const serverRouter = require("./routes/serverRouter");

require("express-async-errors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/server", serverRouter);

app.use(errorHandler);

async function start() {
  try {
    app.listen(PORT, function () {
      console.log(`server started at port ${PORT}`);
    });
  } catch (error) {
    console.log("failed to start application");
    console.error(error);
  }
}

start();
