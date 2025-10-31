export type ToolCategory = 'crafting-tool' | 'shoot-equipment'

export type ToolCondition = 'new' | 'good' | 'fair' | 'needs-repair'

// Base tool type
export interface Tool {
  id: string
  teamId: string
  name: string
  description?: string
  images: string[]
  tags: string[]
  notes?: string
  metadata: ToolMetadata
  createdAt: string
  updatedAt: string
}

// Discriminated union for metadata based on category
export type ToolMetadata = CraftingToolMetadata | ShootEquipmentMetadata

export interface CraftingToolMetadata {
  category: 'crafting-tool'
  brand?: string
  model?: string
  purchaseDate?: string
  purchasePrice?: number
  condition?: ToolCondition
  storageLocation?: string
  manualUrl?: string
  warrantyExpires?: string
}

export interface ShootEquipmentMetadata {
  category: 'shoot-equipment'
  brand?: string
  model?: string
  owned?: boolean
  rentalCost?: number | null
  owner?: string | null
  specifications?: string
}

export interface ToolCreate {
  name: string
  description?: string
  images?: string[]
  tags?: string[]
  notes?: string
  metadata: ToolMetadata
}

export interface ToolUpdate {
  name?: string
  description?: string
  images?: string[]
  tags?: string[]
  notes?: string
  metadata?: ToolMetadata
}


