/**
 * Check if a URL is a blob URL
 */
export function isBlobUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('blob:');
}

/**
 * Check if an image URL is valid (not a blob URL or is a valid permanent URL)
 * Blob URLs are temporary and should eventually be replaced with Supabase Storage URLs
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // Blob URLs are temporary and may become invalid
  // They should not be used for permanent storage, but we allow them for now
  // TODO: Replace blob URLs with Supabase Storage URLs after upload
  
  // Check if it's a valid URL format
  try {
    const urlObj = new URL(url);
    // Allow blob URLs (for temporary display), http/https URLs, and data URLs
    return urlObj.protocol === 'blob:' || 
           urlObj.protocol === 'http:' || 
           urlObj.protocol === 'https:' ||
           url.startsWith('data:');
  } catch {
    // Invalid URL format
    return false;
  }
}

/**
 * Get a safe image URL with fallback
 */
export function getSafeImageUrl(url: string | null | undefined, fallback?: string): string {
  if (!url || !isValidImageUrl(url)) {
    return fallback || '/placeholder.svg';
  }
  return url;
}

