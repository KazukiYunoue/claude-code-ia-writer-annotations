#!/usr/bin/env node

/**
 * Test Japanese text handling
 */

const { countGraphemes, parseAnnotations } = require('../.claude-plugin/scripts/lib/parser');
const { addAuthorAnnotation, generateFileContent } = require('../.claude-plugin/scripts/lib/generator');

console.log('=== Japanese Text Test ===\n');

// Test Japanese text
const japaneseText = 'こんにちは、世界！これは日本語のテストです。';
console.log(`Japanese text: ${japaneseText}`);
console.log(`Character count: ${japaneseText.length}`);
console.log(`Grapheme count: ${countGraphemes(japaneseText)}`);

// Add annotation
const textLength = countGraphemes(japaneseText);
const annotations = addAuthorAnnotation({}, 'Claude', [{ start: 0, length: textLength }], 'Other');
console.log('\nAnnotations:', annotations);

// Generate annotated content
const annotatedContent = generateFileContent(japaneseText, annotations);
console.log('\n=== Generated Content ===');
console.log(annotatedContent);
console.log('=== End ===\n');

// Parse it back
const parsed = parseAnnotations(annotatedContent);
console.log('Parsed text:', parsed.text);
console.log('Text matches:', parsed.text === japaneseText);
console.log('\n=== Test Complete ===');
