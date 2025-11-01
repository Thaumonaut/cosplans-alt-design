<script lang="ts">
  import { DollarSign, AlertTriangle } from 'lucide-svelte'
  import { cn, formatCurrencyFromCents } from '$lib/utils'

  interface Props {
    estimatedBudget?: number // in cents
    spentBudget: number // in cents
  }

  let { estimatedBudget, spentBudget }: Props = $props()


  const isOverBudget = $derived(estimatedBudget && spentBudget > estimatedBudget)
  const percentageSpent = $derived(
    estimatedBudget && estimatedBudget > 0 ? (spentBudget / estimatedBudget) * 100 : 0
  )

  const budgetStatus = $derived(
    !estimatedBudget
      ? 'unset'
      : isOverBudget
        ? 'over'
        : percentageSpent >= 90
          ? 'warning'
          : percentageSpent >= 75
            ? 'caution'
            : 'good'
  )

  const statusColors = {
    unset: 'text-muted-foreground',
    good: 'text-green-600',
    caution: 'text-yellow-600',
    warning: 'text-orange-600',
    over: 'text-red-600',
  }

  const statusLabels = {
    unset: 'No Budget Set',
    good: 'On Track',
    caution: 'Watch Spending',
    warning: 'Near Limit',
    over: 'Over Budget',
  }
</script>

<div class="space-y-4 rounded-lg border bg-card p-4">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <DollarSign class="size-5 text-muted-foreground" />
      <h3 class="text-sm font-medium text-foreground">Budget</h3>
    </div>
    {#if budgetStatus !== 'unset'}
      <span class={cn('text-xs font-medium', statusColors[budgetStatus])}>
        {statusLabels[budgetStatus]}
      </span>
    {/if}
  </div>

  <!-- Budget Display -->
  <div class="space-y-2">
    <div class="flex items-baseline justify-between">
      <span class="text-xs text-muted-foreground">Spent</span>
      <span class={cn('text-2xl font-bold', isOverBudget && 'text-red-600')}>
        {formatCurrencyFromCents(spentBudget)}
      </span>
    </div>

    {#if estimatedBudget}
      <div class="flex items-baseline justify-between">
        <span class="text-xs text-muted-foreground">Estimated</span>
        <span class="text-lg text-muted-foreground">{formatCurrencyFromCents(estimatedBudget)}</span>
      </div>

      <!-- Progress Bar -->
      <div class="pt-2">
        <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            class={cn(
              'h-full rounded-full transition-all',
              budgetStatus === 'over'
                ? 'bg-red-500'
                : budgetStatus === 'warning'
                  ? 'bg-orange-500'
                  : budgetStatus === 'caution'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
            )}
            style="width: {Math.min(percentageSpent, 100)}%"
          ></div>
        </div>
        <div class="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{Math.round(percentageSpent)}% spent</span>
          {#if estimatedBudget && spentBudget < estimatedBudget}
            <span>{formatCurrencyFromCents((estimatedBudget || 0) - spentBudget)} remaining</span>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- Over Budget Warning -->
  {#if isOverBudget}
    <div class="flex items-start gap-2 rounded-md bg-red-50 p-3 dark:bg-red-950/30">
      <AlertTriangle class="size-4 text-red-600 flex-shrink-0 mt-0.5" />
      <div class="flex-1">
        <p class="text-sm font-medium text-red-600">Budget Exceeded</p>
        <p class="text-xs text-red-600/80">
          Spending is {formatCurrencyFromCents(spentBudget - (estimatedBudget || 0))} over the estimated
          budget.
        </p>
      </div>
    </div>
  {/if}
</div>


