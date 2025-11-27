/**
 * Cloudinary Service - Image Upload with Background Removal
 * Professional solution for transparent product images
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

// Cloudinary upload URL
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Convert base64 to Blob for upload
 */
function base64ToBlob(base64: string): Blob {
  // Remove data URL prefix if present
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/png' });
}

/**
 * Upload image to Cloudinary with automatic background removal
 * @param base64Image - Base64 encoded image
 * @param productName - Product name for public_id
 * @returns Cloudinary URL with background removed
 */
export async function uploadWithBackgroundRemoval(
  base64Image: string,
  productName: string
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env');
  }

  console.log('☁️ Uploading to Cloudinary...');
  
  // Create form data
  const formData = new FormData();
  const blob = base64ToBlob(base64Image);
  
  // Sanitize product name for public_id
  const publicId = `lootea/${productName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)}-${Date.now()}`;
  
  formData.append('file', blob);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('public_id', publicId);
  
  // Apply background removal transformation on upload
  // This uses Cloudinary's AI-powered background removal
  formData.append('background_removal', 'cloudinary_ai');
  
  try {
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }
    
    const result: CloudinaryUploadResult = await response.json();
    console.log('✅ Uploaded to Cloudinary:', result.public_id);
    
    // Return URL with background removal transformation applied
    // Format: https://res.cloudinary.com/{cloud}/image/upload/e_background_removal/{public_id}
    const processedUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/e_background_removal,f_png,q_auto/${result.public_id}`;
    
    console.log('🎨 Background removal URL:', processedUrl);
    return processedUrl;
    
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Get optimized delivery URL for an existing Cloudinary image
 * @param publicId - Cloudinary public ID
 * @param options - Transformation options
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    removeBackground?: boolean;
  } = {}
): string {
  const transforms: string[] = [];
  
  if (options.removeBackground) {
    transforms.push('e_background_removal');
  }
  
  if (options.width) {
    transforms.push(`w_${options.width}`);
  }
  
  if (options.height) {
    transforms.push(`h_${options.height}`);
  }
  
  transforms.push('f_png', 'q_auto');
  
  const transformString = transforms.join(',');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}
