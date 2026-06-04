const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a store name'],
      trim: true,
      unique: true,
      maxlength: [40, 'Store name cannot exceed 40 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a store description'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    logo: {
      type: String,
      default: '', // Will store image URL or base64
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // A vendor can own only one store in this system
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from store name before saving
storeSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphen
      .replace(/(^-|-$)+/g, '');    // Remove leading/trailing hyphens
  }
  next();
});

module.exports = mongoose.model('Store', storeSchema);
