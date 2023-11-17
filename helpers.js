function toCamelCase(name) {
  return name
    .split(" ")
    .map((word, index) => {
      return index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

function cleanedName(columnName) {
  let cleanedName = columnName.replace(/[^a-zA-Z0-9 ]/g, "");
  let camelCaseName = toCamelCase(cleanedName);
  return camelCaseName;
}

function generateSchema(data, maxRows) {
  let schema = {};
  let rowCount = 0;

  for (const row of data) {
    if (rowCount >= maxRows) break; // Stop if upper limit is reached

    for (const [key, value] of Object.entries(row)) {
      if (!schema[key] || schema[key].type === "NULL") {
        schema[key] = generateFieldObject(key, value, data);
      }
    }

    rowCount++;
  }

  return Object.values(schema); // Convert the schema object to an array of field objects
}

function generateFieldObject(columnName, columnValue, data) {
  let camelCaseName = cleanedName(columnName);
  let potentialOptions = [];

  // Determine the data type
  function determineDataType(value) {
    if (value === null) return "NULL";
    if (typeof value === "boolean") return "BOOLEAN";
    if (typeof value === "number") return "INTEGER";
    if (typeof value === "string") {
      value = value.trim(); // Trim whitespace
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return "DATE";
      if (["true", "false", "yes", "no"].includes(value.toLowerCase()))
        return "BOOLEAN";

      const isInteger = /^[+-]?\d+$/.test(value);
      const isFloat = /^[+-]?\d+(\.\d+)?$/.test(value);

      if (isInteger) return "INTEGER";
      if (isFloat) return "FLOAT";

      const values = data.map((row) => row[columnName]);
      const unqiueValues = new Set(values);
      const optionsThresh = 20;

      if (unqiueValues.size <= optionsThresh) {
        potentialOptions = Array.from(unqiueValues);
        return "OPTIONS";
      }
    }

    return "TEXT";
  }

  let dataType = determineDataType(columnValue);

  // Generate the field object
  return {
    display: columnName,
    name: camelCaseName,
    type: dataType,
    options: potentialOptions.length > 0 ? potentialOptions : [],
  };
}

// Function to standardize data
function standardiseData(data, schema) {
  return data.map((row) => {
    const newRow = {};
    for (const [key, value] of Object.entries(row)) {
      const standardisedKey = cleanedName(key);
      newRow[standardisedKey] = formatValue(value, standardisedKey, schema);
    }
    return newRow;
  });
}

function formatValue(value, key, schema) {
  const fieldSchema = schema.find((f) => f.name === key);

  if (!fieldSchema) return value;

  switch (fieldSchema.type) {
    case "BOOLEAN":
      return parseBoolean(value);
    case "FLOAT":
      return parseFloat(value);
    case "INTEGER":
      return parseInt(value, 10);
    case "DATE":
      return parseDate(value);
    case "TEXT":
    case "OPTION":
      return value.toString(); // Ensuring it's a string
    default:
      return value;
  }
}

function parseBoolean(value) {
  if (typeof value === "string") {
    value = value.trim().toLowerCase();
    if (value === "true" || value === "yes") return true;
    if (value === "false" || value === "no") return false;
  }
  return value; // Return the value as is if it's not a recognizable boolean string
}

function parseDate(value) {
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)
  ) {
    return new Date(value); // Parse the date string into a Date object
  }
  return value; // Return the value as is if it doesn't match the format
}

function filterData(data, whereClause) {
  let filteredData = data;

  for (const [fieldName, conditions] of Object.entries(whereClause)) {
    for (const [operator, value] of Object.entries(conditions)) {
      if (
        (operator === "lt" || operator === "gt") &&
        typeof value !== "number"
      ) {
        throw new Error("Data not found");
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
          throw new Error(`Invalid operator: ${operator}`);
      }
    }
  }

  return filteredData;
}

module.exports = {
  generateSchema,
  filterData,
  standardiseData,
  generateFieldObject,
  cleanedName,
};
