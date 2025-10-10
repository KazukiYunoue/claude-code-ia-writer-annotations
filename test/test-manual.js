#!/usr/bin/env node

/**
 * Manual test script for annotation libraries
 */

const fs = require('fs');
const path = require('path');

// Import libraries
const { parseAnnotations, countGraphemes, verifyAnnotations } = require('../.claude-plugin/scripts/lib/parser');
const { addAuthorAnnotation, generateFileContent } = require('../.claude-plugin/scripts/lib/generator');

console.log('=== iA Writer Annotations Plugin Test ===\n');

// Test 1: Read sample file
console.log('Test 1: Reading sample.md...');
const samplePath = path.join(__dirname, 'sample.md');
const content = fs.readFileSync(samplePath, 'utf8');
console.log(`File length: ${content.length} bytes`);
console.log(`Grapheme count: ${countGraphemes(content)}`);

// Test 2: Parse annotations (should be empty initially)
console.log('\nTest 2: Parsing annotations...');
const { text, annotations, raw } = parseAnnotations(content);
console.log(`Text length: ${countGraphemes(text)} graphemes`);
console.log(`Annotations found: ${Object.keys(annotations).length}`);
console.log(`Raw annotation block: ${raw || '(none)'}`);

// Test 3: Add &Claude annotation for entire file (kind='Other' for AI)
console.log('\nTest 3: Adding &Claude annotation (AI)...');
const textLength = countGraphemes(text);
const newAnnotations = addAuthorAnnotation(annotations, 'Claude', [{ start: 0, length: textLength }], 'Other');
console.log(`Updated annotations:`, newAnnotations);

// Test 4: Generate file with annotations
console.log('\nTest 4: Generating annotated file...');
const annotatedContent = generateFileContent(text, newAnnotations);
console.log('Generated content:');
console.log('---');
console.log(annotatedContent);
console.log('---');

// Test 5: Write annotated file
console.log('\nTest 5: Writing annotated file...');
const outputPath = path.join(__dirname, 'sample-annotated.md');
fs.writeFileSync(outputPath, annotatedContent, 'utf8');
console.log(`Written to: ${outputPath}`);

// Test 6: Parse and verify annotated file
console.log('\nTest 6: Parsing and verifying annotated file...');
const annotatedParsed = parseAnnotations(annotatedContent);
console.log(`Text length: ${countGraphemes(annotatedParsed.text)} graphemes`);
console.log(`Annotations found: ${Object.keys(annotatedParsed.annotations).length}`);
console.log('Annotations:', JSON.stringify(annotatedParsed.annotations, null, 2));

const verification = verifyAnnotations(annotatedParsed.text, annotatedParsed.annotations);
console.log(`\nVerification: ${verification.valid ? '✓ VALID' : '✗ INVALID'}`);
if (verification.error) {
  console.log(`Error: ${verification.error}`);
}

console.log('\n=== Test Complete ===');
