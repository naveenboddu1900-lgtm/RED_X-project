const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Store = require('../models/Store');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey123456!', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Register a new user (Customer or Vendor)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, storeName, storeDescription } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Role-based validation
    if (role === 'vendor' && !storeName) {
      return res.status(400).json({ success: false, message: 'Store name is required for vendor registration' });
    }

    // Create User (Password is hashed in pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
    });

    let store = null;

    // If role is vendor, create the tenant store in 'pending' status
    if (user.role === 'vendor') {
      try {
        store = await Store.create({
          name: storeName,
          description: storeDescription || `Welcome to ${storeName}`,
          vendor: user._id,
          status: 'pending', // Requires Super Admin approval
        });

        // Associate store ID back to User
        user.store = store._id;
        await user.save();
      } catch (err) {
        // Rollback user creation if store creation fails to preserve integrity
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ success: false, message: err.message || 'Store registration failed' });
      }
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.store,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate User & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user (include password)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateToken(user._id);

    // If user is vendor, fetch their store slug and name
    let storeInfo = null;
    if (user.role === 'vendor' && user.store) {
      storeInfo = await Store.findById(user.store).select('name slug status');
    }

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.store,
        storeInfo: storeInfo,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user details
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    let storeInfo = null;
    if (req.user.role === 'vendor' && req.user.store) {
      storeInfo = await Store.findById(req.user.store);
    }

    res.json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        store: req.user.store,
        storeInfo,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
