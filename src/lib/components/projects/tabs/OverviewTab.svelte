<script lang="ts">
  import { Card } from 'flowbite-svelte'
  import { Calendar, DollarSign } from 'lucide-svelte'
  import InlineTextEditor from '$lib/components/base/InlineTextEditor.svelte'
  import InlineNumberEditor from '$lib/components/base/InlineNumberEditor.svelte'
  import { DatePicker } from '$lib/components/ui'
  import type { Project, ProjectUpdate } from '$lib/types/domain/project'

  interface Props {
    project: Project
    onUpdate: (updates: ProjectUpdate) => Promise<void>
  }

  let { project, onUpdate }: Props = $props()

  async function handleFieldUpdate(field: keyof ProjectUpdate, value: any) {
    try {
      await onUpdate({ [field]: value })
    } catch (err) {
      console.error(`Failed to update ${field}:`, err)
    }
  }
</script>

<div class="space-y-6">
  <!-- Hero Image -->
  {#if project.coverImage}
    <div class="aspect-video overflow-hidden rounded-lg">
      <img src={project.coverImage} alt={project.character} class="size-full object-cover" />
    </div>
  {:else}
    <Card class="flex aspect-video items-center justify-center bg-muted">
      <p class="text-sm text-muted-foreground">No cover image</p>
    </Card>
  {/if}

  <!-- Project Details -->
  <div class="grid gap-6 lg:grid-cols-2">
    <div class="space-y-6">
      <!-- Character -->
      <Card class="p-6">
        <h3 class="mb-3 text-sm font-medium text-muted-foreground">Character</h3>
        <InlineTextEditor
          value={project.character}
          onSave={async (v: string) => handleFieldUpdate('character', v)}
          placeholder="Character name..."
        />
      </Card>

      <!-- Series -->
      <Card class="p-6">
        <h3 class="mb-3 text-sm font-medium text-muted-foreground">Series</h3>
        <InlineTextEditor
          value={project.series || undefined}
          onSave={async (v: string) => handleFieldUpdate('series', v)}
          placeholder="Series name..."
        />
      </Card>

      <!-- Description -->
      <Card class="p-6">
        <h3 class="mb-3 text-sm font-medium text-muted-foreground">Description</h3>
        <InlineTextEditor
          value={project.description || ''}
          onSave={async (v: string) => handleFieldUpdate('description', v)}
          multiline
          placeholder="Add a description..."
        />
      </Card>
    </div>

    <div class="space-y-6">
      <!-- Budget -->
      <Card class="p-6">
        <div class="mb-4 flex items-center gap-2">
          <DollarSign class="size-5 text-muted-foreground" />
          <h3 class="text-sm font-medium text-muted-foreground">Estimated Budget</h3>
        </div>
        <InlineNumberEditor
          value={project.estimatedBudget || 0}
          onSave={async (v: number) => handleFieldUpdate('estimatedBudget', v)}
          placeholder="$0.00"
          min={0}
        />
        <div class="mt-4 border-t pt-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Spent so far</span>
            <span class="font-semibold">${(project.spentBudget / 100).toFixed(2)}</span>
          </div>
          {#if project.estimatedBudget && project.spentBudget > project.estimatedBudget}
            <p class="mt-2 text-sm text-red-600">Over budget!</p>
          {/if}
        </div>
      </Card>

      <!-- Deadline -->
      <Card class="p-6">
        <div class="mb-4 flex items-center gap-2">
          <Calendar class="size-5 text-muted-foreground" />
          <h3 class="text-sm font-medium text-muted-foreground">Deadline</h3>
        </div>
        <DatePicker
          value={project.deadline || null}
          onchange={async (v) => handleFieldUpdate('deadline', v || null)}
          placeholder="Select deadline"
          class="w-full"
        />
        {#if project.deadline}
          <p class="mt-2 text-sm text-muted-foreground">
            {(() => {
              const days = Math.ceil(
                (new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )
              if (days < 0) return `${Math.abs(days)} days overdue`
              if (days === 0) return 'Due today'
              return `${days} days remaining`
            })()}
          </p>
        {/if}
      </Card>

      <!-- Tags -->
      <Card class="p-6">
        <h3 class="mb-3 text-sm font-medium text-muted-foreground">Tags</h3>
        <div class="flex flex-wrap gap-2">
          {#each project.tags as tag}
            <span class="rounded-full bg-muted px-3 py-1 text-sm">{tag}</span>
          {/each}
          {#if project.tags.length === 0}
            <p class="text-sm text-muted-foreground">No tags yet</p>
          {/if}
        </div>
      </Card>
    </div>
  </div>
</div>

