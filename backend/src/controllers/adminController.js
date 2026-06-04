const Store = require('../models/Store');
const User = require('../models/User');

/**
 * @desc    Get all stores registered (supports status filters)
 * @route   GET /api/admin/stores
 * @access  Private (Admin only)
 */
const getAllStores = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    if (status) {
      filter.status = status;
    }

    const stores = await Store.find(filter)
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: stores.length, data: stores });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a pending store storefront
 * @route   PUT /api/admin/stores/:id/approve
 * @access  Private (Admin only)
 */
const approveStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store storefront not found' });
    }

    store.status = 'approved';
    await store.save();

    console.log(`[Admin] Store approved: ${store.name} (${store.slug})`);

    res.json({
      success: true,
      message: `Store '${store.name}' has been approved and is now live.`,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Suspend/Suspend an active store storefront
 * @route   PUT /api/admin/stores/:id/suspend
 * @access  Private (Admin only)
 */
const suspendStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store storefront not found' });
    }

    const newStatus = store.status === 'suspended' ? 'approved' : 'suspended';
    store.status = newStatus;
    await store.save();

    console.log(`[Admin] Store status toggled to: ${newStatus} for store: ${store.name}`);

    res.json({
      success: true,
      message: `Store '${store.name}' status has been set to '${newStatus}'.`,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStores,
  approveStore,
  suspendStore,
};
