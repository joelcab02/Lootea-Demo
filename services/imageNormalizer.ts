/**
 * Image Normalizer - Standardizes product images
 * Detects product bounds, crops, and centers in a fixed canvas
 */

const CANVAS_SIZE = 1024; // Final canvas size (square)
const PRODUCT_FILL = 0.75; // Product should occupy 75% of canvas
const PADDING = (1 - PRODUCT_FILL) / 2; // Padding on each side

/**
 * Detect the bounding box of non-transparent pixels
 */
function detectBounds(ctx: CanvasRenderingContext2D, width: number, height: number): {
  left: number;
  top: number;
  right: number;
  bottom: number;
} {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  let left = width;
  let top = height;
  let right = 0;
  let bottom = 0;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 10) { // Pixel is not transparent
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  
  return { left, top, right, bottom };
}

/**
 * Normalize a product image:
 * 1. Detect product bounds
 * 2. Crop to product
 * 3. Scale to fill 75% of canvas
 * 4. Center in square canvas
 * 
 * @param base64Image - Base64 image with transparency
 * @returns Normalized base64 image
 */
export async function normalizeProductImage(base64Image: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Step 1: Load image and detect bounds
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      tempCtx.drawImage(img, 0, 0);
      const bounds = detectBounds(tempCtx, img.width, img.height);
      
      // Calculate product dimensions
      const productWidth = bounds.right - bounds.left;
      const productHeight = bounds.bottom - bounds.top;
      
      if (productWidth <= 0 || productHeight <= 0) {
        // No product detected, return original
        resolve(base64Image);
        return;
      }
      
      // Step 2: Create final canvas
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = CANVAS_SIZE;
      finalCanvas.height = CANVAS_SIZE;
      const finalCtx = finalCanvas.getContext('2d');
      
      if (!finalCtx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Clear with transparency
      finalCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      
      // Step 3: Calculate scale to fit product in 75% of canvas
      const targetSize = CANVAS_SIZE * PRODUCT_FILL;
      const scale = Math.min(targetSize / productWidth, targetSize / productHeight);
      
      const scaledWidth = productWidth * scale;
      const scaledHeight = productHeight * scale;
      
      // Step 4: Center in canvas
      const offsetX = (CANVAS_SIZE - scaledWidth) / 2;
      const offsetY = (CANVAS_SIZE - scaledHeight) / 2;
      
      // Draw cropped and scaled product
      finalCtx.drawImage(
        img,
        bounds.left, bounds.top, productWidth, productHeight, // Source (crop)
        offsetX, offsetY, scaledWidth, scaledHeight // Destination (scaled & centered)
      );
      
      // Return as PNG to preserve transparency
      const result = finalCanvas.toDataURL('image/png');
      console.log(`[Normalizer] Product normalized: ${productWidth}x${productHeight} -> ${Math.round(scaledWidth)}x${Math.round(scaledHeight)} centered in ${CANVAS_SIZE}x${CANVAS_SIZE}`);
      
      resolve(result);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = base64Image;
  });
}

/**
 * Check if an image has transparency
 */
export async function hasTransparency(base64Image: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(false);
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;
      
      // Check if any pixel has alpha < 255
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 250) {
          resolve(true);
          return;
        }
      }
      
      resolve(false);
    };
    
    img.onerror = () => resolve(false);
    img.src = base64Image;
  });
}
