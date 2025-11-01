import type { TeamRole } from '$lib/api/services/teamService'

export type PermissionAction =
  | 'read'
  | 'create'
  | 'edit'
  | 'delete'
  | 'archive'
  | 'comment'
  | 'manage_team'

/**
 * Check if a role has permission for an action
 * 
 * Owner: Full access (all actions)
 * Editor: Full content access except team management
 * Viewer: Read-only + comment ability
 */
export function can(role: TeamRole | null | undefined, action: PermissionAction): boolean {
  if (!role) return false

  switch (role) {
    case 'owner':
      return true // Can do everything
    case 'editor':
      return action !== 'manage_team' // Everything except team management
    case 'viewer':
      return action === 'read' || action === 'comment' // Read and comment only
    default:
      return false
  }
}

/**
 * Check if role can edit content (projects, resources, etc.)
 */
export function canEdit(role: TeamRole | null | undefined): boolean {
  return can(role, 'edit')
}

/**
 * Check if role can delete content
 */
export function canDelete(role: TeamRole | null | undefined): boolean {
  return can(role, 'delete')
}

/**
 * Check if role can manage team (invite, remove members, change roles)
 */
export function canManageTeam(role: TeamRole | null | undefined): boolean {
  return can(role, 'manage_team')
}

