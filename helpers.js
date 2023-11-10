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

function generateFieldObject(columnName, columnValue) {
  // Remove punctuation and non-standard characters for camelCase conversion
  let camelCaseName = cleanedName(columnName);

  // Determine the data type
  function determineDataType(value) {
    if (value === null) return "NULL"; // Handle null values
    if (typeof value === "boolean") return "BOOLEAN"; // Check for boolean before converting to string
    if (
      !isNaN(parseInt(value)) &&
      Number.isInteger(parseFloat(value)) &&
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)
    )
      return "INTEGER";
    if (!isNaN(parseFloat(value))) return "FLOAT";
    if (typeof value === "string") {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return "DATE";
      if (["true", "false", "yes", "no"].includes(value.toLowerCase()))
        return "BOOLEAN";
    }
    return "TEXT"; // Default data type
  }

  let dataType = determineDataType(columnValue);

  // Generate the field object
  return {
    display: columnName,
    name: camelCaseName,
    type: dataType,
    options: [],
  };
}

// Function to standardize data
function standardiseData(data) {
  return data.map((row) => {
    const newRow = {};
    for (const [key, value] of Object.entries(row)) {
      newRow[cleanedName(key)] = value;
    }
    return newRow;
  });
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
  filterData,
  standardiseData,
  generateFieldObject,
  cleanedName,
};
