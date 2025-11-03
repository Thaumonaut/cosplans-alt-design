/**
 * Task Attachment Service
 * Feature: 003-modern-task-ui
 * Purpose: File upload/download operations for task attachments
 */

import { supabase } from '$lib/supabase'
import type { TaskAttachment, TaskAttachmentCreate } from '$lib/types/domain/task'

// Map database row to TaskAttachment type (camelCase conversion)
function mapAttachmentFromDb(row: any): TaskAttachment {
  return {
    id: row.id,
    taskId: row.task_id,
    fileName: row.file_name,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    storageUrl: row.storage_url,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
    // Uploader data populated from join (optional)
    uploader: row.users ? {
      id: row.users.id,
      name: row.users.display_name || row.users.email,
    } : undefined,
  }
}

export const taskAttachmentService = {
  /**
   * List all attachments for a task
   * RLS policies automatically filter by team membership (via parent task)
   * Joins with users table to get uploader info
   */
  async list(taskId: string): Promise<TaskAttachment[]> {
    const { data, error } = await supabase
      .from('task_attachments')
      .select(`
        *,
        users:uploaded_by (
          id,
          display_name,
          email
        )
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapAttachmentFromDb)
  },

  /**
   * Get a single attachment by ID
   */
  async get(attachmentId: string): Promise<TaskAttachment> {
    const { data, error } = await supabase
      .from('task_attachments')
      .select(`
        *,
        users:uploaded_by (
          id,
          display_name,
          email
        )
      `)
      .eq('id', attachmentId)
      .single()

    if (error) throw error
    return mapAttachmentFromDb(data)
  },

  /**
   * Upload a file and create attachment record
   * Files are stored in Cloudflare R2 via Supabase Storage
   * Storage path: task-attachments/{teamId}/{taskId}/{timestamp}-{filename}
   */
  async upload(taskId: string, file: File): Promise<TaskAttachment> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get task to determine team_id for storage path
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('team_id')
      .eq('id', taskId)
      .single()

    if (taskError) throw taskError
    if (!task) throw new Error('Task not found')

    // Validate file size (max 25MB)
    const maxSize = 26214400 // 25MB in bytes
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum of 25MB (${Math.round(file.size / 1048576)}MB provided)`)
    }

    // Create storage path with timestamp to avoid collisions
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${task.team_id}/${taskId}/${timestamp}-${sanitizedFileName}`

    // Upload file to Supabase Storage (task-attachments bucket)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(storagePath)

    // Create attachment record in database
    const input: TaskAttachmentCreate = {
      taskId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      storageUrl: publicUrl,
    }

    const { data, error } = await supabase
      .from('task_attachments')
      .insert({
        task_id: input.taskId,
        file_name: input.fileName,
        file_size: input.fileSize,
        mime_type: input.mimeType,
        storage_url: input.storageUrl,
        uploaded_by: user.id,
      })
      .select(`
        *,
        users:uploaded_by (
          id,
          display_name,
          email
        )
      `)
      .single()

    if (error) {
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('task-attachments')
        .remove([storagePath])
      
      throw error
    }

    return mapAttachmentFromDb(data)
  },

  /**
   * Delete an attachment (removes both database record and file)
   */
  async delete(attachmentId: string): Promise<void> {
    // Get attachment to find storage path
    const attachment = await this.get(attachmentId)

    // Extract storage path from storage URL
    // URL format: https://.../storage/v1/object/public/task-attachments/{path}
    const urlParts = attachment.storageUrl.split('/task-attachments/')
    const storagePath = urlParts.length > 1 ? urlParts[1] : null

    // Delete database record (RLS policies check permissions)
    const { error: dbError } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', attachmentId)

    if (dbError) throw dbError

    // Delete file from storage if path was extracted
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('task-attachments')
        .remove([storagePath])

      // Log storage error but don't throw (DB record already deleted)
      if (storageError) {
        console.error('Failed to delete file from storage:', storageError)
      }
    }
  },

  /**
   * Generate a signed URL for downloading an attachment
   * Signed URLs expire after 1 hour for security
   * Note: This is optional if using public URLs, but provides better security
   */
  async getSignedUrl(attachmentId: string): Promise<string> {
    const attachment = await this.get(attachmentId)

    // Extract storage path from storage URL
    const urlParts = attachment.storageUrl.split('/task-attachments/')
    const storagePath = urlParts.length > 1 ? urlParts[1] : null

    if (!storagePath) {
      // Fall back to public URL if path extraction fails
      return attachment.storageUrl
    }

    // Create signed URL (expires in 1 hour = 3600 seconds)
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .createSignedUrl(storagePath, 3600)

    if (error) {
      console.error('Failed to create signed URL:', error)
      // Fall back to public URL
      return attachment.storageUrl
    }

    return data.signedUrl
  },

  /**
   * Check if attachment is an image (for inline preview)
   */
  isImage(attachment: TaskAttachment): boolean {
    const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    return imageMimeTypes.includes(attachment.mimeType.toLowerCase())
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  },
}

