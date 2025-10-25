<script lang="ts">
  import InlineTextEditor from './inline-text-editor.svelte';
  import { Button, Badge } from '$lib/components/ui';
  import { Upload, Plus, X } from 'lucide-svelte';
  
  let characterName = $state('');
  let series = $state('');
  let description = $state('');
  let notes = $state('');
  let tags = $state<string[]>([]);
  let newTag = $state('');
  let difficulty = $state<'easy' | 'medium' | 'hard' | 'expert' | null>(null);
  
  function addTag() {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      tags = [...tags, newTag.trim()];
      newTag = '';
    }
  }
  
  function removeTag(tagToRemove: string) {
    tags = tags.filter((tag) => tag !== tagToRemove);
  }
  
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag();
    }
  }
</script>

<div class="space-y-8">
  <!-- Image Upload Section -->
  <div class="group relative aspect-[3/4] w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/50 hover:bg-muted/50">
    <button class="flex size-full flex-col items-center justify-center gap-3 text-muted-foreground transition-colors group-hover:text-foreground">
      <Upload class="size-12" />
      <div class="text-center">
        <p class="font-medium">Upload character reference</p>
        <p class="text-sm text-muted-foreground">Click or drag image here</p>
      </div>
    </button>
  </div>

  <!-- Character Name -->
  <div class="space-y-2">
    <label for="character-name" class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Character Name</label>
    <InlineTextEditor
      id="character-name"
      bind:value={characterName}
      placeholder="Enter character name..."
      variant="title"
    />
  </div>

  <!-- Series -->
  <div class="space-y-2">
    <label for="series" class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Series / Source</label>
    <InlineTextEditor
      id="series"
      bind:value={series}
      placeholder="What series is this character from?"
      variant="heading"
    />
  </div>

  <!-- Description -->
  <div class="space-y-2">
    <label for="description" class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</label>
    <InlineTextEditor
      id="description"
      bind:value={description}
      placeholder="Describe the character and their appearance..."
      variant="body"
      multiline
    />
  </div>

  <!-- Difficulty -->
  <fieldset class="space-y-3">
    <legend class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Difficulty Level</legend>
    <div class="flex gap-2">
      {#each ['easy', 'medium', 'hard', 'expert'] as level}
        <Button
          variant={difficulty === level ? 'default' : 'outline'}
          size="sm"
          onclick={() => difficulty = level}
          class="capitalize"
        >
          {level}
        </Button>
      {/each}
    </div>
  </fieldset>

  <!-- Tags -->
  <fieldset class="space-y-3">
    <legend class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tags</legend>
    <div class="flex flex-wrap gap-2">
      {#each tags as tag (tag)}
        <Badge variant="secondary" class="gap-1 pr-1">
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
          onkeydown={handleKeyDown}
          placeholder="Add tag..."
          class="h-7 w-32 rounded-md border bg-transparent px-2 text-sm outline-none focus:border-primary"
        />
        <Button size="icon" variant="ghost" onclick={addTag} class="size-7">
          <Plus class="size-4" />
        </Button>
      </div>
    </div>
  </fieldset>

  <!-- Notes -->
  <div class="space-y-2">
    <label for="notes" class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</label>
    <InlineTextEditor
      id="notes"
      bind:value={notes}
      placeholder="Add any additional notes, ideas, or references..."
      variant="body"
      multiline
    />
  </div>

  <!-- Action Buttons -->
  <div class="sticky bottom-0 -mx-6 -mb-6 flex gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <Button class="flex-1">Create Character</Button>
    <Button variant="outline" class="flex-1 bg-transparent">
      Save as Draft
    </Button>
  </div>
</div>