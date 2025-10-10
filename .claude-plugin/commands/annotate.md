---
description: Manually add authorship annotations to a file
---

Add authorship annotations to a markdown or text file.

**Usage:**
- `/annotate` - Annotate the current file with default author (Claude)
- `/annotate <author-name>` - Annotate with custom author name
- `/annotate <author-name> <file-path>` - Annotate specific file with author

**Arguments:**
- `$1` - (Optional) Author name (without @ prefix)
- `$2` - (Optional) File path to annotate

**Instructions:**

1. If `$2` (file path) is provided, use that file. Otherwise, ask the user which file to annotate.
2. Check if the file exists and has a supported extension (.md, .txt, .text)
3. Read the file content
4. Parse existing annotations using the parser library
5. Determine the author name:
   - If `$1` is provided, use that as the author name
   - Otherwise, load the default author name from plugin.json config
6. Calculate the range to annotate:
   - If the file has no existing annotations, annotate the entire file
   - If the file has existing annotations, ask the user which range to annotate (or annotate the entire file)
7. Add the author annotation using the generator library
8. Write the updated content back to the file
9. Confirm to the user that annotations were added

**Example outputs:**
- "Added @Claude annotations to document.md (entire file)"
- "Added @Human annotations to notes.txt (characters 0-150)"
- "Updated annotations for article.md"

**Error handling:**
- If file doesn't exist, inform the user
- If file has unsupported extension, inform the user
- If annotation fails, explain the error clearly
