---
description: Display authorship information for a file
---

Display authorship information and statistics for a markdown or text file.

**Usage:**
- `/show-authors` - Show authors for current file
- `/show-authors <file-path>` - Show authors for specific file

**Arguments:**
- `$1` - (Optional) File path to analyze

**Instructions:**

1. If `$1` (file path) is provided, use that file. Otherwise, ask the user which file to analyze.
2. Check if the file exists and has a supported extension (.md, .txt, .text)
3. Read the file content
4. Parse existing annotations using the parser library
5. If no annotations found, inform the user
6. Calculate statistics for each author:
   - Total character count for each author (sum of all their ranges)
   - Percentage of total annotated content
7. Calculate overall statistics:
   - Total character count in file
   - Total annotated character count
   - Percentage of file that is annotated
8. Verify annotation integrity (check SHA-256 hash)
9. Display results in a clear, formatted manner

**Example output:**

```
Authorship for document.md:

Authors:
- @Claude: 245 characters (38.5%)
- @Human: 391 characters (61.5%)

Statistics:
- Total file length: 850 characters
- Annotated content: 636 characters (74.8%)
- Unannotated content: 214 characters (25.2%)

Integrity: ✓ Valid (SHA-256 hash verified)
```

**Error handling:**
- If file doesn't exist, inform the user
- If file has unsupported extension, inform the user
- If hash verification fails, warn the user that annotations may be corrupted
- If parsing fails, explain the error clearly
