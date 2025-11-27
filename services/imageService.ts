/**
 * Image Service - Compression & Supabase Storage Upload
 * Converts base64 images to optimized WebP and uploads to CDN
 */

import { supabase } from './supabaseClient';

const BUCKET_NAME = 'assets';
const MAX_SIZE = 512; // Max width/height in pixels
const WEBP_QUALITY = 0.85; // 0-1, higher = better quality but larger file

/**
 * Compress a base64 image to WebP format using Canvas API
 * @param base64Data - Full base64 string (with or without data: prefix)
 * @param maxSize - Maximum width/height (maintains aspect ratio)
 * @returns Compressed image as Blob
 */
export async function compressToWebP(
  base64Data: string,
  maxSize: number = MAX_SIZE
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // IMPORTANT: Clear canvas with transparent background
      ctx.clearRect(0, 0, width, height);
      
      // Use high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the image (preserves transparency if source has it)
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to WebP blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create WebP blob'));
          }
        },
        'image/webp',
        WEBP_QUALITY
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Handle both formats: with and without data: prefix
    if (base64Data.startsWith('data:')) {
      img.src = base64Data;
    } else {
      img.src = `data:image/png;base64,${base64Data}`;
    }
  });
}

/**
 * Generate a unique filename for the asset
 * @param productName - Name of the product
 * @returns Unique filename with timestamp
 */
function generateFilename(productName: string): string {
  const sanitized = productName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  return `${sanitized}-${timestamp}-${random}.webp`;
}

/**
 * Upload a compressed image to Supabase Storage
 * @param blob - WebP blob to upload
 * @param filename - Filename for the asset
 * @returns Public URL of the uploaded image
 */
export async function uploadToStorage(
  blob: Blob,
  filename: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, blob, {
      contentType: 'image/webp',
      cacheControl: '31536000', // 1 year cache
      upsert: false
    });
  
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);
  
  return urlData.publicUrl;
}

/**
 * Full pipeline: Compress base64 image and upload to Storage
 * @param base64Data - Base64 image from Gemini
 * @param productName - Product name for filename
 * @returns Public CDN URL
 */
export async function processAndUploadImage(
  base64Data: string,
  productName: string
): Promise<string> {
  console.log('🖼️ Compressing image to WebP...');
  const blob = await compressToWebP(base64Data);
  
  const originalSize = Math.round(base64Data.length * 0.75 / 1024); // Approximate KB
  const compressedSize = Math.round(blob.size / 1024);
  console.log(`📦 Compressed: ${originalSize}KB → ${compressedSize}KB (${Math.round((1 - compressedSize/originalSize) * 100)}% reduction)`);
  
  const filename = generateFilename(productName);
  console.log('☁️ Uploading to Storage...');
  
  const url = await uploadToStorage(blob, filename);
  console.log('✅ Uploaded:', url);
  
  return url;
}

/**
 * Get the public URL for an existing asset
 * @param filename - Filename in storage
 * @returns Public URL
 */
export function getAssetUrl(filename: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filename);
  
  return data.publicUrl;
}
