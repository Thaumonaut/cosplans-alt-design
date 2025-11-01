import { writable } from 'svelte/store'
import { commentService } from '$lib/api/services/commentService'
import type { Comment, CommentCreate, CommentUpdate } from '$lib/types/domain/comment'

interface CommentsState {
  items: Comment[]
  loading: boolean
  error: string | null
}

function createCommentsStore() {
  const { subscribe, set, update } = writable<CommentsState>({
    items: [],
    loading: false,
    error: null,
  })

  return {
    subscribe,
    reset: () => set({ items: [], loading: false, error: null }),

    load: async (entityType: string, entityId: string) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const items = await commentService.list(entityType, entityId)
        set({ items, loading: false, error: null })
      } catch (err: any) {
        set({ items: [], loading: false, error: err?.message || 'Failed to load comments' })
      }
    },

    create: async (comment: CommentCreate) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const created = await commentService.create(comment)
        update((state) => ({
          ...state,
          items: [...state.items, created],
          loading: false,
          error: null,
        }))
        return created
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to create comment',
        }))
        throw err
      }
    },

    update: async (id: string, updates: CommentUpdate) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const updated = await commentService.update(id, updates)
        if (updated) {
          update((state) => ({
            ...state,
            items: state.items.map((c) => (c.id === id ? updated : c)),
            loading: false,
            error: null,
          }))
          return updated
        }
        update((state) => ({ ...state, loading: false }))
        return null
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to update comment',
        }))
        throw err
      }
    },

    delete: async (id: string) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        await commentService.delete(id)
        update((state) => ({
          ...state,
          items: state.items.filter((c) => c.id !== id),
          loading: false,
          error: null,
        }))
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to delete comment',
        }))
        throw err
      }
    },
  }
}

export const comments = createCommentsStore()

