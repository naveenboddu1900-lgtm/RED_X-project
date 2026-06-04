const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare price must be greater than or equal to 0'],
      default: 0,
    },
    inventory: {
      type: Number,
      required: [true, 'Please provide product inventory count'],
      min: [0, 'Inventory count cannot be negative'],
      default: 10,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      trim: true,
    },
    variants: [
      {
        name: {
          type: String, // e.g., 'Size', 'Color'
          required: true,
        },
        values: {
          type: [String], // e.g., ['S', 'M', 'L'], ['Red', 'Blue']
          required: true,
        },
      },
    ],
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster search and multi-tenant scoping
productSchema.index({ store: 1, category: 1 });
productSchema.index({ store: 1, name: 'text', description: 'text' }); // Text search index per-tenant

// Auto-generate slug from product name before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
