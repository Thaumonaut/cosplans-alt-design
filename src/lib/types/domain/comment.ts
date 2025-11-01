export type CommentEntityType = 'idea' | 'project' | 'resource' | 'tool' | 'photoshoot'

export interface Comment {
  id: string
  userId: string
  entityType: CommentEntityType
  entityId: string
  content: string
  author?: {
    id: string
    name?: string
    avatarUrl?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CommentCreate {
  entityType: CommentEntityType
  entityId: string
  content: string
}

export interface CommentUpdate {
  content: string
}

