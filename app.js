const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");

// Import helper functions
const {
  standardiseData,
  filterData,
  generateSchema,
} = require("./helpers");
const port = 3000;
const dataFilePath = "./data/dubBikes.json";

app.use(bodyParser.json());

// Default enpoint
app.get("/", (req, res) => {
  res.send("Noloco Full Stack  Engineering Exercise");
});

// extract schema from raw data
app.get("/schema", (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataFilePath));
  const schema = generateSchema(data, 100); // 100 is the upper limit for rows to check
  res.json(schema);
});

// Filter data by where clause
app.post("/data", (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataFilePath));
  // Could also use fetch as an alternative
  const schema = generateSchema(data, 100); // 100 is the upper limit for rows to check

  //reformat keys to standardised field names
  const standardisedData = standardiseData(data, schema);

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

// Get data by id
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

// Delete data by id
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
