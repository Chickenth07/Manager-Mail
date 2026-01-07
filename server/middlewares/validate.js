export const validate =
  (schema) =>
  async (req, res, next) => {
    try {
      req.validatedBody = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      next();
    } catch (err) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: err.errors,
      });
    }
  };
