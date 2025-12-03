/**
 * Remove.bg Service - Background Removal API
 * https://www.remove.bg/api
 */

const API_URL = 'https://api.remove.bg/v1.0/removebg';
const API_KEY = import.meta.env.VITE_REMOVEBG_API_KEY || '';

/**
 * Check if remove.bg is configured
 */
export function isRemoveBgConfigured(): boolean {
  return !!API_KEY;
}

/**
 * Remove background from a base64 image
 * @param base64Image - Base64 encoded image (with or without data: prefix)
 * @returns Base64 image with transparent background
 */
export async function removeBackground(base64Image: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('Remove.bg API key not configured. Set VITE_REMOVEBG_API_KEY in .env');
  }

  // Extract base64 data without prefix
  const base64Data = base64Image.includes(',') 
    ? base64Image.split(',')[1] 
    : base64Image;

  // Create form data
  const formData = new FormData();
  
  // Convert base64 to blob
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });
  
  formData.append('image_file', blob, 'image.png');
  formData.append('size', 'auto');
  formData.append('format', 'png');

  console.log('[Remove.bg] Processing image...');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'X-Api-Key': API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ errors: [{ title: 'Unknown error' }] }));
    const errorMessage = error.errors?.[0]?.title || 'Failed to remove background';
    throw new Error(errorMessage);
  }

  // Get result as blob and convert to base64
  const resultBlob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      console.log('[Remove.bg] Background removed successfully');
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to read result'));
    reader.readAsDataURL(resultBlob);
  });
}
