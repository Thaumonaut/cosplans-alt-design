<script lang="ts">
  import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-svelte'
  import { toast, type Toast } from '$lib/stores/toast'

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const colors = {
    success: 'bg-[color-mix(in_srgb,var(--theme-success)_20%,transparent)] backdrop-blur-sm text-[var(--theme-success)] border-[color-mix(in_srgb,var(--theme-success)_30%,transparent)]',
    error: 'bg-[color-mix(in_srgb,var(--theme-error)_20%,transparent)] backdrop-blur-sm text-[var(--theme-error)] border-[color-mix(in_srgb,var(--theme-error)_30%,transparent)]',
    info: 'bg-[color-mix(in_srgb,var(--theme-info)_20%,transparent)] backdrop-blur-sm text-[var(--theme-info)] border-[color-mix(in_srgb,var(--theme-info)_30%,transparent)]',
    warning: 'bg-[color-mix(in_srgb,var(--theme-warning)_20%,transparent)] backdrop-blur-sm text-[var(--theme-warning)] border-[color-mix(in_srgb,var(--theme-warning)_30%,transparent)]',
  }

  function handleRemove(id: string) {
    toast.remove(id)
  }
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
  {#each $toast as item (item.id)}
    {@const Icon = icons[item.type]}
    {@const colorClasses = colors[item.type]}
    <div
      class="animate-in slide-in-from-bottom-2 rounded-lg border p-4 shadow-lg {colorClasses}"
      role="alert"
    >
      <div class="flex items-start gap-3">
        <Icon class="mt-0.5 size-5 flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold">{item.title}</p>
          {#if item.description}
            <p class="mt-1 text-sm opacity-90">{item.description}</p>
          {/if}
        </div>
        <button
          type="button"
          class="rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
          onclick={() => handleRemove(item.id)}
          aria-label="Dismiss"
        >
          <X class="size-3" />
        </button>
      </div>
    </div>
  {/each}
</div>

