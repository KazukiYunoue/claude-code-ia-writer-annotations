---
description: Remove all annotations from a file
---

Remove all authorship annotations from a markdown or text file. This is useful before exporting or sharing files.

**Usage:**
- `/remove-annotations` - Remove annotations from current file
- `/remove-annotations <file-path>` - Remove annotations from specific file

**Arguments:**
- `$1` - (Optional) File path

**Instructions:**

1. If `$1` (file path) is provided, use that file. Otherwise, ask the user which file to clean.
2. Check if the file exists and has a supported extension (.md, .txt, .text)
3. Read the file content
4. Parse existing annotations using the parser library
5. If no annotations found, inform the user that the file has no annotations
6. Extract the text content (without annotation block)
7. Confirm with the user before removing annotations (show them what will be removed)
8. Write the clean text content back to the file (without the annotation block)
9. Confirm to the user that annotations were removed

**Example outputs:**
- "Removed annotations from document.md (2 authors: @Claude, @Human)"
- "No annotations found in notes.txt"
- "Cleaned article.md - removed annotation block"

**Safety considerations:**
- Always confirm with the user before removing annotations
- Show what will be removed (which authors, how many characters annotated)
- Consider suggesting a backup before removal

**Error handling:**
- If file doesn't exist, inform the user
- If file has unsupported extension, inform the user
- If writing fails, explain the error clearly
- If parsing fails, warn that the file may have malformed annotations
