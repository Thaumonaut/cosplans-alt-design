/**
 * Mention Parser Utility
 * Feature: 003-modern-task-ui
 * Purpose: Parse and extract @mentions from comment text
 */

export interface MentionMatch {
  username: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Extract all @mentions from text
 * Matches pattern: @username (alphanumeric, underscore, hyphen)
 */
export function extractMentions(text: string): MentionMatch[] {
  const mentionRegex = /@([\w-]+)/g;
  const mentions: MentionMatch[] = [];
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      username: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }

  return mentions;
}

/**
 * Extract mentioned user IDs from text based on team member mapping
 * @param text - Comment text with @mentions
 * @param teamMembers - Array of team members with { id, name } structure
 * @returns Array of user IDs that were mentioned
 */
export function extractMentionedUserIds(
  text: string,
  teamMembers: Array<{ id: string; name: string }>
): string[] {
  const mentions = extractMentions(text);
  const mentionedIds: string[] = [];

  for (const mention of mentions) {
    // Find team member by name (case-insensitive match)
    const member = teamMembers.find(
      m => m.name.toLowerCase() === mention.username.toLowerCase()
    );

    if (member && !mentionedIds.includes(member.id)) {
      mentionedIds.push(member.id);
    }
  }

  return mentionedIds;
}

/**
 * Highlight @mentions in text with HTML spans
 * Used for rendering comments with styled mentions
 */
export function highlightMentions(text: string): string {
  return text.replace(
    /@([\w-]+)/g,
    '<span class="mention" data-mention="$1">@$1</span>'
  );
}

/**
 * Validate mention username format
 * Username must be alphanumeric with underscores/hyphens, 1-20 characters
 */
export function isValidMentionUsername(username: string): boolean {
  const usernameRegex = /^[\w-]{1,20}$/;
  return usernameRegex.test(username);
}

/**
 * Detect if cursor is currently typing a mention
 * @param text - Full text content
 * @param cursorPosition - Current cursor position
 * @returns Object with mention info if typing a mention, null otherwise
 */
export function detectActiveMention(
  text: string,
  cursorPosition: number
): { query: string; startIndex: number } | null {
  // Get text before cursor
  const textBeforeCursor = text.slice(0, cursorPosition);
  
  // Find the last @ symbol
  const lastAtIndex = textBeforeCursor.lastIndexOf('@');
  
  // No @ found
  if (lastAtIndex === -1) {
    return null;
  }

  // Text between @ and cursor
  const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
  
  // Check if there's a space (which would end the mention)
  if (textAfterAt.includes(' ')) {
    return null;
  }

  // Check if mention is too long (max 20 chars)
  if (textAfterAt.length > 20) {
    return null;
  }

  // Valid mention in progress
  return {
    query: textAfterAt,
    startIndex: lastAtIndex
  };
}

/**
 * Replace mention query with selected username
 * @param text - Full text content
 * @param mentionStart - Start index of @ symbol
 * @param mentionEnd - End index of current cursor position
 * @param selectedName - Username to insert
 * @returns Updated text with mention inserted
 */
export function insertMention(
  text: string,
  mentionStart: number,
  mentionEnd: number,
  selectedName: string
): { text: string; cursorPosition: number } {
  const beforeMention = text.slice(0, mentionStart);
  const afterCursor = text.slice(mentionEnd);
  const mentionText = `@${selectedName}`;
  
  const newText = beforeMention + mentionText + ' ' + afterCursor;
  const newCursorPosition = beforeMention.length + mentionText.length + 1;

  return {
    text: newText,
    cursorPosition: newCursorPosition
  };
}

/**
 * Count mentions in text
 */
export function countMentions(text: string): number {
  return extractMentions(text).length;
}

/**
 * Check if text contains a specific user mention
 */
export function hasMention(text: string, username: string): boolean {
  const mentions = extractMentions(text);
  return mentions.some(m => m.username.toLowerCase() === username.toLowerCase());
}


