#!/usr/bin/env node

/**
 * Auto-annotation script for Claude Code PostToolUse hook
 * Automatically adds authorship annotations when Claude edits files
 */

const fs = require('fs');
const path = require('path');

// Import core libraries
const { parseAnnotations } = require('./lib/parser');
const { addAuthorAnnotation, generateFileContent, calculateNewRanges } = require('./lib/generator');

/**
 * Load plugin configuration
 * @returns {{authorName: string, authorKind: string}} Configuration
 */
function loadConfig() {
  try {
    const pluginJsonPath = path.join(process.env.CLAUDE_PLUGIN_ROOT || '.', 'plugin.json');
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));

    return {
      authorName: pluginJson.config?.authorName || 'Claude',
      authorKind: pluginJson.config?.authorKind || 'Other'
    };
  } catch (error) {
    // Default configuration if plugin.json cannot be read
    return {
      authorName: 'Claude',
      authorKind: 'Other'
    };
  }
}

/**
 * Check if file should be annotated
 * @param {string} filePath - File path
 * @returns {boolean} True if file should be annotated
 */
function shouldAnnotate(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.md', '.txt', '.text'].includes(ext);
}

/**
 * Process file and add annotations
 * @param {string} filePath - Path to file
 * @param {string} toolName - Name of tool that was used (Write or Edit)
 * @param {Object} toolInput - Tool input parameters
 */
function annotateFile(filePath, toolName, toolInput) {
  try {
    // Check if file should be annotated
    if (!shouldAnnotate(filePath)) {
      return;
    }

    // Read current file content
    const currentContent = fs.readFileSync(filePath, 'utf8');

    // Parse existing annotations
    const { text: currentText, annotations: currentAnnotations } = parseAnnotations(currentContent);

    // Load configuration
    const config = loadConfig();
    const authorName = config.authorName;

    // Determine what ranges to annotate based on tool
    let newRanges = [];

    if (toolName === 'Write') {
      // For Write tool, annotate entire file
      const { countGraphemes } = require('./lib/parser');
      const textLength = countGraphemes(currentText);
      newRanges = [{ start: 0, length: textLength }];
    } else if (toolName === 'Edit') {
      // For Edit tool, try to determine what was changed
      // This is a simplified approach - we annotate the entire file
      // A more sophisticated implementation would parse the old_string/new_string
      const { countGraphemes } = require('./lib/parser');
      const textLength = countGraphemes(currentText);

      // In a real implementation, you would:
      // 1. Find the position of old_string in the original text
      // 2. Calculate the position and length of new_string
      // 3. Only annotate the changed range

      // For now, we'll use a simple heuristic:
      // If there are existing annotations, assume this is an incremental edit
      const hasExistingAnnotations = Object.keys(currentAnnotations).length > 0;

      if (!hasExistingAnnotations) {
        // No existing annotations, annotate entire file
        newRanges = [{ start: 0, length: textLength }];
      } else {
        // Has existing annotations, attempt to calculate new ranges
        // This is a placeholder - in practice you'd need to implement proper diff
        // For now, we'll skip auto-annotation for edits with existing annotations
        // to avoid incorrectly attributing human text to Claude
        console.log(`Skipping auto-annotation for ${filePath} (existing annotations found)`);
        return;
      }
    }

    // Skip if no new ranges to annotate
    if (newRanges.length === 0) {
      return;
    }

    // Add author annotation with kind from config
    const authorKind = config.authorKind;
    const updatedAnnotations = addAuthorAnnotation(currentAnnotations, authorName, newRanges, authorKind);

    // Generate new file content with annotations
    const newContent = generateFileContent(currentText, updatedAnnotations);

    // Write updated content back to file
    fs.writeFileSync(filePath, newContent, 'utf8');

    console.log(`Added @${authorName} annotations to ${filePath}`);
  } catch (error) {
    console.error(`Error annotating file ${filePath}:`, error.message);
    // Don't throw - we don't want to break the user's workflow if annotation fails
  }
}

/**
 * Main entry point
 */
function main() {
  try {
    // Log that script is running
    const logPath = '/tmp/ia-writer-annotations-debug.log';
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] Script started\n`);

    // Read hook input from stdin
    const input = fs.readFileSync(0, 'utf8');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] Input: ${input}\n`);
    const hookData = JSON.parse(input);

    // Extract tool information (support both formats)
    const toolName = hookData.tool_name || hookData.tool?.name;
    const toolInput = hookData.tool_input || hookData.tool?.input;

    // Only process Write and Edit tools
    if (!toolName || !['Write', 'Edit'].includes(toolName)) {
      process.exit(0);
    }

    // Extract file path from tool input
    let filePath = null;

    if (toolName === 'Write') {
      filePath = toolInput?.file_path;
    } else if (toolName === 'Edit') {
      filePath = toolInput?.file_path;
    }

    if (!filePath) {
      console.error('No file path found in tool input');
      process.exit(0);
    }

    // Make path absolute if relative
    if (!path.isAbsolute(filePath)) {
      filePath = path.resolve(process.cwd(), filePath);
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(0);
    }

    // Process the file
    annotateFile(filePath, toolName, toolInput);

    // Exit successfully
    process.exit(0);
  } catch (error) {
    console.error('Error in auto-annotate hook:', error.message);
    // Exit with 0 to not block the workflow
    process.exit(0);
  }
}

// Run main function
main();
