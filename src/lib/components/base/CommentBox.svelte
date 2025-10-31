<script lang="ts">
  import { onMount } from 'svelte'
  import { comments } from '$lib/stores/comments'
  import { Button } from '$lib/components/ui'
  import { Badge } from 'flowbite-svelte'
  import { Send, Edit, Trash2, User } from 'lucide-svelte'
  import { supabase } from '$lib/supabase'
  import type { Comment, CommentCreate } from '$lib/types/domain/comment'
  import type { CommentEntityType } from '$lib/types/domain/comment'

  interface Props {
    entityType: CommentEntityType
    entityId: string
    editable?: boolean
  }

  let { entityType, entityId, editable = true }: Props = $props()

  let commentText = $state('')
  let submitting = $state(false)
  let editingCommentId = $state<string | null>(null)
  let editingCommentText = $state('')

  let currentUser = $state<{ id: string; name?: string; avatarUrl?: string } | null>(null)

  onMount(async () => {
    // Load comments
    await comments.load(entityType, entityId)

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, avatar_url')
        .eq('id', user.id)
        .single()

      if (userData) {
        currentUser = {
          id: (userData as any).id as string,
          name: (userData as any).name || undefined,
          avatarUrl: (userData as any).avatar_url || undefined,
        }
      }
    }
  })

  async function handleSubmit() {
    if (!commentText.trim() || submitting) return

    submitting = true
    try {
      const comment: CommentCreate = {
        entityType,
        entityId,
        content: commentText.trim(),
      }
      await comments.create(comment)
      commentText = ''
    } catch (err: any) {
      console.error('Failed to create comment:', err)
    } finally {
      submitting = false
    }
  }

  function startEdit(comment: Comment) {
    editingCommentId = comment.id
    editingCommentText = comment.content
  }

  function cancelEdit() {
    editingCommentId = null
    editingCommentText = ''
  }

  async function handleUpdate() {
    if (!editingCommentId || !editingCommentText.trim()) return

    submitting = true
    try {
      await comments.update(editingCommentId, { content: editingCommentText.trim() })
      editingCommentId = null
      editingCommentText = ''
    } catch (err: any) {
      console.error('Failed to update comment:', err)
    } finally {
      submitting = false
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await comments.delete(commentId)
    } catch (err: any) {
      console.error('Failed to delete comment:', err)
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
</script>

<div class="space-y-4">
  <h3 class="text-lg font-semibold">Comments</h3>

  <!-- Comment Input -->
  {#if editable}
    <div class="space-y-2">
      <textarea
        bind:value={commentText}
        placeholder="Add a comment..."
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
        rows="3"
        onkeydown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit()
          }
        }}
      ></textarea>
      <div class="flex justify-end">
        <Button onclick={handleSubmit} disabled={!commentText.trim() || submitting} size="sm">
          <Send class="mr-2 size-4" />
          {submitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </div>
  {/if}

  <!-- Comments List -->
  {#if $comments.loading}
    <div class="flex items-center justify-center py-8">
      <div class="text-sm text-muted-foreground">Loading comments...</div>
    </div>
  {:else if $comments.items.length === 0}
    <div class="rounded-lg border border-dashed bg-muted/30 py-8 text-center">
      <p class="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each $comments.items as comment (comment.id)}
        <div class="rounded-lg border bg-card p-4">
          {#if editingCommentId === comment.id}
            <!-- Edit Mode -->
            <div class="space-y-2">
              <textarea
                bind:value={editingCommentText}
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                rows="3"
              ></textarea>
              <div class="flex gap-2">
                <Button onclick={handleUpdate} disabled={!editingCommentText.trim() || submitting} size="sm">
                  Save
                </Button>
                <Button variant="outline" onclick={cancelEdit} size="sm">Cancel</Button>
              </div>
            </div>
          {:else}
            <!-- Display Mode -->
            <div class="flex items-start gap-3">
              <!-- Avatar -->
              <div class="flex size-8 items-center justify-center rounded-full bg-muted">
                {#if comment.author?.avatarUrl}
                  <img src={comment.author.avatarUrl} alt={comment.author.name || 'User'} class="size-8 rounded-full" />
                {:else}
                  <User class="size-4 text-muted-foreground" />
                {/if}
              </div>

              <!-- Content -->
              <div class="flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">
                    {comment.author?.name || 'Unknown User'}
                  </span>
                  <span class="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                  {#if comment.updatedAt !== comment.createdAt}
                    <Badge class="bg-muted text-muted-foreground text-xs">edited</Badge>
                  {/if}
                </div>
                <p class="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
              </div>

              <!-- Actions -->
              {#if currentUser && comment.userId === currentUser.id && editable}
                <div class="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onclick={() => startEdit(comment)}
                    class="text-muted-foreground hover:text-foreground"
                  >
                    <Edit class="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onclick={() => handleDelete(comment.id)}
                    class="text-destructive hover:text-destructive"
                  >
                    <Trash2 class="size-3" />
                  </Button>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

