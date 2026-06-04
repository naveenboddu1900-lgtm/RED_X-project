const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');

/**
 * @desc    Fetch analytics for a specific vendor's store storefront
 * @route   GET /api/analytics/vendor
 * @access  Private (Vendor only)
 */
const getVendorAnalytics = async (req, res, next) => {
  try {
    const storeId = req.user.store;
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Vendor store not configured' });
    }

    const storeObjectId = new mongoose.Types.ObjectId(storeId);

    // 1. Core Summary Metrics (Revenue, Order volume, items sold, active inventory count)
    const orderStats = await Order.aggregate([
      { $match: { store: storeObjectId, paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' },
        },
      },
    ]);

    const summary = {
      revenue: orderStats[0]?.totalRevenue || 0,
      ordersCount: orderStats[0]?.totalOrders || 0,
      avgOrderValue: orderStats[0]?.avgOrderValue || 0,
      totalProducts: await Product.countDocuments({ store: storeObjectId }),
    };

    // 2. Sales Over Time (Last 6 Months Trend)
    // Build array of last 6 months default slots in case database has gaps
    const monthlySales = await Order.aggregate([
      {
        $match: {
          store: storeObjectId,
          paymentStatus: 'paid',
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesTrend = monthlySales.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year.toString().slice(-2)}`,
      revenue: item.revenue,
      orders: item.orders,
    }));

    // If empty, return a default template for Recharts rendering
    if (salesTrend.length === 0) {
      salesTrend.push({ month: 'No Sales Yet', revenue: 0, orders: 0 });
    }

    // 3. Category distribution (Product share)
    const categoryStats = await Product.aggregate([
      { $match: { store: storeObjectId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);

    // 4. Top Selling Products (Aggregated quantity from completed orders)
    const topProducts = await Order.aggregate([
      { $match: { store: storeObjectId, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          quantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: {
        summary,
        salesTrend,
        categoryStats,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch site-wide statistics for platform administrators
 * @route   GET /api/analytics/admin
 * @access  Private (Admin only)
 */
const getAdminAnalytics = async (req, res, next) => {
  try {
    // Aggregates across the entire SaaS environment
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const stats = {
      totalRevenue: totalRevenue[0]?.total || 0,
      storesCount: await Store.countDocuments(),
      productsCount: await Product.countDocuments(),
      customersCount: await User.countDocuments({ role: 'customer' }),
      vendorsCount: await User.countDocuments({ role: 'vendor' }),
      pendingStoresCount: await Store.countDocuments({ status: 'pending' }),
    };

    // Store Distribution by Status
    const storeStatusStats = await Store.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    // Store performance leaderboards (Revenue generated per tenant)
    const topStores = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$store',
          revenue: { $sum: '$total' },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // Populate store metadata details
    const topStoresWithNames = [];
    for (const item of topStores) {
      const store = await Store.findById(item._id).select('name slug logo');
      if (store) {
        topStoresWithNames.push({
          _id: store._id,
          name: store.name,
          slug: store.slug,
          logo: store.logo,
          revenue: item.revenue,
          ordersCount: item.ordersCount,
        });
      }
    }

    res.json({
      success: true,
      data: {
        stats,
        storeStatusDistribution: storeStatusStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        topStores: topStoresWithNames,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVendorAnalytics,
  getAdminAnalytics,
};
