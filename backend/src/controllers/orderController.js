const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const stripeService = require('../services/stripeService');
const { sendOrderConfirmationEmail } = require('../services/mailService');

/**
 * @desc    Create a new checkout order and generate Stripe PaymentIntent
 * @route   POST /api/orders
 * @access  Public
 */
const createOrder = async (req, res, next) => {
  try {
    const { storeId, customerInfo, items } = req.body;

    if (!storeId || !customerInfo || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide store details, items, and shipping info' });
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    let calculatedTotal = 0;
    const orderItems = [];

    // Verify each product and calculate totals using db prices for safety
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }

      // Ensure item belongs to the same store
      if (product.store.toString() !== storeId) {
        return res.status(400).json({
          success: false,
          message: `Product '${product.name}' does not belong to storefront: ${store.name}`,
        });
      }

      // Check stock levels
      if (product.inventory < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for product '${product.name}'. Available: ${product.inventory}, Requested: ${item.quantity}`,
        });
      }

      const itemPrice = product.price;
      calculatedTotal += itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: itemPrice,
        variant: item.variant || 'Standard',
      });
    }

    // Set minimum checkout threshold to avoid stripe creation failures
    if (calculatedTotal <= 0) {
      return res.status(400).json({ success: false, message: 'Order total must be greater than zero' });
    }

    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent(calculatedTotal, 'usd');

    // Create the pending order record in MongoDB
    const order = await Order.create({
      customer: req.user ? req.user._id : null, // Support guest checkout
      customerInfo,
      store: storeId,
      items: orderItems,
      total: calculatedTotal,
      status: 'pending',
      paymentStatus: 'pending',
      paymentIntentId: paymentIntent.id,
    });

    res.status(201).json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
      total: calculatedTotal,
      isMock: paymentIntent.mock,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirm checkout payments, update order status & deduct stocks
 * @route   POST /api/orders/confirm
 * @access  Public
 */
const confirmPayment = async (req, res, next) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    if (!orderId || !paymentIntentId) {
      return res.status(400).json({ success: false, message: 'Order ID and payment intent are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found' });
    }

    // Verify payment intent status with Stripe or Mock service
    const verification = await stripeService.confirmMockPayment(paymentIntentId);

    if (verification.status === 'succeeded') {
      // Prevent double deduction if order is already paid
      if (order.paymentStatus !== 'paid') {
        // Deduct inventory items in database
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product) {
            product.inventory = Math.max(0, product.inventory - item.quantity);
            await product.save();
          }
        }

        order.status = 'paid';
        order.paymentStatus = 'paid';
        await order.save();

        // Trigger transactional confirmation email sending asynchronously
        // We catch internal errors to avoid failing the payment confirmation response
        try {
          await sendOrderConfirmationEmail(order.customerInfo.email, order);
        } catch (emailErr) {
          console.error('[Order Confirmation] Email delivery fail:', emailErr.message);
        }
      }

      res.json({
        success: true,
        message: 'Payment completed and verified successfully',
        order,
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      
      res.status(400).json({
        success: false,
        message: `Payment verification failed. Stripe status: ${verification.status}`,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order details (Customer or Vendor access validation)
 * @route   GET /api/orders/:id
 * @access  Private/Public (depending on request payload)
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('store', 'name slug')
      .populate('customer', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization (allow customer who ordered, store vendor, or system admin)
    const isCustomer = req.user && order.customer && order.customer._id.toString() === req.user._id.toString();
    const isVendor = req.user && req.user.store && order.store._id.toString() === req.user.store.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    const isGuestOwner = !order.customer; // For guests, let UI fetch order info directly by URL

    if (!isCustomer && !isVendor && !isAdmin && !isGuestOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order details' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get orders for a vendor's tenant store
 * @route   GET /api/orders/vendor/my-store
 * @access  Private (Vendor only)
 */
const getVendorOrders = async (req, res, next) => {
  try {
    if (!req.user.store) {
      return res.status(400).json({ success: false, message: 'User does not own a registered storefront' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const filter = { store: req.user.store };

    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const count = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get purchase history of log-in Customer
 * @route   GET /api/orders/customer/my-history
 * @access  Private (Customer only)
 */
const getCustomerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('store', 'name slug logo')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update delivery/processing status of a store order
 * @route   PUT /api/orders/:id/status
 * @access  Private (Vendor only)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide status update values' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization checks
    if (order.store.toString() !== req.user.store.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this order status' });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, message: `Order status updated to '${status}' successfully`, data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  confirmPayment,
  getOrderById,
  getVendorOrders,
  getCustomerOrders,
  updateOrderStatus,
};
