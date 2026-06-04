const Store = require('../models/Store');
const { uploadImage, deleteImage } = require('../services/storageService');

/**
 * @desc    Get all approved storefronts
 * @route   GET /api/stores
 * @access  Public
 */
const getStores = async (req, res, next) => {
  try {
    const stores = await Store.find({ status: 'approved' }).select('-vendor -createdAt -updatedAt');
    res.json({ success: true, count: stores.length, data: stores });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single store storefront metadata by slug
 * @route   GET /api/stores/slug/:slug
 * @access  Public
 */
const getStoreBySlug = async (req, res, next) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Secure access limits based on status
    if (store.status !== 'approved') {
      // If store is pending/suspended, only the owner or superadmin can view
      const hasAccess =
        req.user &&
        (req.user.role === 'admin' || req.user._id.toString() === store.vendor.toString());

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'This storefront is pending approval or suspended',
          status: store.status,
        });
      }
    }

    res.json({ success: true, data: store });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update store profiles (Logo, description, name)
 * @route   PUT /api/stores/:id
 * @access  Private (Vendor only)
 */
const updateStore = async (req, res, next) => {
  try {
    let store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Check ownership
    if (store.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized modification' });
    }

    const { name, description } = req.body;
    let logoUrl = store.logo;

    // Handle logo upload if provided
    if (req.file) {
      // Clean up previous logo image
      if (store.logo) {
        await deleteImage(store.logo);
      }
      logoUrl = await uploadImage(req.file);
    }

    // Apply updates
    if (name) store.name = name;
    if (description) store.description = description;
    store.logo = logoUrl;

    await store.save();

    res.json({ success: true, message: 'Store settings updated successfully', data: store });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStores,
  getStoreBySlug,
  updateStore,
};
