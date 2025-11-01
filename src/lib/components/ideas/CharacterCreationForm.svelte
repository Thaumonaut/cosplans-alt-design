<script lang="ts">
  import InlineTextEditor from '$lib/components/base/InlineTextEditor.svelte'
  import { Button } from '$lib/components/ui'
  import { Badge } from 'flowbite-svelte'
  import { Upload, Plus, X } from 'lucide-svelte'

  interface Props {
    onSave?: (data: {
      character: string
      series: string
      description?: string
      notes?: string
      tags: string[]
      difficulty: 'easy' | 'medium' | 'hard' | 'expert' | null
    }) => Promise<void> | void
    saving?: boolean
  }

  let { onSave, saving = false }: Props = $props()

  let characterName = $state('')
  let series = $state('')
  let description = $state('')
  let notes = $state('')
  let tags = $state<string[]>([])
  let newTag = $state('')
  let difficulty = $state<'easy' | 'medium' | 'hard' | 'expert' | null>(null)

  function addTag() {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      tags = [...tags, newTag.trim()]
      newTag = ''
    }
  }

  function removeTag(tagToRemove: string) {
    tags = tags.filter((tag) => tag !== tagToRemove)
  }
</script>

<div class="space-y-8">
  <!-- Image Upload Section -->
  <div
    role="button"
    tabindex="0"
    class="group relative aspect-[3/4] max-h-64 w-full overflow-hidden rounded-xl border-2 border-dashed border-[var(--theme-border)] bg-[var(--theme-section-bg)] transition-colors hover:border-[var(--theme-primary)]/50 hover:bg-[var(--theme-card-bg)]"
  >
    <button
      class="flex size-full flex-col items-center justify-center gap-3 text-[var(--theme-sidebar-muted)] transition-colors group-hover:text-[var(--theme-foreground)]"
    >
      <Upload class="size-8" />
      <div class="text-center">
        <p class="text-sm font-medium">Upload character reference</p>
        <p class="text-xs text-[var(--theme-sidebar-muted)]">Click or drag image here</p>
      </div>
    </button>
  </div>

  <!-- Character Name -->
  <div class="space-y-2">
    <label class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >Character Name</label
    >
    <InlineTextEditor bind:value={characterName} placeholder="Enter character name..." variant="title" />
  </div>

  <!-- Series -->
  <div class="space-y-2">
    <label class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >Series / Source</label
    >
    <InlineTextEditor bind:value={series} placeholder="What series is this character from?" variant="heading" />
  </div>

  <!-- Description -->
  <div class="space-y-2">
    <label class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >Description</label
    >
    <InlineTextEditor
      bind:value={description}
      placeholder="Describe the character and their appearance..."
      variant="body"
      multiline={true}
    />
  </div>

  <!-- Difficulty -->
  <div class="space-y-3">
    <label class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >Difficulty Level</label
    >
    <div class="flex gap-2">
      {#each (['easy', 'medium', 'hard', 'expert'] as const) as level}
        <Button
          variant={difficulty === level ? 'default' : 'outline'}
          size="sm"
          onclick={() => (difficulty = level)}
          class="capitalize"
        >
          {level}
        </Button>
      {/each}
    </div>
  </div>

  <!-- Tags -->
  <div class="space-y-3">
    <label class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Tags</label>
    <div class="flex flex-wrap gap-2">
      {#each tags as tag}
        <Badge class="gap-1 pr-1 border">
          {tag}
          <button onclick={() => removeTag(tag)} class="ml-1 rounded-full p-0.5 hover:bg-background/50">
            <X class="size-3" />
          </button>
        </Badge>
      {/each}
      <div class="flex items-center gap-2">
        <input
          type="text"
          bind:value={newTag}
          onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder="Add tag..."
          class="h-7 w-32 rounded-md border bg-transparent px-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800"
        />
        <Button size="sm" variant="ghost" onclick={addTag} class="size-7 !p-0">
          <Plus class="size-4" />
        </Button>
      </div>
    </div>
  </div>

  <!-- Notes -->
  <div class="space-y-2">
    <label class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Notes</label>
    <InlineTextEditor
      bind:value={notes}
      placeholder="Add any additional notes, ideas, or references..."
      variant="body"
      multiline={true}
    />
  </div>

  <!-- Action Buttons -->
  <div
    class="sticky bottom-0 -mx-6 -mb-6 flex gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <Button
      class="flex-1"
      onclick={async () => {
        if (onSave) {
          await onSave({
            character: characterName,
            series,
            description: description || undefined,
            notes: notes || undefined,
            tags,
            difficulty,
          })
        }
      }}
      disabled={saving || !characterName || !series}
    >
      {saving ? 'Creating...' : 'Create Character'}
    </Button>
    <Button variant="outline" class="flex-1 bg-transparent" disabled={saving}>
      Save as Draft
    </Button>
  </div>
</div>
