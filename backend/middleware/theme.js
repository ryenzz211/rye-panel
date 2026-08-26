// Middleware untuk menyimpan theme preference
export const applyTheme = (req, res, next) => {
  // Theme akan dihandle di frontend via JavaScript
  next();
};

export default { applyTheme };
