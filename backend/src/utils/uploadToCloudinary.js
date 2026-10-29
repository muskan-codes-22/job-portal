import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';

export default async function uploadToCloudinary(buffer, folder, resourceType = 'auto', mimeType = '') {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    // Graceful fallback to data URI when Cloudinary is not configured
    const type = mimeType || (resourceType === 'image' ? 'image/jpeg' : 'application/pdf');
    return {
      secure_url: `data:${type};base64,${buffer.toString('base64')}`,
      public_id: `local_${Date.now()}`,
    };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) {
          // If cloudinary error happens, fallback to data URI
          const type = mimeType || (resourceType === 'image' ? 'image/jpeg' : 'application/pdf');
          resolve({
            secure_url: `data:${type};base64,${buffer.toString('base64')}`,
            public_id: `fallback_${Date.now()}`,
          });
        } else {
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}
