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

module.exports = { generateFieldObject, cleanedName };
