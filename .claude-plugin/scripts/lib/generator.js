/**
 * Generator for Markdown Annotations format
 * Creates annotation blocks for text files
 */

const { calculateHash } = require('./hash');
const { countGraphemes, extractByGraphemeRange } = require('./parser');

/**
 * Format ranges as string
 * @param {Array<{start: number, length: number}>} ranges - Character ranges
 * @returns {string} Formatted ranges (e.g., "0,10 20,5")
 */
function formatRanges(ranges) {
  if (!ranges || ranges.length === 0) return '';
  return ranges.map(r => `${r.start},${r.length}`).join(' ');
}

/**
 * Merge overlapping or adjacent ranges
 * @param {Array<{start: number, length: number}>} ranges - Ranges to merge
 * @returns {Array<{start: number, length: number}>} Merged ranges
 */
function mergeRanges(ranges) {
  if (!ranges || ranges.length === 0) return [];

  // Sort by start position
  const sorted = [...ranges].sort((a, b) => a.start - b.start);

  const merged = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    const lastEnd = last.start + last.length;
    const currentEnd = current.start + current.length;

    // Check if ranges overlap or are adjacent
    if (current.start <= lastEnd) {
      // Merge ranges
      last.length = Math.max(lastEnd, currentEnd) - last.start;
    } else {
      // Add as separate range
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Add author annotation to existing annotations
 * @param {Object} annotations - Existing annotations
 * @param {string} author - Author name (without @ or & prefix)
 * @param {Array<{start: number, length: number}>} ranges - New ranges
 * @param {string} kind - Author kind: 'Human' or 'Other' (default: 'Other' for AI)
 * @returns {Object} Updated annotations
 */
function addAuthorAnnotation(annotations, author, ranges, kind = 'Other') {
  const updated = { ...annotations };

  // Remove prefix if present
  let authorName = author;
  if (author.startsWith('@') || author.startsWith('&')) {
    authorName = author.substring(1);
  }

  // Determine prefix based on kind
  const prefix = kind === 'Human' ? '@' : '&';
  const authorKey = `${prefix}${authorName}`;

  // Get existing ranges for this author
  const existingRanges = updated[authorKey] || [];

  // Merge with new ranges
  const allRanges = [...existingRanges, ...ranges];
  const mergedRanges = mergeRanges(allRanges);

  updated[authorKey] = mergedRanges;

  return updated;
}

/**
 * Generate annotation block
 * @param {string} text - Text content
 * @param {Object} annotations - Annotations object (keys are author names with @)
 * @returns {string} Formatted annotation block
 */
function generateAnnotationBlock(text, annotations) {
  if (!annotations || Object.keys(annotations).filter(k => k !== 'Annotations').length === 0) {
    return '';
  }

  const lines = [];

  // Collect all ranges from all authors
  const allRanges = [];
  for (const [key, ranges] of Object.entries(annotations)) {
    if (key === 'Annotations') continue;
    if (Array.isArray(ranges)) {
      allRanges.push(...ranges);
    }
  }

  // Merge and sort all ranges for the Annotations line
  const mergedAllRanges = mergeRanges(allRanges);

  // Calculate hash of annotated text
  let annotatedText = '';
  for (const range of mergedAllRanges) {
    annotatedText += extractByGraphemeRange(text, range.start, range.length);
  }

  const hash = calculateHash(annotatedText, 64);

  // Generate Annotations line
  const rangesStr = formatRanges(mergedAllRanges);
  lines.push(`Annotations: ${rangesStr} SHA-256 ${hash}`);

  // Generate author lines
  for (const [key, ranges] of Object.entries(annotations)) {
    if (key === 'Annotations') continue;

    const rangesStr = formatRanges(ranges);
    if (rangesStr) {
      lines.push(`${key}: ${rangesStr}`);
    }
  }

  // Add end marker
  lines.push('...');

  return lines.join('\n');
}

/**
 * Generate full file content with annotations
 * @param {string} text - Text content
 * @param {Object} annotations - Annotations object
 * @returns {string} Full file content with annotation block
 */
function generateFileContent(text, annotations) {
  const annotationBlock = generateAnnotationBlock(text, annotations);

  if (!annotationBlock) {
    return text;
  }

  return `${text}\n\n---\n${annotationBlock}`;
}

/**
 * Calculate character ranges for new text added to content
 * @param {string} oldText - Original text content (without annotations)
 * @param {string} newText - New text content (without annotations)
 * @returns {Array<{start: number, length: number}>} Ranges of new text
 */
function calculateNewRanges(oldText, newText) {
  // Simple implementation: if text was appended, return range of appended part
  // More sophisticated diff algorithm could be used for complex edits

  const oldLength = countGraphemes(oldText);
  const newLength = countGraphemes(newText);

  if (newLength <= oldLength) {
    // Text was removed or no change
    return [];
  }

  if (newText.startsWith(oldText)) {
    // Text was appended
    return [{ start: oldLength, length: newLength - oldLength }];
  }

  // For now, treat entire new content as new
  // TODO: Implement proper diff algorithm
  return [{ start: 0, length: newLength }];
}

module.exports = {
  formatRanges,
  mergeRanges,
  addAuthorAnnotation,
  generateAnnotationBlock,
  generateFileContent,
  calculateNewRanges
};
