// Check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    // If API request
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'Silakan login terlebih dahulu'
      });
    }
    // If page request
    return res.redirect('/login');
  }
  next();
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.session || req.session.role !== 'admin') {
    if (req.path.startsWith('/api/')) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin.'
      });
    }
    return res.status(403).send('Akses ditolak');
  }
  next();
};

// Check if first run (redirect to setup)
export const checkFirstRunRedirect = async (req, res, next) => {
  try {
    const { isFirstRun } = await import('../services/authService.js');
    const firstRun = await isFirstRun();
    
    if (firstRun && req.path !== '/setup' && !req.path.startsWith('/api/auth')) {
      return res.redirect('/setup');
    }
    next();
  } catch (error) {
    console.error('[Auth] First run check error:', error);
    next();
  }
};

// API auth guard
export const apiAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Silakan login terlebih dahulu'
    });
  }
  next();
};

export default {
  isAuthenticated,
  isAdmin,
  checkFirstRunRedirect,
  apiAuth
};
