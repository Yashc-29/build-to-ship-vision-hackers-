export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
      return res.status(400).json({
        error: 'Validation Error',
        message: issues[0]?.message || 'Invalid input data',
        details: issues
      });
    }
    req.validatedBody = result.data;
    next();
  };
}
