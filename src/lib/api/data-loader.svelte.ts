/**
 * Reactive data loader with caching using Svelte 5 runes
 * This file uses .svelte.ts extension to enable runes
 */

/**
 * Reactive data loader with caching
 */
export class ReactiveDataLoader<T> {
  private _data = $state<T | null>(null)
  private _loading = $state(false)
  private _error = $state<string | null>(null)
  private _lastFetch = 0
  private cacheDuration: number

  constructor(cacheDuration = 5 * 60 * 1000) { // 5 minutes default
    this.cacheDuration = cacheDuration
  }

  get data() {
    return this._data
  }

  get loading() {
    return this._loading
  }

  get error() {
    return this._error
  }

  get isStale() {
    return Date.now() - this._lastFetch > this.cacheDuration
  }

  async load(fetcher: () => Promise<T>, forceRefresh = false): Promise<T | null> {
    // Return cached data if not stale and not forcing refresh
    if (this._data && !this.isStale && !forceRefresh) {
      return this._data
    }

    this._loading = true
    this._error = null

    try {
      const result = await fetcher()
      this._data = result
      this._lastFetch = Date.now()
      return result
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to load data'
      console.error('Data loading failed:', error)
      return null
    } finally {
      this._loading = false
    }
  }

  invalidate() {
    this._lastFetch = 0
  }

  reset() {
    this._data = null
    this._loading = false
    this._error = null
    this._lastFetch = 0
  }
}

/**
 * Loading state management for API calls using runes
 */
export class ReactiveLoadingState {
  private _loading = $state(false)
  private _error = $state<string | null>(null)

  get loading() {
    return this._loading
  }

  get error() {
    return this._error
  }

  async execute<T>(apiCall: () => Promise<T>): Promise<T | null> {
    this._loading = true
    this._error = null

    try {
      const result = await apiCall()
      return result
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'An error occurred'
      console.error('API call failed:', error)
      return null
    } finally {
      this._loading = false
    }
  }

  reset() {
    this._loading = false
    this._error = null
  }
}