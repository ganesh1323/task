const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const catRouter = require("./routes/category");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://gana7777:Cz1cdLIMJoZZs3Dd@cluster0.3j7mi2z.mongodb.net/devTask?retryWrites=true&w=majority"
  )
  .then((con) => {
    console.log("connection success");
  })
  .catch((err) => {
    console.log("connection error", err);
  });
app.use("/testing", catRouter);
http.createServer(app).listen(3000);
