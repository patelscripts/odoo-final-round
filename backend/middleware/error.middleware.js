exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Server error",
  });
};

exports.notFound = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};