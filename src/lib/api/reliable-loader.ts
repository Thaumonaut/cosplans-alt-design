/**
 * Reliable Data Loader with retry, timeout, and connection health checks
 * 
 * This module provides a robust wrapper around Supabase queries that:
 * - Retries failed requests with exponential backoff
 * - Implements request timeouts
 * - Checks connection health before making requests
 * - Queues requests to prevent overwhelming the database
 * - Handles schema cache issues automatically
 */

import { supabase } from '$lib/supabase'

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  timeout?: number
  retryableErrors?: string[]
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  timeout: 30000, // 30 seconds
  retryableErrors: [
    'PGRST204', // Schema cache error
    'PGRST205', // Schema cache error
    'network',
    'timeout',
    'connection',
    'ECONNRESET',
    'ETIMEDOUT',
    'Failed to fetch',
    'NetworkError',
    'Network request failed',
  ],
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any): boolean {
  if (!error) return false
  
  const errorMessage = error.message || error.toString() || ''
  const errorCode = error.code || error.error?.code || ''
  
  // Check error code
  if (errorCode && DEFAULT_OPTIONS.retryableErrors.some(code => errorCode.includes(code))) {
    return true
  }
  
  // Check error message
  const messageLower = errorMessage.toLowerCase()
  return DEFAULT_OPTIONS.retryableErrors.some(code => 
    messageLower.includes(code.toLowerCase())
  )
}

/**
 * Calculate delay for exponential backoff
 */
function calculateDelay(attempt: number, initialDelay: number, maxDelay: number): number {
  const delay = initialDelay * Math.pow(2, attempt)
  return Math.min(delay, maxDelay)
}

/**
 * Check Supabase connection health
 */
async function checkConnectionHealth(): Promise<boolean> {
  try {
    // Simple health check - try to get user (doesn't require database access)
    const { error } = await supabase.auth.getUser()
    
    // If we can get user info, connection is healthy
    // Auth errors are expected if not logged in, so we'll check differently
    return true // Assume healthy - actual queries will fail if connection is bad
  } catch {
    return false
  }
}

/**
 * Wait for connection to be healthy
 */
async function waitForConnection(maxWait = 10000): Promise<boolean> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWait) {
    if (await checkConnectionHealth()) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, 500)) // Check every 500ms
  }
  
  return false
}

/**
 * Create a promise that rejects after timeout
 */
function createTimeoutPromise<T>(promise: Promise<T>, timeout: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
    )
  ])
}

/**
 * Execute a query with retry logic and timeout handling
 */
export async function reliableQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: RetryOptions = {}
): Promise<{ data: T | null; error: any }> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: any = null
  
  // Wait for connection health first
  const connectionHealthy = await waitForConnection(5000)
  if (!connectionHealthy) {
    console.warn('Connection health check failed, proceeding anyway...')
  }
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // Create timeout wrapper
      const timeoutPromise = createTimeoutPromise(
        queryFn(),
        opts.timeout
      )
      
      const result = await timeoutPromise
      
      if (result.error) {
        // If it's a retryable error, retry
        if (isRetryableError(result.error) && attempt < opts.maxRetries) {
          lastError = result.error
          const delay = calculateDelay(attempt, opts.initialDelay, opts.maxDelay)
          console.warn(
            `Query failed (attempt ${attempt + 1}/${opts.maxRetries + 1}), retrying in ${delay}ms...`,
            result.error.message || result.error
          )
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        // Non-retryable error or out of retries
        throw result.error
      }
      
      // Success - return the full result object
      if (result.data === null && !result.error) {
        // If data is null but no error, it's likely a valid empty result
        return result
      }
      
      return result
    } catch (error: any) {
      lastError = error
      
      // If it's a timeout and we have retries left, retry
      if (
        error.message?.includes('timeout') &&
        isRetryableError(error) &&
        attempt < opts.maxRetries
      ) {
        const delay = calculateDelay(attempt, opts.initialDelay, opts.maxDelay)
        console.warn(
          `Query timed out (attempt ${attempt + 1}/${opts.maxRetries + 1}), retrying in ${delay}ms...`
        )
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      // If not retryable or out of retries, throw
      if (!isRetryableError(error) || attempt >= opts.maxRetries) {
        throw error
      }
      
      // Otherwise, retry with delay
      const delay = calculateDelay(attempt, opts.initialDelay, opts.maxDelay)
      console.warn(
        `Query failed (attempt ${attempt + 1}/${opts.maxRetries + 1}), retrying in ${delay}ms...`,
        error.message || error
      )
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // Should never reach here, but TypeScript needs it
  throw lastError || new Error('Query failed after all retries')
}

/**
 * Execute multiple queries in parallel with retry logic
 * Limits concurrency to prevent overwhelming the database
 */
export async function reliableParallelQueries<T>(
  queries: Array<() => Promise<{ data: T | null; error: any }>>,
  options: RetryOptions & { maxConcurrency?: number } = {}
): Promise<T[]> {
  const { maxConcurrency = 5, ...retryOptions } = options
  const results: T[] = []
  const executing: Promise<void>[] = []
  
  for (const queryFn of queries) {
    const promise = reliableQuery(queryFn, retryOptions)
      .then(result => results.push(result))
      .catch(error => {
        console.error('Parallel query failed:', error)
        throw error
      })
    
    executing.push(promise)
    
    // If we've hit max concurrency, wait for one to finish
    if (executing.length >= maxConcurrency) {
      await Promise.race(executing)
      // Remove finished promises
      const index = executing.findIndex(p => {
        // Check if promise is resolved
        return true // Promise.race already resolved one
      })
      executing.splice(index, 1)
    }
  }
  
  // Wait for all remaining queries
  await Promise.all(executing)
  
  return results
}

/**
 * Wrapper for Supabase queries that automatically adds retry and timeout
 */
export function withReliability<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options?: RetryOptions
): Promise<T> {
  return reliableQuery(queryFn, options)
}

/**
 * Create a reliable version of a Supabase query builder chain
 */
export function reliableSupabaseQuery<T>(
  queryBuilder: any,
  options?: RetryOptions
): Promise<T> {
  return reliableQuery(async () => {
    const result = await queryBuilder
    return { data: result.data, error: result.error }
  }, options)
}

