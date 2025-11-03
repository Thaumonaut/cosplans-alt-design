/**
 * Attachment Service
 * 
 * Handles file uploads to Cloudflare R2 and attachment metadata management.
 */

import { BaseService, type ServiceResponse } from './supabase';
import type { TaskAttachment, TaskAttachmentInsert } from '$lib/types/tasks';
import { TaskAttachmentInsertSchema } from '$lib/schemas/tasks';

export class AttachmentService extends BaseService {
	/**
	 * Get all attachments for a task
	 */
	async getAttachments(taskId: string): Promise<ServiceResponse<TaskAttachment[]>> {
		return this.execute(async () => {
			return await this.client
				.from('task_attachments')
				.select(`
					*,
					uploader:users!task_attachments_uploaded_by_fkey(
						id,
						email,
						first_name,
						last_name
					)
				`)
				.eq('task_id', taskId)
				.order('created_at', { ascending: false });
		});
	}

	/**
	 * Upload a file to Cloudflare R2 storage
	 */
	async uploadFile(
		file: File,
		taskId: string,
		userId: string
	): Promise<ServiceResponse<TaskAttachment>> {
		try {
			// Generate unique file path
			const timestamp = Date.now();
			const sanitized FileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
			const storageKey = `tasks/${taskId}/${timestamp}_${sanitizedFileName}`;

			// Upload to storage bucket
			const { data: uploadData, error: uploadError } = await this.client.storage
				.from('task-attachments')
				.upload(storageKey, file, {
					cacheControl: '3600',
					upsert: false,
				});

			if (uploadError) {
				return { error: { code: 'UPLOAD_ERROR', message: uploadError.message } };
			}

			// Get public URL
			const { data: { publicUrl } } = this.client.storage
				.from('task-attachments')
				.getPublicUrl(storageKey);

			// Create attachment record
			const attachmentData: TaskAttachmentInsert = {
				task_id: taskId,
				file_name: file.name,
				file_size: file.size,
				mime_type: file.type,
				storage_url: publicUrl,
				uploaded_by: userId,
			};

			const validated = TaskAttachmentInsertSchema.parse(attachmentData);

			return await this.execute(async () => {
				return await this.client
					.from('task_attachments')
					.insert(validated)
					.select(`
						*,
						uploader:users!task_attachments_uploaded_by_fkey(
							id,
							email,
							first_name,
							last_name
						)
					`)
					.single();
			});
		} catch (error: any) {
			return { error: { code: 'UPLOAD_ERROR', message: error.message } };
		}
	}

	/**
	 * Delete an attachment (removes from storage and database)
	 */
	async deleteAttachment(id: string): Promise<ServiceResponse<void>> {
		return this.execute(async () => {
			// Get attachment details first
			const { data: attachment, error: fetchError } = await this.client
				.from('task_attachments')
				.select('storage_url')
				.eq('id', id)
				.single();

			if (fetchError) return { data: null, error: fetchError };

			// Extract storage path from URL
			const url = new URL(attachment.storage_url);
			const pathParts = url.pathname.split('/');
			const storageKey = pathParts.slice(pathParts.indexOf('task-attachments') + 1).join('/');

			// Delete from storage
			await this.client.storage
				.from('task-attachments')
				.remove([storageKey]);

			// Delete from database
			const { error } = await this.client
				.from('task_attachments')
				.delete()
				.eq('id', id);

			return { data: null, error };
		});
	}

	/**
	 * Get signed URL for secure download (alternative to public URL)
	 */
	async getSignedDownloadUrl(
		attachmentId: string,
		expiresIn: number = 3600
	): Promise<ServiceResponse<string>> {
		return this.execute(async () => {
			// Get attachment details
			const { data: attachment, error: fetchError } = await this.client
				.from('task_attachments')
				.select('storage_url')
				.eq('id', attachmentId)
				.single();

			if (fetchError) return { data: null, error: fetchError };

			// Extract storage path
			const url = new URL(attachment.storage_url);
			const pathParts = url.pathname.split('/');
			const storageKey = pathParts.slice(pathParts.indexOf('task-attachments') + 1).join('/');

			// Generate signed URL
			const { data, error } = await this.client.storage
				.from('task-attachments')
				.createSignedUrl(storageKey, expiresIn);

			return { data: data?.signedUrl || null, error };
		});
	}

	/**
	 * Get total storage size for a task
	 */
	async getTaskStorageSize(taskId: string): Promise<ServiceResponse<number>> {
		return this.execute(async () => {
			const { data, error } = await this.client
				.from('task_attachments')
				.select('file_size')
				.eq('task_id', taskId);

			if (error) return { data: null, error };

			const totalSize = data.reduce((sum, att) => sum + (att.file_size || 0), 0);
			return { data: totalSize, error: null };
		});
	}

	/**
	 * Validate file before upload
	 */
	validateFile(file: File): { valid: boolean; error?: string } {
		const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
		const ALLOWED_TYPES = [
			'image/jpeg',
			'image/png',
			'image/gif',
			'image/webp',
			'application/pdf',
			'application/zip',
			'text/plain',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		];

		if (file.size > MAX_FILE_SIZE) {
			return { valid: false, error: 'File size exceeds 25MB limit' };
		}

		if (!ALLOWED_TYPES.includes(file.type)) {
			return { valid: false, error: 'File type not allowed' };
		}

		return { valid: true };
	}
}

