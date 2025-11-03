const admin = require('firebase-admin');
const crypto = require('crypto');
const axios = require('axios');
const sharp = require('sharp');

/**
 * Firebase Storage utilities for campaign images
 */

/**
 * Upload image to Firebase Storage
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} contentType - MIME type (e.g., 'image/png', 'image/jpeg')
 * @param {string} folder - Folder name ('main' or 'header')
 * @returns {Promise<string>} - Public URL of uploaded image
 */
async function uploadImage(imageBuffer, contentType, folder = 'images') {
  const bucket = admin.storage().bucket();

  // Generate unique filename
  const filename = `${folder}/${crypto.randomBytes(16).toString('hex')}.${getExtension(contentType)}`;

  // Create file reference
  const file = bucket.file(filename);

  // Upload buffer
  await file.save(imageBuffer, {
    metadata: {
      contentType,
      cacheControl: 'public, max-age=31536000' // Cache for 1 year
    }
  });

  // Make file publicly accessible
  await file.makePublic();

  // Return public URL
  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

/**
 * Delete image from Firebase Storage
 * @param {string} imageUrl - Public URL of image to delete
 */
async function deleteImage(imageUrl) {
  try {
    const bucket = admin.storage().bucket();

    // Extract filename from URL
    const filename = imageUrl.split(`${bucket.name}/`)[1];

    if (!filename) {
      throw new Error('Invalid image URL');
    }

    // Delete file
    await bucket.file(filename).delete();
    console.log(`Deleted image: ${filename}`);
  } catch (error) {
    console.error('Error deleting image:', error.message);
    // Don't throw - deletion failures shouldn't break the flow
  }
}

/**
 * Get file extension from MIME type
 */
function getExtension(contentType) {
  const mimeMap = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  };

  return mimeMap[contentType] || 'jpg';
}

/**
 * Validate image content type
 */
function isValidImageType(contentType) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(contentType);
}

/**
 * Validate file size (max 5MB)
 */
function isValidFileSize(buffer, maxSizeMB = 5) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return buffer.length <= maxBytes;
}

/**
 * Download image from URL and upload to Firebase Storage
 * @param {string} imageUrl - URL of image to download
 * @param {string} folder - Folder name (e.g., 'campaigns/main')
 * @returns {Promise<string>} - Public URL of uploaded image
 */
async function downloadAndUploadImage(imageUrl, folder = 'campaigns') {
  try {
    console.log(`Downloading image from ${imageUrl}`);

    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; XFunderBot/1.0)'
      }
    });

    const imageBuffer = Buffer.from(response.data);
    const contentType = response.headers['content-type'] || 'image/jpeg';

    // Validate
    if (!isValidImageType(contentType)) {
      console.log(`Invalid image type: ${contentType}`);
      return null;
    }

    if (!isValidFileSize(imageBuffer)) {
      console.log('Image too large');
      return null;
    }

    // Upload to Firebase
    const publicUrl = await uploadImage(imageBuffer, contentType, folder);
    console.log(`Uploaded image to ${publicUrl}`);

    return publicUrl;

  } catch (error) {
    console.error(`Error downloading/uploading image from ${imageUrl}:`, error.message);
    return null;
  }
}

/**
 * Download image and get its aspect ratio
 * @param {string} imageUrl - URL of image to download
 * @returns {Promise<{buffer: Buffer, aspectRatio: number, contentType: string}>}
 */
async function downloadImageWithAspectRatio(imageUrl) {
  try {
    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; XFunderBot/1.0)'
      }
    });

    const imageBuffer = Buffer.from(response.data);
    const contentType = response.headers['content-type'] || 'image/jpeg';

    // Validate
    if (!isValidImageType(contentType)) {
      return null;
    }

    if (!isValidFileSize(imageBuffer)) {
      return null;
    }

    // Get image dimensions using sharp
    const metadata = await sharp(imageBuffer).metadata();
    const aspectRatio = metadata.width / metadata.height;

    console.log(`Image ${metadata.width}x${metadata.height} (ratio: ${aspectRatio.toFixed(2)})`);

    return {
      buffer: imageBuffer,
      aspectRatio,
      contentType
    };

  } catch (error) {
    console.error(`Error downloading image:`, error.message);
    return null;
  }
}

/**
 * Classify images from tweet by aspect ratio and upload to Firebase
 * @param {Array} mediaUrls - Array of image URLs from tweet
 * @returns {Promise<{main_image_url: string|null, header_image_url: string|null}>}
 */
async function classifyAndUploadTweetImages(mediaUrls) {
  const result = {
    main_image_url: null,
    header_image_url: null
  };

  if (!mediaUrls || mediaUrls.length === 0) {
    return result;
  }

  console.log(`Classifying ${mediaUrls.length} images by aspect ratio`);

  for (const url of mediaUrls) {
    const imageData = await downloadImageWithAspectRatio(url);

    if (!imageData) {
      continue;
    }

    const { buffer, aspectRatio, contentType } = imageData;

    // Classify by aspect ratio
    // Square: 0.9 - 1.1 (1:1)
    // Header: 2.8 - 3.2 (3:1)

    if (aspectRatio >= 0.9 && aspectRatio <= 1.1 && !result.main_image_url) {
      // Square image = main image
      console.log(`Classified as main image (square, ratio: ${aspectRatio.toFixed(2)})`);
      result.main_image_url = await uploadImage(buffer, contentType, 'campaigns/main');
    } else if (aspectRatio >= 2.8 && aspectRatio <= 3.2 && !result.header_image_url) {
      // 3:1 image = header image
      console.log(`Classified as header image (3:1, ratio: ${aspectRatio.toFixed(2)})`);
      result.header_image_url = await uploadImage(buffer, contentType, 'campaigns/header');
    } else {
      console.log(`Image with aspect ratio ${aspectRatio.toFixed(2)} doesn't match requirements (square: 0.9-1.1, header: 2.8-3.2)`);
    }
  }

  return result;
}

module.exports = {
  uploadImage,
  deleteImage,
  downloadAndUploadImage,
  classifyAndUploadTweetImages,
  isValidImageType,
  isValidFileSize
};
