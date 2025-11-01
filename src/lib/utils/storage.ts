import { supabase } from '$lib/supabase';

const BUCKET_NAME = 'cosplay-images';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload an image file to Supabase Storage
 * @param file - The file to upload
 * @param folder - Optional folder path within the bucket (e.g., 'ideas', 'projects')
 * @param teamId - The team ID to organize images by team
 * @returns The public URL and path of the uploaded image
 */
export async function uploadImageToStorage(
  file: File | Blob,
  folder: string = 'ideas',
  teamId?: string
): Promise<UploadResult> {
  try {
    if (!teamId) {
      throw new Error('Team ID is required for image uploads');
    }

    // Generate a unique filename
    const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    // Structure: {teamId}/{folder}/{filename}
    const filePath = `${teamId}/${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param path - The path of the image to delete
 */
export async function deleteImageFromStorage(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Extract the storage path from a Supabase Storage URL
 * @param url - The full URL or path
 * @returns The storage path, or null if not a storage URL
 */
export function extractStoragePath(url: string): string | null {
  // If it's already a path (no http), return as is
  if (!url.startsWith('http')) {
    return url;
  }

  // Extract path from Supabase Storage URL
  // Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
  if (match) {
    return match[1];
  }

  // If it's a blob URL, return null (can't extract path)
  if (url.startsWith('blob:')) {
    return null;
  }

  return null;
}

