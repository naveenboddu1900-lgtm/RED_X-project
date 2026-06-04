const Product = require('../models/Product');
const Store = require('../models/Store');
const { uploadImage, deleteImage } = require('../services/storageService');

/**
 * @desc    Get products for a specific store (with search, category filter, sorting, pagination)
 * @route   GET /api/products/store/:storeIdOrSlug
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const { storeIdOrSlug } = req.params;
    const { search, category, sort, page = 1, limit = 10, minPrice, maxPrice } = req.query;

    // Find the store ID first if slug is provided
    let storeId = storeIdOrSlug;
    let store = null;
    if (storeIdOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      store = await Store.findById(storeIdOrSlug);
    } else {
      store = await Store.findOne({ slug: storeIdOrSlug });
    }

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store storefront not found' });
    }
    storeId = store._id;

    // Build query filters
    const query = { store: storeId };

    // Text search query
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = { $regex: new RegExp('^' + category + '$', 'i') };
    }

    // Price range filters
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Compute total items count matching queries
    const count = await Product.countDocuments(query);

    // Build sort options
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort) {
      if (sort === 'price-asc') sortOptions = { price: 1 };
      else if (sort === 'price-desc') sortOptions = { price: -1 };
      else if (sort === 'name-asc') sortOptions = { name: 1 };
      else if (sort === 'name-desc') sortOptions = { name: -1 };
    }

    // Pagination calculations
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with projections for text search scoring if searching
    let productsQuery = Product.find(query);
    if (search) {
      productsQuery = productsQuery
        .select({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } });
    } else {
      productsQuery = productsQuery.sort(sortOptions);
    }

    const products = await productsQuery.skip(skip).limit(Number(limit));

    // Get list of unique categories in this store for navigation sidebar
    const categories = await Product.distinct('category', { store: storeId });

    res.json({
      success: true,
      count,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      categories: ['All', ...categories],
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product details
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('store', 'name slug logo');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a store product
 * @route   POST /api/products
 * @access  Private (Vendor only)
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, compareAtPrice, inventory, category, variants } = req.body;

    // Check if user owns a store
    if (!req.user.store) {
      return res.status(400).json({ success: false, message: 'User does not own a registered storefront' });
    }

    // Verify store status
    const store = await Store.findById(req.user.store);
    if (store.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Store storefront is suspended. Cannot perform listings.' });
    }

    // Process image files if uploaded
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file);
        imageUrls.push(url);
      }
    } else {
      // Default fallback placeholder image
      imageUrls.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop');
    }

    // Parse variants if they come as stringified JSON from post forms
    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
      } catch (err) {
        console.error('Error parsing variants format:', err.message);
      }
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : 0,
      inventory: inventory ? Number(inventory) : 10,
      category: category || 'General',
      images: imageUrls,
      variants: parsedVariants,
      store: req.user.store,
    });

    res.status(201).json({
      success: true,
      message: 'Product listed successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update listed product
 * @route   PUT /api/products/:id
 * @access  Private (Vendor only)
 */
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check authorization (Vendor must own the store containing this product)
    if (product.store.toString() !== req.user.store.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized modification' });
    }

    const { name, description, price, compareAtPrice, inventory, category, variants, existingImages } = req.body;

    // Handle image file updates if provided
    let imageUrls = [];
    
    // Support keeping some existing images (parse if list comes stringified)
    if (existingImages) {
      try {
        const keeps = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
        imageUrls = [...keeps];
      } catch (err) {
        imageUrls = Array.isArray(existingImages) ? [...existingImages] : [existingImages];
      }
    } else {
      imageUrls = [...product.images];
    }

    // Add newly uploaded images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file);
        imageUrls.push(url);
      }
    }

    let parsedVariants = product.variants;
    if (variants) {
      try {
        parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
      } catch (err) {
        console.error('Error parsing variants update:', err.message);
      }
    }

    // Apply updates
    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (compareAtPrice !== undefined) product.compareAtPrice = Number(compareAtPrice);
    if (inventory !== undefined) product.inventory = Number(inventory);
    if (category) product.category = category;
    product.images = imageUrls;
    product.variants = parsedVariants;

    await product.save();

    res.json({
      success: true,
      message: 'Product details updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product listing
 * @route   DELETE /api/products/:id
 * @access  Private (Vendor only)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check authorization
    if (product.store.toString() !== req.user.store.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized deletion' });
    }

    // Clean up stored image media assets
    if (product.images && product.images.length > 0) {
      for (const url of product.images) {
        if (!url.includes('placeholder')) {
          await deleteImage(url);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product listing removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
