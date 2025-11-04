/**
 * Mention Autocomplete Utility
 * Feature: 003-modern-task-ui
 * Purpose: Filter and rank team members for @mention autocomplete dropdown
 */

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface AutocompleteResult extends TeamMember {
  score: number; // Relevance score for sorting
  matchedOn: 'name' | 'email'; // What field matched the query
}

/**
 * Filter team members based on mention query
 * Searches by name and email, ranks results by relevance
 * @param query - Search query (text after @)
 * @param members - Array of team members
 * @param maxResults - Maximum number of results to return (default: 10)
 * @returns Filtered and sorted array of team members
 */
export function filterTeamMembers(
  query: string,
  members: TeamMember[],
  maxResults: number = 10
): AutocompleteResult[] {
  // Empty query: return all members
  if (!query.trim()) {
    return members
      .slice(0, maxResults)
      .map(m => ({
        ...m,
        score: 0,
        matchedOn: 'name' as const
      }));
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results: AutocompleteResult[] = [];

  for (const member of members) {
    const score = calculateRelevanceScore(normalizedQuery, member);
    
    if (score > 0) {
      results.push({
        ...member,
        score,
        matchedOn: score > 50 ? 'name' : 'email'
      });
    }
  }

  // Sort by score (highest first), then by name
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name);
  });

  return results.slice(0, maxResults);
}

/**
 * Calculate relevance score for a team member
 * Higher score = more relevant match
 * Scoring:
 * - Exact match: 100
 * - Starts with query: 80
 * - Contains query: 50
 * - Email match: 30
 */
function calculateRelevanceScore(query: string, member: TeamMember): number {
  const name = member.name.toLowerCase();
  const email = member.email?.toLowerCase() || '';

  // Exact name match
  if (name === query) {
    return 100;
  }

  // Name starts with query
  if (name.startsWith(query)) {
    return 80;
  }

  // Name contains query
  if (name.includes(query)) {
    return 50 + (query.length / name.length) * 10; // Bonus for longer match
  }

  // Email starts with query
  if (email.startsWith(query)) {
    return 40;
  }

  // Email contains query
  if (email.includes(query)) {
    return 30;
  }

  // No match
  return 0;
}

/**
 * Get suggested members based on query
 * Alias for filterTeamMembers with common use case
 */
export function getSuggestions(
  query: string,
  members: TeamMember[],
  maxResults?: number
): AutocompleteResult[] {
  return filterTeamMembers(query, members, maxResults);
}

/**
 * Highlight matching parts of member name
 * Used for displaying autocomplete results with highlighted query
 * @param name - Member name to highlight
 * @param query - Search query
 * @returns Name with <mark> tags around matches
 */
export function highlightMatch(name: string, query: string): string {
  if (!query.trim()) {
    return name;
  }

  const normalizedQuery = query.toLowerCase();
  const normalizedName = name.toLowerCase();
  const index = normalizedName.indexOf(normalizedQuery);

  if (index === -1) {
    return name;
  }

  const before = name.slice(0, index);
  const match = name.slice(index, index + query.length);
  const after = name.slice(index + query.length);

  return `${before}<mark class="bg-yellow-200">${match}</mark>${after}`;
}

/**
 * Filter members by role
 * Useful for role-specific mentions (e.g., only show admins)
 */
export function filterByRole(
  members: TeamMember[],
  roles: string[]
): TeamMember[] {
  return members.filter(m => m.role && roles.includes(m.role));
}

/**
 * Get recently mentioned members
 * Returns members that were recently mentioned in comments
 * @param members - All team members
 * @param recentMentionIds - Array of user IDs recently mentioned
 * @param maxResults - Maximum number to return
 */
export function getRecentlyMentioned(
  members: TeamMember[],
  recentMentionIds: string[],
  maxResults: number = 5
): TeamMember[] {
  const recentMembers: TeamMember[] = [];

  for (const id of recentMentionIds) {
    const member = members.find(m => m.id === id);
    if (member && !recentMembers.includes(member)) {
      recentMembers.push(member);
    }

    if (recentMembers.length >= maxResults) {
      break;
    }
  }

  return recentMembers;
}

/**
 * Group autocomplete results by role
 * Useful for displaying members organized by role
 */
export function groupByRole(results: AutocompleteResult[]): Map<string, AutocompleteResult[]> {
  const groups = new Map<string, AutocompleteResult[]>();

  for (const result of results) {
    const role = result.role || 'Member';
    if (!groups.has(role)) {
      groups.set(role, []);
    }
    groups.get(role)!.push(result);
  }

  return groups;
}

/**
 * Format member name for display in autocomplete
 * Shows name with email fallback
 */
export function formatMemberName(member: TeamMember): string {
  if (member.name) {
    return member.name;
  }
  if (member.email) {
    return member.email.split('@')[0]; // Use email username
  }
  return 'Unknown User';
}

/**
 * Check if member should be excluded from mentions
 * (e.g., current user, deactivated users)
 */
export function shouldExcludeFromMentions(
  member: TeamMember,
  currentUserId?: string
): boolean {
  // Don't mention yourself
  if (currentUserId && member.id === currentUserId) {
    return true;
  }

  // Future: Check if user is deactivated
  // if (member.status === 'deactivated') {
  //   return true;
  // }

  return false;
}


