<script lang="ts">
  import { Button, Select } from "$lib/components/ui";
  import InlineTextEditor from "./inline-text-editor.svelte";
  import { Upload } from "lucide-svelte";

  // Form state using Svelte 5 runes
  let projectName = $state("");
  let character = $state("");
  let outfit = $state("");
  let description = $state("");
  let notes = $state("");
  let status = $state<"idea" | "planning" | "in-progress">("planning");
  let budget = $state("");
  let deadline = $state("");

  function handleSubmit() {
    // TODO: Implement project creation logic
    console.log("Creating project:", {
      projectName,
      character,
      outfit,
      description,
      notes,
      status,
      budget,
      deadline,
    });
  }

  function handleSaveDraft() {
    // TODO: Implement save as draft logic
    console.log("Saving draft:", {
      projectName,
      character,
      outfit,
      description,
      notes,
      status,
      budget,
      deadline,
    });
  }
</script>

<div class="space-y-8">
  <!-- Image Upload Section -->
  <div class="group relative aspect-[3/4] w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/50 hover:bg-muted/50">
    <button class="flex size-full flex-col items-center justify-center gap-3 text-muted-foreground transition-colors group-hover:text-foreground">
      <Upload class="size-12" />
      <div class="text-center">
        <p class="font-medium">Upload project reference</p>
        <p class="text-sm text-muted-foreground">Click or drag image here</p>
      </div>
    </button>
  </div>

  <!-- Project Name -->
  <div class="space-y-2">
    <label class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Project Name</label>
    <InlineTextEditor
      bind:value={projectName}
      placeholder="Enter project name..."
      variant="title"
    />
  </div>

  <!-- Character Selection -->
  <div class="space-y-2">
    <label class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Character</label>
    <Select 
      bind:value={character}
      placeholder="Select a character..."
      options={[
        { value: "malenia", label: "Malenia, Blade of Miquella" },
        { value: "raiden", label: "Raiden Shogun" },
        { value: "v", label: "V (Female)" },
        { value: "new", label: "+ Create New Character" }
      ]}
    />
  </div>

  <!-- Outfit Selection -->
  <div class="space-y-2">
    <label class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Outfit</label>
    <Select 
      bind:value={outfit}
      placeholder="Select an outfit..."
      options={[
        { value: "goddess", label: "Goddess of Rot Armor" },
        { value: "plane", label: "Plane of Euthymia" },
        { value: "street", label: "Street Kid Outfit" },
        { value: "new", label: "+ Create New Outfit" }
      ]}
    />
  </div>

  <!-- Status -->
  <div class="space-y-3">
    <label class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Project Status</label>
    <div class="flex gap-2">
      {#each ["idea", "planning", "in-progress"] as statusOption}
        <Button
          variant={status === statusOption ? "default" : "outline"}
          size="sm"
          onclick={() => (status = statusOption as typeof status)}
          class="capitalize"
        >
          {statusOption.replace("-", " ")}
        </Button>
      {/each}
    </div>
  </div>

  <!-- Budget -->
  <div class="space-y-2">
    <label class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Budget</label>
    <input
      type="number"
      bind:value={budget}
      placeholder="Enter total budget..."
      class="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
    />
  </div>

  <!-- Deadline -->
  <div class="space-y-2">
    <label class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Deadline</label>
    <input
      type="date"
      bind:value={deadline}
      class="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
    />
  </div>

  <!-- Description -->
  <div class="space-y-2">
    <label class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</label>
    <InlineTextEditor
      bind:value={description}
      placeholder="Describe your project goals and vision..."
      variant="body"
      multiline
    />
  </div>

  <!-- Notes -->
  <div class="space-y-2">
    <label class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</label>
    <InlineTextEditor
      bind:value={notes}
      placeholder="Add any additional notes, ideas, or references..."
      variant="body"
      multiline
    />
  </div>

  <!-- Action Buttons -->
  <div class="sticky bottom-0 -mx-6 -mb-6 flex gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <Button class="flex-1" onclick={handleSubmit}>Create Project</Button>
    <Button variant="outline" class="flex-1 bg-transparent" onclick={handleSaveDraft}>
      Save as Draft
    </Button>
  </div>
</div>