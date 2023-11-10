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

app.post("/data", (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataFilePath));

  //reformat keys to standardised field names
  const standardisedData = data.map((row) => {
    const newRow = {};
    for (const [key, value] of Object.entries(row)) {
      newRow[cleanedName(key)] = value;
    }
    return newRow;
  });

  // Return the standardised data if 'where' clause is not provided or empty
  if (!req.body.where || Object.keys(req.body.where).length === 0) {
    return res.json(standardisedData);
  }

  const whereClause = req.body.where;
  let filteredData = standardisedData;

  //   Apply filtering based on the search params in the request body
  for (const [fieldName, conditions] of Object.entries(whereClause)) {
    for (const [operator, value] of Object.entries(conditions)) {
      if (
        (operator === "lt" || operator === "gt") &&
        typeof value !== "number"
      ) {
        return res.status(404).send("Data not found");
      }

      // Apply filter based on the operator
      switch (operator) {
        case "eq":
          filteredData = filteredData.filter(
            (item) => item[fieldName] === value
          );
          break;
        case "lt":
          filteredData = filteredData.filter((item) => item[fieldName] < value);
          break;
        case "gt":
          filteredData = filteredData.filter((item) => item[fieldName] > value);
          break;
        default:
          return res.status(400).send(`Invalid operator: ${operator}`);
      }
    }
  }

  // Check if filtered data is empty
  if (filteredData.length === 0) {
    return res.status(404).send("Data not found");
  }

  // Return the filtered data
  res.json(filteredData);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
