const formatMongooseError = (error) => {
  const errors = [];
  if (error.name === "ValidationError") {
    Object.keys(error.errors).forEach((field) => {
      const err = error.errors[field];
      errors.push({
        field,
        message: err.message,
        value: err.value,
        type: err.kind,
      });
    });
  } else if (error.code === 11000) {
    errors.push({
      field: Object.keys(error.keyPattern)[0],
      message: "Duplicate value",
      type: "unique",
    });
  } else {
    errors.push({
      message: error.message || "Unknown error",
      type: error.name || "Error",
    });
  }
  return errors;
};

module.exports = formatMongooseError;
