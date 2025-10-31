<script lang="ts">
  import { onMount } from 'svelte'
  import { photoshootService } from '$lib/api/services/photoshootService'
  import { Button } from '$lib/components/ui'
  import { Badge } from 'flowbite-svelte'
  import { Plus, Check, X, ImageIcon } from 'lucide-svelte'
  import InlineTextEditor from '$lib/components/base/InlineTextEditor.svelte'
  import InlineCheckbox from '$lib/components/base/InlineCheckbox.svelte'
  import InlineImageUpload from '$lib/components/base/InlineImageUpload.svelte'
  import type { Shot, ShotCreate } from '$lib/types/domain/photoshoot'

  interface Props {
    photoshootId: string
    editable?: boolean
  }

  let { photoshootId, editable = true }: Props = $props()

  let shots = $state<Shot[]>([])
  let loading = $state(true)
  let error = $state<string | null>(null)
  let showNewShotForm = $state(false)
  let newShot: ShotCreate = $state({
    description: '',
    pose: '',
    referenceImage: undefined,
    orderIndex: 0,
  })

  onMount(async () => {
    await loadShots()
  })

  async function loadShots() {
    try {
      loading = true
      shots = await photoshootService.getShots(photoshootId)
    } catch (err: any) {
      error = err?.message || 'Failed to load shots'
      console.error('Failed to load shots:', err)
    } finally {
      loading = false
    }
  }

  async function handleCreateShot() {
    if (!newShot.description.trim()) {
      error = 'Description is required'
      return
    }

    try {
      const maxOrder = shots.length > 0 ? Math.max(...shots.map((s) => s.orderIndex)) : -1
      const created = await photoshootService.addShot(photoshootId, {
        ...newShot,
        orderIndex: maxOrder + 1,
      })
      shots = [...shots, created]
      newShot = { description: '', pose: '', referenceImage: undefined, orderIndex: 0 }
      showNewShotForm = false
      error = null
    } catch (err: any) {
      error = err?.message || 'Failed to create shot'
    }
  }

  async function handleUpdateShot(shotId: string, field: string, value: any) {
    try {
      const updated = await photoshootService.updateShot(shotId, { [field]: value })
      shots = shots.map((s) => (s.id === shotId ? updated : s))
    } catch (err: any) {
      error = err?.message || 'Failed to update shot'
    }
  }

  async function handleDeleteShot(shotId: string) {
    try {
      await photoshootService.deleteShot(shotId)
      shots = shots.filter((s) => s.id !== shotId)
    } catch (err: any) {
      error = err?.message || 'Failed to delete shot'
    }
  }

  const completionPercentage = $derived(() => {
    if (shots.length === 0) return 0
    const completed = shots.filter((s) => s.completed).length
    return Math.round((completed / shots.length) * 100)
  })
</script>

<div class="space-y-4">
  <!-- Header with Progress -->
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-lg font-semibold">Shot List</h3>
      <p class="text-sm text-muted-foreground">
        {shots.filter((s) => s.completed).length} of {shots.length} shots completed
      </p>
    </div>
    {#if editable}
      <Button
        size="sm"
        onclick={() => {
          showNewShotForm = !showNewShotForm
        }}
      >
        <Plus class="mr-2 size-4" />
        Add Shot
      </Button>
    {/if}
  </div>

  <!-- Progress Bar -->
  {#if shots.length > 0}
    <div class="space-y-2">
      <div class="flex items-center justify-between text-sm">
        <span class="text-muted-foreground">Progress</span>
        <span class="font-medium">{completionPercentage()}%</span>
      </div>
      <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          class="h-full bg-primary transition-all"
          style="width: {completionPercentage()}%"
        ></div>
      </div>
    </div>
  {/if}

  <!-- Error Message -->
  {#if error}
    <div class="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
  {/if}

  <!-- New Shot Form -->
  {#if showNewShotForm && editable}
    <div class="rounded-lg border bg-card p-4 space-y-4">
      <h4 class="font-medium">New Shot</h4>
      <div class="space-y-3">
        <div class="space-y-2">
          <label for="shot-description" class="text-sm font-medium">Description *</label>
          <textarea
            id="shot-description"
            bind:value={newShot.description}
            placeholder="Shot description..."
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            rows="2"
          ></textarea>
        </div>
        <div class="space-y-2">
          <label for="shot-pose" class="text-sm font-medium">Pose Notes</label>
          <textarea
            id="shot-pose"
            bind:value={newShot.pose}
            placeholder="Pose notes or reference..."
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            rows="2"
          ></textarea>
        </div>
      </div>
      <div class="flex gap-2">
        <Button onclick={handleCreateShot} disabled={!newShot.description.trim()}>
          Add Shot
        </Button>
        <Button
          variant="outline"
          onclick={() => {
            showNewShotForm = false
            newShot = { description: '', pose: '', referenceImage: undefined, orderIndex: 0 }
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  {/if}

  <!-- Loading State -->
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-sm text-muted-foreground">Loading shots...</div>
    </div>
  {:else if shots.length === 0}
    <!-- Empty State -->
    <div class="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16">
      <ImageIcon class="mb-4 size-12 text-muted-foreground opacity-50" />
      <h3 class="mb-2 text-lg font-semibold">No shots yet</h3>
      <p class="mb-6 text-center text-sm text-muted-foreground max-w-md">
        {#if editable}
          Create your first shot to plan your photoshoot.
        {:else}
          No shots have been added to this photoshoot.
        {/if}
      </p>
      {#if editable}
        <Button
          onclick={() => {
            showNewShotForm = true
          }}
        >
          <Plus class="mr-2 size-4" />
          Add First Shot
        </Button>
      {/if}
    </div>
  {:else}
    <!-- Shots List -->
    <div class="space-y-3">
      {#each shots as shot (shot.id)}
        <div class="rounded-lg border bg-card p-4">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 space-y-3">
              <!-- Checkbox and Description -->
              <div class="flex items-start gap-3">
                {#if editable}
                  <InlineCheckbox
                    checked={shot.completed}
                    editable={true}
                    onSave={async (v: boolean) => {
                      await handleUpdateShot(shot.id, 'completed', v)
                    }}
                  />
                {:else}
                  {#if shot.completed}
                    <div class="mt-1 flex size-5 items-center justify-center rounded border-2 border-primary bg-primary">
                      <Check class="size-3 text-primary-foreground" />
                    </div>
                  {:else}
                    <div class="mt-1 size-5 rounded border-2 border-muted-foreground/30"></div>
                  {/if}
                {/if}
                <div class="flex-1">
                  <InlineTextEditor
                    value={shot.description}
                    editable={editable && !shot.completed}
                    onSave={async (v: string) => {
                      await handleUpdateShot(shot.id, 'description', v)
                    }}
                    placeholder="Shot description..."
                    className={shot.completed ? 'line-through opacity-60' : ''}
                  />
                </div>
              </div>

              <!-- Pose Notes -->
              {#if shot.pose || editable}
                <div class="ml-8">
                  <InlineTextEditor
                    value={shot.pose || ''}
                    editable={editable && !shot.completed}
                    onSave={async (v: string) => {
                      await handleUpdateShot(shot.id, 'pose', v || undefined)
                    }}
                    placeholder="Pose notes..."
                    multiline={true}
                    className="text-sm text-muted-foreground"
                  />
                </div>
              {/if}

              <!-- Reference Image -->
              {#if shot.referenceImage || editable}
                <div class="ml-8">
                  {#if shot.referenceImage}
                    <img
                      src={shot.referenceImage}
                      alt="Reference"
                      class="mt-2 max-h-32 rounded border object-cover"
                    />
                  {/if}
                  {#if editable && !shot.completed}
                    <InlineImageUpload
                      images={shot.referenceImage ? [shot.referenceImage] : []}
                      editable={true}
                      onSave={async (v: string[]) => {
                        await handleUpdateShot(shot.id, 'referenceImage', v[0] || undefined)
                      }}
                      multiple={false}
                    />
                  {/if}
                </div>
              {/if}
            </div>

            <!-- Actions -->
            {#if editable}
              <Button
                variant="ghost"
                size="sm"
                onclick={() => handleDeleteShot(shot.id)}
                class="text-destructive hover:text-destructive"
              >
                <X class="size-4" />
              </Button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

