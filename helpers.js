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
  let typeCounts = {};

  for (let i = 0; i < Math.min(maxRows, data.length); i++) {
    const row = data[i];

    for (const [key, value] of Object.entries(row)) {
      const dataType = determineDataType(value, key, data);

      if (!typeCounts[key]) {
        typeCounts[key] = {};
      }

      if (!typeCounts[key][dataType]) {
        typeCounts[key][dataType] = 0;
      }

      typeCounts[key][dataType] += 1;

      // Update schema for the first row or if type is 'NULL'
      if (i === 0 || !schema[key] || schema[key].type === "NULL") {
        schema[key] = generateFieldObject(key, dataType, []);
      }
    }
  }

  // Determine the most common type for each column
  for (const key in typeCounts) {
    const mostCommonType = Object.keys(typeCounts[key]).reduce((a, b) =>
      typeCounts[key][a] > typeCounts[key][b] ? a : b
    );
    schema[key].type = mostCommonType;
    schema[key].options =
      mostCommonType === "OPTIONS"
        ? Array.from(new Set(data.map((row) => row[key])))
        : [];
  }

  return Object.values(schema); // Convert the schema object to an array of field objects
}

function generateFieldObject(columnName, dataType, potentialOptions) {
  let camelCaseName = cleanedName(columnName);

  return {
    display: columnName,
    name: camelCaseName,
    type: dataType,
    options: potentialOptions,
  };
}

function determineDataType(value, columnName, data) {
  if (value === null) return "NULL";
  if (typeof value === "boolean") return "BOOLEAN";
  if (typeof value === "number")
    return Number.isInteger(value) ? "INTEGER" : "FLOAT";
  if (typeof value === "string") {
    value = value.trim(); // Trim whitespace
    if (isDate(value)) return "DATE";
    if (["true", "false", "yes", "no"].includes(value.toLowerCase()))
      return "BOOLEAN";
    if (/^[+-]?\d+$/.test(value)) return "INTEGER";
    if (/^[+-]?\d+(\.\d+)?$/.test(value)) return "FLOAT";

    // Analyzing for OPTION type based on unique values in the column
    const uniqueValues = new Set(data.map((row) => row[columnName]));
    const optionsThresh = 20;
    if (uniqueValues.size <= optionsThresh && uniqueValues.size > 1)
      return "OPTIONS";
  }

  return "TEXT";
}

function isDate(value) {
  const date = new Date(value);
  return !isNaN(date.getTime());
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
      return value.toString();
    default:
      return value;
  }
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

function parseBoolean(value) {
  if (typeof value === "string") {
    value = value.trim().toLowerCase();
    if (value === "true" || value === "yes") return true;
    if (value === "false" || value === "no") return false;
  }
  return value; // Returns default value
}

function parseDate(value) {
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)
  ) {
    return new Date(value);
  }
  return value; // Returns default value
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
