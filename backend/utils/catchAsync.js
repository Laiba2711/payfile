/**
 * Wrapper for async controller functions to eliminate redundant try-catch blocks.
 * Automatically catches errors and passes them to the global error handler.
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
