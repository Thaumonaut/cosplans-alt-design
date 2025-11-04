# Reusable Component Patterns

This document describes the reusable component patterns used throughout the app. Always check for existing components before creating new ones.

## Base Components

### ClickableCard (`$lib/components/ui/clickable-card.svelte`)
A reusable card component that handles click interactions properly.

**Features:**
- Prevents card click when clicking on interactive elements (buttons, inputs, dropdowns, etc.)
- Supports keyboard navigation (Enter/Space)
- Supports selection state
- Supports drag-and-drop
- Supports disabled state

**Usage:**
```svelte
<script>
  import ClickableCard from '$lib/components/ui/clickable-card.svelte'
</script>

<ClickableCard
  onclick={() => handleCardClick()}
  selected={isSelected}
  disabled={isDisabled}
  draggable={isDraggable}
  class="custom-card-styles"
>
  <!-- Card content -->
  <div class="p-4">
    <h3>Card Title</h3>
    <p>Card content</p>
  </div>
</ClickableCard>
```

### DetailCard (`$lib/components/base/DetailCard.svelte`)
Extends ClickableCard with detail drawer integration using CreationFlyout.

**Features:**
- All ClickableCard features
- Automatic detail drawer integration
- Controlled open/close state
- Full-screen navigation support

**Usage:**
```svelte
<script>
  import DetailCard from '$lib/components/base/DetailCard.svelte'
  
  let selectedItemId = $state<string | null>(null)
</script>

<DetailCard
  id={item.id}
  detailTitle="Item Details"
  openDetailId={selectedItemId}
  onDetailOpen={(id) => selectedItemId = id}
  onDetailClose={(id) => selectedItemId = null}
  onFullScreen={(id) => goto(`/items/${id}`)}
>
  {#snippet children()}
    <!-- Card content -->
    <div class="p-4">
      <h3>{item.name}</h3>
    </div>
  {/snippet}
  
  {#snippet detailContent()}
    <!-- Detail drawer content -->
    <div class="p-6">
      <h2>{item.name}</h2>
      <p>{item.description}</p>
    </div>
  {/snippet}
</DetailCard>
```

### TagSelector (`$lib/components/base/TagSelector.svelte`)
Base component for tag-style dropdowns (used by PrioritySelector, StageSelector, etc.).

**Features:**
- Uses existing DropdownMenu component
- Supports color coding
- Supports dot indicators
- Supports badges
- Customizable color functions

**Usage:**
```svelte
<script>
  import TagSelector from '$lib/components/base/TagSelector.svelte'
  
  const options = [
    {
      value: 'option1',
      label: 'Option 1',
      color: 'bg-blue-500/10 text-blue-700',
      dotColor: 'bg-blue-500',
      badge: '✓'
    }
  ]
</script>

<TagSelector
  options={options}
  currentValue={selectedValue}
  onChange={(value) => handleChange(value)}
/>
```

### PrioritySelector (`$lib/components/base/PrioritySelector.svelte`)
Tag-style dropdown for priority selection. Built on TagSelector.

**Usage:**
```svelte
<script>
  import PrioritySelector from '$lib/components/base/PrioritySelector.svelte'
</script>

<PrioritySelector
  currentPriority="high"
  editable={true}
  onPriorityChange={(priority) => handleChange(priority)}
/>
```

### StageSelector (`$lib/components/base/StageSelector.svelte`)
Tag-style dropdown for stage/status selection. Built on TagSelector.

**Usage:**
```svelte
<script>
  import StageSelector from '$lib/components/base/StageSelector.svelte'
</script>

<StageSelector
  stages={availableStages}
  currentStageId={selectedStageId}
  editable={true}
  onStageChange={(stageId) => handleChange(stageId)}
  showNextStage={true}
/>
```

## UI Components

### Button (`$lib/components/ui/button.svelte`)
Standard button component with variants and sizes.

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Sizes:** `default`, `sm`, `lg`, `icon`, `icon-sm`, `icon-lg`

**Usage:**
```svelte
<script>
  import { Button } from '$lib/components/ui'
</script>

<Button variant="default" size="sm" onclick={handleClick}>
  Click Me
</Button>
```

### DatePicker (`$lib/components/ui/date-picker.svelte`)
Standard date picker using Flowbite Datepicker.

**Usage:**
```svelte
<script>
  import { DatePicker } from '$lib/components/ui'
  
  let dateValue = $state('')
</script>

<DatePicker
  bind:value={dateValue}
  placeholder="Select date"
  onchange={(value) => handleChange(value)}
/>
```

## Component Hierarchy

```
Base Components (Reusable, Domain-Agnostic)
├── TagSelector (base for all tag dropdowns)
│   ├── PrioritySelector
│   └── StageSelector
├── ClickableCard (base for all clickable cards)
│   └── DetailCard (extends ClickableCard with drawer)
│       └── Used by: TaskCard, ProjectCard, ResourceCard, etc.
└── UI Components
    ├── Button
    ├── DatePicker
    ├── Input
    ├── Select
    └── DropdownMenu (used by TagSelector)
```

## Best Practices

1. **Always check for existing components first**
   - Check `$lib/components/ui/` for base UI components
   - Check `$lib/components/base/` for reusable domain-agnostic components
   - Check existing domain components for patterns

2. **Never hard-code component styles**
   - Use existing components and extend them
   - Use component props for customization
   - Use `class` prop for additional styling

3. **Build reusable, extensible components**
   - Accept props for customization
   - Use snippets for flexible content
   - Support multiple use cases

4. **Use ClickableCard for all clickable cards**
   - Consistent click handling
   - Proper keyboard navigation
   - Interactive element detection

5. **Use Button component for all buttons**
   - Consistent styling and behavior
   - Proper variants and sizes
   - Accessibility built-in

6. **Use TagSelector pattern for tag-style dropdowns**
   - Consistent UX across priorities, stages, tags
   - Built on existing DropdownMenu
   - Supports color coding and indicators

