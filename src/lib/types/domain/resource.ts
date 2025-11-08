export type ResourceCategory =
  | 'prop'
  | 'fabric'
  | 'wig'
  | 'pattern'
  | 'costume-piece'
  | 'accessory'
  | 'material'

export type ResourceStatus = 'needed' | 'acquired' | 'in-progress' | 'completed'

// Base resource type
export interface Resource {
  id: string
  teamId: string
  name: string
  description?: string
  images: string[]
  cost?: number // in cents
  tags: string[]
  notes?: string
  metadata: ResourceMetadata
  createdAt: string
  updatedAt: string
}

// Discriminated union for metadata based on category
export type ResourceMetadata =
  | PropMetadata
  | FabricMetadata
  | WigMetadata
  | PatternMetadata
  | CostumePieceMetadata
  | AccessoryMetadata
  | MaterialMetadata

export interface PropMetadata {
  category: 'prop'
  dimensions?: string
  weight?: string
  material?: string | string[] // Support multiple materials
  fragile?: boolean
  requiresAssembly?: boolean
  storageLocation?: string
}

export interface FabricMetadata {
  category: 'fabric'
  fabricType: string
  color: string
  quantity: number
  unit: 'yards' | 'meters'
  width?: number
  stretch?: boolean
  washable?: boolean
}

export interface WigMetadata {
  category: 'wig'
  color: string
  length: string
  style: string
  needsStyling?: boolean
  laceType?: 'none' | 'lace-front' | 'full-lace'
  heatResistant?: boolean
}

export interface PatternMetadata {
  category: 'pattern'
  patternCompany?: string
  patternNumber?: string
  size?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  digitalFileUrl?: string
  physicalPattern?: boolean
}

export interface CostumePieceMetadata {
  category: 'costume-piece'
  pieceType?: string
  size?: string
  material?: string | string[] // Support multiple materials
  color?: string
  needsAlterations?: boolean
}

export interface AccessoryMetadata {
  category: 'accessory'
  accessoryType?: string
  material?: string | string[] // Support multiple materials
  color?: string
  quantity?: number
}

export interface MaterialMetadata {
  category: 'material'
  materialType?: string | string[] // Support multiple material types
  brand?: string
  colorVariant?: string
  quantity?: number
  unit?: string
}

export interface ResourceCreate {
  name: string
  description?: string
  images?: string[]
  cost?: number // in cents
  tags?: string[]
  notes?: string
  metadata: ResourceMetadata
}

export interface ResourceUpdate {
  name?: string
  description?: string
  images?: string[]
  cost?: number // in cents
  tags?: string[]
  notes?: string
  metadata?: ResourceMetadata
}

// Project-Resource link
export interface ProjectResource {
  id: string
  projectId: string
  resourceId: string
  quantity: number
  status: ResourceStatus
  notes?: string
  addedAt: string
}
