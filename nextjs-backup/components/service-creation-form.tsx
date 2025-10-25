"use client"

import type React from "react"

import { useState } from "react"
import { InlineTextEditor } from "@/components/inline-text-editor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImagePlus, X, Plus } from "lucide-react"

const serviceCategories = [
  "Wig Styling",
  "Photography",
  "Makeup",
  "Costume Making",
  "Prop Making",
  "Group Cosplay",
  "Consultation",
  "Other",
]

export function ServiceCreationForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [turnaround, setTurnaround] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [images, setImages] = useState<string[]>([])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8">
      {/* Service Title */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Service Title</Label>
        <InlineTextEditor
          value={title}
          onChange={setTitle}
          placeholder="Enter service title..."
          variant="title"
          className="text-2xl"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {serviceCategories.map((cat) => (
              <SelectItem key={cat} value={cat.toLowerCase().replace(/\s+/g, "-")}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your service in detail..."
          className="min-h-32 resize-none"
        />
      </div>

      {/* Pricing */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Pricing Range</Label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min price"
              className="w-full"
            />
          </div>
          <span className="text-muted-foreground">to</span>
          <div className="flex-1">
            <Input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max price"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Turnaround Time */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Turnaround Time</Label>
        <Input
          value={turnaround}
          onChange={(e) => setTurnaround(e.target.value)}
          placeholder="e.g., 3-5 days, 1-2 weeks"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tags</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
            placeholder="Add a tag..."
            className="flex-1"
          />
          <Button type="button" size="sm" variant="outline" onClick={handleAddTag}>
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {/* Portfolio Images */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Portfolio Images</Label>
        <div className="grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="group relative aspect-square overflow-hidden rounded-lg">
              <img
                src={image || "/placeholder.svg"}
                alt={`Portfolio ${index + 1}`}
                className="size-full object-cover"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute right-2 top-2 rounded-full bg-destructive p-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-4 text-destructive-foreground" />
              </button>
            </div>
          ))}
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50">
            <ImagePlus className="size-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Add Image</span>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Active Service</Label>
          <p className="text-xs text-muted-foreground">Make this service visible in the marketplace</p>
        </div>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button className="flex-1">Create Service</Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          Save as Draft
        </Button>
      </div>
    </div>
  )
}
