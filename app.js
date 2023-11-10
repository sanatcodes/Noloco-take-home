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

app.get("/schema", (req, res) => {
    const data = JSON.parse(fs.readFileSync(dataFilePath));
    schema = [];
    row = data[0];
    for (const [key, value] of Object.entries(row)) {
      schema.push(generateFieldObject(key, value));
    }
    res.json(schema);
  });

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
