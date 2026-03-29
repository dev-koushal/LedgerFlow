require("dotenv").config();
const connectToDB = require("./src/config/db");
const app = require("./src/app");

app.listen(3000, () => {
  connectToDB();
  try {
    console.log("Server started on 3000");
  } catch (error) {
    console.log(error);
  }
});
