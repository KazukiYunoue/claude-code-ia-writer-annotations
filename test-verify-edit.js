#!/usr/bin/env node

const fs = require('fs');
const { parseAnnotations, verifyAnnotations, countGraphemes, extractByGraphemeRange } = require('./.claude-plugin/scripts/lib/parser');

// Read test file
const content = fs.readFileSync('./test-existing.md', 'utf8');

console.log('=== File Content ===');
console.log(content);
console.log('\n=== Parsing ===');

// Parse annotations
const { text, annotations } = parseAnnotations(content);

console.log('Text (parsed):');
console.log(text);
console.log('\nText length (graphemes):', countGraphemes(text));
console.log('\nAnnotations:', JSON.stringify(annotations, null, 2));

// Verify
const verification = verifyAnnotations(text, annotations);
console.log('\n=== Verification ===');
console.log('Result:', verification);

if (verification.valid) {
  console.log('✅ Annotations are valid!');

  // Extract annotated text to verify
  const range = annotations['&Claude'][0];
  const extractedText = extractByGraphemeRange(text, range.start, range.length);
  console.log('\n=== Extracted Text (range 0,172) ===');
  console.log(extractedText);
  console.log('\nDoes extracted text match full text?', extractedText === text);
} else {
  console.log('❌ Annotations are INVALID:', verification.error);
}
