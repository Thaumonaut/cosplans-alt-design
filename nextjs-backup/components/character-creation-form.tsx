"use client"

import * as React from "react"
import { InlineTextEditor } from "@/components/inline-text-editor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, Plus, X } from "lucide-react"

export function CharacterCreationForm() {
  const [characterName, setCharacterName] = React.useState("")
  const [series, setSeries] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const [newTag, setNewTag] = React.useState("")
  const [difficulty, setDifficulty] = React.useState<"easy" | "medium" | "hard" | "expert" | null>(null)

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="space-y-8">
      {/* Image Upload Section */}
      <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/50 hover:bg-muted/50">
        <button className="flex size-full flex-col items-center justify-center gap-3 text-muted-foreground transition-colors group-hover:text-foreground">
          <Upload className="size-12" />
          <div className="text-center">
            <p className="font-medium">Upload character reference</p>
            <p className="text-sm text-muted-foreground">Click or drag image here</p>
          </div>
        </button>
      </div>

      {/* Character Name */}
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Character Name</label>
        <InlineTextEditor
          value={characterName}
          onChange={setCharacterName}
          placeholder="Enter character name..."
          variant="title"
        />
      </div>

      {/* Series */}
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Series / Source</label>
        <InlineTextEditor
          value={series}
          onChange={setSeries}
          placeholder="What series is this character from?"
          variant="heading"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</label>
        <InlineTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Describe the character and their appearance..."
          variant="body"
          multiline
        />
      </div>

      {/* Difficulty */}
      <div className="space-y-3">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Difficulty Level</label>
        <div className="flex gap-2">
          {(["easy", "medium", "hard", "expert"] as const).map((level) => (
            <Button
              key={level}
              variant={difficulty === level ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficulty(level)}
              className="capitalize"
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-1 rounded-full p-0.5 hover:bg-background/50">
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag()
                }
              }}
              placeholder="Add tag..."
              className="h-7 w-32 rounded-md border bg-transparent px-2 text-sm outline-none focus:border-primary"
            />
            <Button size="icon" variant="ghost" onClick={addTag} className="size-7">
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</label>
        <InlineTextEditor
          value={notes}
          onChange={setNotes}
          placeholder="Add any additional notes, ideas, or references..."
          variant="body"
          multiline
        />
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 -mx-6 -mb-6 flex gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button className="flex-1">Create Character</Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          Save as Draft
        </Button>
      </div>
    </div>
  )
}
