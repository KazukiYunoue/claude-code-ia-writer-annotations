#!/usr/bin/env node

const fs = require('fs');
const { parseAnnotations, verifyAnnotations } = require('./.claude-plugin/scripts/lib/parser');

// Read test file
const content = fs.readFileSync('./test-japanese.md', 'utf8');
console.log('File content length (bytes):', Buffer.byteLength(content, 'utf8'));
console.log('File content length (characters):', content.length);
console.log('\n--- File Content ---');
console.log(content);
console.log('\n--- Parsing Annotations ---');

// Parse annotations
const { text, annotations, raw } = parseAnnotations(content);

console.log('Text length (bytes):', Buffer.byteLength(text, 'utf8'));
console.log('Text length (characters):', text.length);

// Count graphemes
const { countGraphemes } = require('./.claude-plugin/scripts/lib/parser');
const graphemeCount = countGraphemes(text);
console.log('Text length (graphemes):', graphemeCount);

console.log('\nAnnotations:', JSON.stringify(annotations, null, 2));

// Verify annotations
const verification = verifyAnnotations(text, annotations);
console.log('\nVerification result:', verification);

if (verification.valid) {
  console.log('✅ Annotations are valid!');
} else {
  console.log('❌ Annotations are INVALID:', verification.error);
}
