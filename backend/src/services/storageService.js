const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const cloudinaryActive = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryActive) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('\x1b[32m[Service] Cloudinary Media Store Connected\x1b[0m');
} else {
  console.log('\x1b[33m[Service] Cloudinary keys absent. Uploads will write locally to Express disk storage.\x1b[0m');
}

/**
 * Uploads a local file (multer payload) to Cloudinary or returns Express static URL path.
 * @param {object} file - Express multer file object
 * @returns {Promise<string>} - Public accessible image URL
 */
const uploadImage = async (file) => {
  if (!file) return '';

  if (cloudinaryActive) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'saas-multi-tenant-ecommerce',
      });
      // Delete temporary file after upload to Cloudinary completes
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return result.secure_url;
    } catch (err) {
      console.error('[Cloudinary Service] Upload failure:', err.message);
      // Fallback: return static local URL instead of failing
      return `/uploads/${file.filename}`;
    }
  } else {
    // Return the relative URL path served by Express static server
    return `/uploads/${file.filename}`;
  }
};

/**
 * Deletes an image
 */
const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;

  if (cloudinaryActive && imageUrl.includes('cloudinary.com')) {
    try {
      // Extract public_id from Cloudinary URL
      const matches = imageUrl.match(/\/saas-multi-tenant-ecommerce\/(.+)\./);
      if (matches && matches[1]) {
        const publicId = `saas-multi-tenant-ecommerce/${matches[1]}`;
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (err) {
      console.error('[Cloudinary Service] Deletion failure:', err.message);
    }
  } else if (imageUrl.startsWith('/uploads/')) {
    // Clean up local file
    const filename = imageUrl.replace('/uploads/', '');
    const fs = require('fs');
    const path = require('path');
    const filepath = path.join(__dirname, '../../uploads', filename);
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
      } catch (err) {
        console.error('[Storage Service] Local file clean error:', err.message);
      }
    }
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
