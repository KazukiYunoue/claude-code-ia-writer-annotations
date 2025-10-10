/**
 * Parser for Markdown Annotations format
 * Parses annotation blocks from text files
 */

const { verifyHash } = require('./hash');

/**
 * Count grapheme clusters in text
 * @param {string} text - Text to count
 * @returns {number} Number of grapheme clusters
 */
function countGraphemes(text) {
  if (!text) return 0;

  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  const segments = segmenter.segment(text);
  return Array.from(segments).length;
}

/**
 * Extract text by grapheme range
 * @param {string} text - Source text
 * @param {number} start - Start position (grapheme index)
 * @param {number} length - Length (grapheme count)
 * @returns {string} Extracted text
 */
function extractByGraphemeRange(text, start, length) {
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  const segments = Array.from(segmenter.segment(text));

  const startIndex = segments[start]?.index || 0;
  const endSegment = segments[start + length - 1];
  const endIndex = endSegment ? endSegment.index + endSegment.segment.length : text.length;

  return text.substring(startIndex, endIndex);
}

/**
 * Parse character ranges from annotation value
 * @param {string} value - Annotation value (e.g., "0,10 20,5")
 * @returns {Array<{start: number, length: number}>} Parsed ranges
 */
function parseRanges(value) {
  if (!value || !value.trim()) return [];

  return value.trim().split(/\s+/).map(range => {
    const [start, length] = range.split(',').map(Number);
    return { start, length };
  });
}

/**
 * Parse annotation block from file content
 * @param {string} content - Full file content
 * @returns {{text: string, annotations: Object, raw: string|null}} Parsed result
 */
function parseAnnotations(content) {
  if (!content) {
    return { text: '', annotations: {}, raw: null };
  }

  // Look for annotation block separator (---)
  const separatorMatch = content.match(/\n---\s*\n(Annotations:.*?)$/s);

  if (!separatorMatch) {
    // No annotations found
    return { text: content, annotations: {}, raw: null };
  }

  const textContent = content.substring(0, separatorMatch.index);
  const annotationBlock = separatorMatch[1];

  const annotations = {};
  const lines = annotationBlock.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    // Extract key and value
    let key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    // Handle escaped colons in key
    key = key.replace(/\\:/g, ':');

    // Parse special Annotations line with hash
    if (key === 'Annotations') {
      const parts = value.split(/\s+/);
      const ranges = [];
      let hashAlgorithm = null;
      let hashValue = null;

      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === 'SHA-256' && i + 1 < parts.length) {
          hashAlgorithm = 'SHA-256';
          hashValue = parts[i + 1];
          i++; // Skip next part
        } else if (parts[i].includes(',')) {
          const [start, length] = parts[i].split(',').map(Number);
          ranges.push({ start, length });
        }
      }

      annotations[key] = {
        ranges,
        hash: { algorithm: hashAlgorithm, value: hashValue }
      };
    } else {
      // Parse author annotations
      annotations[key] = parseRanges(value);
    }
  }

  return {
    text: textContent,
    annotations,
    raw: annotationBlock
  };
}

/**
 * Verify annotation integrity
 * @param {string} text - Text content
 * @param {Object} annotations - Parsed annotations
 * @returns {{valid: boolean, error: string|null}} Verification result
 */
function verifyAnnotations(text, annotations) {
  if (!annotations.Annotations) {
    return { valid: true, error: null };
  }

  const { ranges, hash } = annotations.Annotations;

  if (!hash || !hash.value) {
    return { valid: false, error: 'Missing hash in Annotations line' };
  }

  // Extract text from specified ranges
  let annotatedText = '';
  for (const range of ranges) {
    annotatedText += extractByGraphemeRange(text, range.start, range.length);
  }

  // Verify hash
  const isValid = verifyHash(annotatedText, hash.value);

  return {
    valid: isValid,
    error: isValid ? null : 'Hash verification failed'
  };
}

module.exports = {
  countGraphemes,
  extractByGraphemeRange,
  parseRanges,
  parseAnnotations,
  verifyAnnotations
};
