// Role-based access control middleware
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: allowedRoles,
          current: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// Admin only middleware
const adminOnly = roleMiddleware(['admin']);

// Seller and admin middleware
const sellerOrAdmin = roleMiddleware(['seller', 'admin']);

// All roles middleware (authenticated users only)
const authenticated = roleMiddleware(['buyer', 'seller', 'admin']);

module.exports = {
  roleMiddleware,
  adminOnly,
  sellerOrAdmin,
  authenticated
};