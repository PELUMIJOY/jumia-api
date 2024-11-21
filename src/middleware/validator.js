const validate = (schema) => (req, res, next) => {
  const options = { abortEarly: false, allowUnknown: true, stripUnknown: true };
  const { error, value } = schema.validate(req.body, options);

  if (error) {
    return res.status(400).json({
      error: "Validation error",
      details: error.details.map((detail) => detail.message),
    });
  }

  req.body = value;
  next();
};

module.exports = validate;
