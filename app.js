const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const {
  generateFieldObject,
  standardiseData,
  filterData,
} = require("./helpers");
const { log } = require("console");
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

app.get("/data/:id", (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataFilePath));

  // Reformat keys to standardised field names
  const standardisedData = standardiseData(data);

  const id = parseInt(req.params.id, 10);

  // Check if id is a valid number
  if (isNaN(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const filteredData = standardisedData.filter((row) => row.id === id);

    // Check if filtered data is empty
    if (filteredData.length === 0) {
      throw new Error("Data not found");
    }

    // Return the filtered data
    res.json(filteredData[0]);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

app.post("/data", (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataFilePath));

  //reformat keys to standardised field names
  const standardisedData = standardiseData(data);

  // Return the standardised data if 'where' clause is not provided or empty
  if (!req.body.where || Object.keys(req.body.where).length === 0) {
    return res.json(standardisedData);
  }

  const whereClause = req.body.where;

  try {
    const filteredData = filterData(standardisedData, whereClause);

    // Check if filtered data is empty
    if (filteredData.length === 0) {
      throw new Error("Data not found");
    }

    // Return the filtered data
    res.json(filteredData);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

app.get("/delete/data/:id", (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataFilePath));
  const standardisedData = standardiseData(data);

  const id = parseInt(req.params.id, 10);

  // Check if id is a valid number
  if (isNaN(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const filteredData = standardisedData.filter((row) => row.id !== id);

    // Check if data not found
    if (filteredData.length === standardisedData.length) {
      throw new Error("Data not found");
    }

    // Return the filtered data
    res.json(`Station with id:${id} deleted`);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
