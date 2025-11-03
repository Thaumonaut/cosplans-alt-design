/**
 * Supabase Client Wrapper for Task System
 * 
 * Provides typed Supabase client with helper methods for common operations.
 * This wrapper ensures consistent error handling and type safety across all services.
 */

import { createSupabaseLoadClient } from '$lib/auth/supabase-client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/supabase';

/**
 * Get typed Supabase client
 */
export function getSupabaseClient(fetch?: typeof globalThis.fetch): SupabaseClient<Database> {
	if (fetch) {
		return createSupabaseLoadClient(fetch);
	}
	// For client-side usage
	return createSupabaseLoadClient(globalThis.fetch);
}

/**
 * Standard error response format
 */
export interface ServiceError {
	code: string;
	message: string;
	details?: any;
}

/**
 * Standard service response format
 */
export interface ServiceResponse<T> {
	data?: T;
	error?: ServiceError;
}

/**
 * Helper to format Supabase errors
 */
export function formatError(error: any): ServiceError {
	if (error?.code && error?.message) {
		return {
			code: error.code,
			message: error.message,
			details: error.details || error.hint,
		};
	}
	
	return {
		code: 'UNKNOWN_ERROR',
		message: error?.message || 'An unknown error occurred',
		details: error,
	};
}

/**
 * Helper to create success response
 */
export function success<T>(data: T): ServiceResponse<T> {
	return { data };
}

/**
 * Helper to create error response
 */
export function failure(error: any): ServiceResponse<never> {
	return { error: formatError(error) };
}

/**
 * Base service class with common functionality
 */
export abstract class BaseService {
	protected client: SupabaseClient<Database>;

	constructor(client?: SupabaseClient<Database>) {
		this.client = client || getSupabaseClient();
	}

	/**
	 * Get current authenticated user ID
	 */
	protected async getCurrentUserId(): Promise<string | null> {
		const { data: { user } } = await this.client.auth.getUser();
		return user?.id || null;
	}

	/**
 * Ensure user is authenticated
	 */
	protected async requireAuth(): Promise<string> {
		const userId = await this.getCurrentUserId();
		if (!userId) {
			throw new Error('Authentication required');
		}
		return userId;
	}

	/**
	 * Execute query with error handling
	 */
	protected async execute<T>(
		operation: () => Promise<{ data: T | null; error: any }>
	): Promise<ServiceResponse<T>> {
		try {
			const { data, error } = await operation();
			if (error) return failure(error);
			if (data === null) return failure({ message: 'No data returned' });
			return success(data);
		} catch (error) {
			return failure(error);
		}
	}
}

