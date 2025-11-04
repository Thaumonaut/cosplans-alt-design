<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import type { TaskAttachment } from '$lib/types/tasks';
	import { AttachmentService } from '$lib/services/attachment-service';
	import { supabase } from '$lib/supabase';
	import { Button } from '$lib/components/ui';
	import { 
		Upload, 
		File, 
		FileText, 
		FileImage, 
		FileArchive, 
		Download, 
		Trash2, 
		Loader2,
		AlertCircle
	} from 'lucide-svelte';
	
	// Service instance
	const attachmentService = new AttachmentService();
	
	// Get current user ID
	let currentUserId = $state<string | null>(null);
	$effect(() => {
		supabase.auth.getUser().then(({ data: { user } }) => {
			if (user) {
				currentUserId = user.id;
			}
		});
	});

	// Props
	let {
		taskId,
		attachments = $bindable<TaskAttachment[]>([]),
		onAdd = (attachment: TaskAttachment) => {},
		onDelete = (attachmentId: string) => {}
	}: {
		taskId: string;
		attachments: TaskAttachment[];
		onAdd?: (attachment: TaskAttachment) => void;
		onDelete?: (attachmentId: string) => void;
	} = $props();

	// Local state
	let isUploading = $state(false);
	let uploadProgress = $state(0);
	let error = $state<string | null>(null);
	let deletingId = $state<string | null>(null);
	let dragOver = $state(false);
	let fileInputRef = $state<HTMLInputElement | null>(null);

	// Maximum file size (25MB as per spec)
	const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

	// Supported MIME types
	const SUPPORTED_TYPES = [
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'text/plain',
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'application/zip',
		'application/x-zip-compressed'
	];

	// Upload file
	async function uploadFile(file: File) {
		// Validate file size
		if (file.size > MAX_FILE_SIZE) {
			error = `File "${file.name}" exceeds maximum size of 25MB`;
			return;
		}

		// Validate file type
		if (!SUPPORTED_TYPES.includes(file.type)) {
			error = `File type "${file.type}" is not supported`;
			return;
		}

		if (!currentUserId) {
			error = 'User not authenticated';
			return;
		}

		isUploading = true;
		uploadProgress = 0;
		error = null;

		try {
			const response = await attachmentService.uploadFile(file, taskId, currentUserId);
			if (response.error) {
				throw new Error(response.error.message || 'Failed to upload file');
			}
			
			if (response.data) {
				attachments = [response.data, ...attachments];
				onAdd(response.data);
			}
			uploadProgress = 0;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to upload file';
			console.error('Error uploading file:', err);
		} finally {
			isUploading = false;
		}
	}

	// Handle file selection
	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input.files;

		if (files && files.length > 0) {
			// Upload files sequentially
			for (let i = 0; i < files.length; i++) {
				await uploadFile(files[i]);
			}
		}

		// Reset input
		if (fileInputRef) {
			fileInputRef.value = '';
		}
	}

	// Handle drag-and-drop
	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'copy';
		}
	}

	function handleDragLeave() {
		dragOver = false;
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			// Upload files sequentially
			for (let i = 0; i < files.length; i++) {
				await uploadFile(files[i]);
			}
		}
	}

	// Delete attachment
	async function deleteAttachment(attachmentId: string) {
		const previousAttachments = [...attachments];
		
		// Optimistic delete
		attachments = attachments.filter(a => a.id !== attachmentId);
		onDelete(attachmentId);

		deletingId = attachmentId;
		error = null;

		try {
			const response = await attachmentService.deleteAttachment(attachmentId);
			if (response.error) {
				throw new Error(response.error.message || 'Failed to delete attachment');
			}
		} catch (err) {
			// Rollback on error
			attachments = previousAttachments;
			error = err instanceof Error ? err.message : 'Failed to delete attachment';
			console.error('Error deleting attachment:', err);
		} finally {
			deletingId = null;
		}
	}

	// Download attachment
	async function downloadAttachment(attachment: TaskAttachment) {
		try {
			const response = await attachmentService.getSignedDownloadUrl(attachment.id);
			if (response.error) {
				throw new Error(response.error.message || 'Failed to get download URL');
			}
			if (response.data) {
				window.open(response.data, '_blank');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to download file';
			console.error('Error downloading file:', err);
		}
	}

	// Get file icon based on MIME type
	function getFileIcon(mimeType: string) {
		if (mimeType.startsWith('image/')) return FileImage;
		if (mimeType === 'application/pdf') return FileText;
		if (mimeType.includes('word') || mimeType.includes('document')) return FileText;
		if (mimeType.includes('zip') || mimeType.includes('compressed')) return FileArchive;
		return File;
	}

	// Format file size
	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}
</script>

<!-- Attachment List -->
<div class="space-y-3">
	<!-- Error Message -->
	{#if error}
		<div
			class="rounded-md bg-red-50 p-3 text-sm text-red-800"
			transition:fade={{ duration: 200 }}
		>
			<div class="flex items-start space-x-2">
				<AlertCircle class="mt-0.5 h-4 w-4 flex-shrink-0" />
				<span>{error}</span>
			</div>
		</div>
	{/if}

	<!-- Upload Area -->
	<div
		class="relative rounded-md border-2 border-dashed border-gray-300 p-6 transition-colors {dragOver ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}"
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		on:drop={handleDrop}
	>
		<input
			bind:this={fileInputRef}
			type="file"
			multiple
			accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.zip"
			class="hidden"
			on:change={handleFileSelect}
			disabled={isUploading}
		/>

		{#if isUploading}
			<!-- Upload Progress -->
			<div class="text-center">
				<Loader2 class="mx-auto h-8 w-8 animate-spin text-blue-600" />
				<p class="mt-2 text-sm text-gray-600">Uploading...</p>
				<div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
					<div
						class="h-full bg-blue-600 transition-all duration-300"
						style="width: {uploadProgress}%"
					></div>
				</div>
				<p class="mt-1 text-xs text-gray-500">{uploadProgress}%</p>
			</div>
		{:else}
			<!-- Upload Prompt -->
			<div class="text-center">
				<Upload class="mx-auto h-8 w-8 text-gray-400" />
				<p class="mt-2 text-sm text-gray-600">
					<button
						class="font-medium text-blue-600 hover:text-blue-500"
						on:click={() => fileInputRef?.click()}
					>
						Click to upload
					</button>
					or drag and drop
				</p>
				<p class="mt-1 text-xs text-gray-500">
					PDF, DOC, TXT, images, or ZIP files (max 25MB)
				</p>
			</div>
		{/if}
	</div>

	<!-- Attachments List -->
	{#if attachments.length > 0}
		<div class="space-y-2">
			{#each attachments as attachment (attachment.id)}
				<div
					class="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50"
					transition:slide={{ duration: 200 }}
				>
					<div class="flex min-w-0 flex-1 items-center space-x-3">
						<!-- File Icon -->
						<div class="flex-shrink-0 text-gray-400">
							<svelte:component this={getFileIcon(attachment.mimeType)} class="h-5 w-5" />
						</div>

						<!-- File Info -->
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-medium text-gray-900">
								{attachment.fileName}
							</p>
							<p class="text-xs text-gray-500">
								{formatFileSize(attachment.fileSize)}
								{#if attachment.uploader}
									· Uploaded by {attachment.uploader.name}
								{/if}
							</p>
						</div>
					</div>

					<!-- Actions -->
					<div class="flex items-center space-x-2">
						<Button
							variant="ghost"
							size="icon"
							on:click={() => downloadAttachment(attachment)}
							title="Download"
						>
							<Download class="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							class="text-gray-400 hover:text-red-600"
							on:click={() => deleteAttachment(attachment.id)}
							disabled={deletingId === attachment.id}
							title="Delete"
						>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-md border border-dashed border-gray-300 p-6 text-center">
			<File class="mx-auto h-8 w-8 text-gray-400" />
			<p class="mt-2 text-sm text-gray-500">No attachments yet</p>
		</div>
	{/if}
</div>

<style>
	/* Drag-over animation */
	[class*='border-blue-500'] {
		animation: pulse 1s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.8;
		}
	}
</style>

