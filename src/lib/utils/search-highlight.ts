/**
 * Utility functions for highlighting search results in text
 */

export interface HighlightMatch {
  text: string
  isMatch: boolean
}

/**
 * Highlight search query in text, handling fuzzy matches
 * @param text The text to highlight
 * @param query The search query
 * @param threshold Threshold for fuzzy matching (0-1, lower = more fuzzy)
 * @returns Array of text segments with match indicators
 */
export function highlightMatches(
  text: string,
  query: string,
  threshold: number = 0.3
): HighlightMatch[] {
  if (!query || !text) {
    return [{ text, isMatch: false }]
  }

  const queryLower = query.toLowerCase().trim()
  const textLower = text.toLowerCase()

  // If exact match found, highlight the exact substring
  const exactIndex = textLower.indexOf(queryLower)
  if (exactIndex !== -1) {
    return [
      { text: text.slice(0, exactIndex), isMatch: false },
      { text: text.slice(exactIndex, exactIndex + query.length), isMatch: true },
      { text: text.slice(exactIndex + query.length), isMatch: false }
    ].filter(segment => segment.text.length > 0)
  }

  // For fuzzy matching, use a simple approach: highlight words that start with query
  const words = text.split(/(\s+)/)
  const results: HighlightMatch[] = []

  for (const word of words) {
    if (!word.trim()) {
      // Preserve whitespace
      results.push({ text: word, isMatch: false })
      continue
    }

    const wordLower = word.toLowerCase()
    // Check if word starts with query or contains query
    if (wordLower.startsWith(queryLower) || wordLower.includes(queryLower)) {
      // Find where the match occurs
      const matchIndex = wordLower.indexOf(queryLower)
      if (matchIndex === 0) {
        // Match at start
        results.push(
          { text: word.slice(0, query.length), isMatch: true },
          { text: word.slice(query.length), isMatch: false }
        )
      } else {
        // Match in middle or end
        results.push(
          { text: word.slice(0, matchIndex), isMatch: false },
          { text: word.slice(matchIndex, matchIndex + query.length), isMatch: true },
          { text: word.slice(matchIndex + query.length), isMatch: false }
        )
      }
    } else {
      results.push({ text: word, isMatch: false })
    }
  }

  return results
}

/**
 * Create a highlighted text component from matches
 */
export function createHighlightedText(matches: HighlightMatch[]): string {
  return matches
    .map(match => match.isMatch ? `<mark class="bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded">${escapeHtml(match.text)}</mark>` : escapeHtml(match.text))
    .join('')
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

