const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const catRouter = require("./routes/category");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://doadmin:GZi508eo216U79pR@db-mongodb-blr1-93357-acb8f016.mongo.ondigitalocean.com/testing?tls=true&authSource=admin&replicaSet=db-mongodb-blr1-93357"
  )
  .then((con) => {
    console.log("connection success");
  })
  .catch((err) => {
    console.log("connection error", err);
  });
app.use("/testing", catRouter);
http.createServer(app).listen(3000);
