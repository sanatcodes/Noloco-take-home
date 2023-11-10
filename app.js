const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const { generateFieldObject, cleanedName } = require("./helpers");
const port = 3000;
const dataFilePath = "./data/dubBikes.json";

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Noloco Full Stack  Engineering Exercise");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
