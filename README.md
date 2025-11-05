# iA Writer Annotations Plugin for Claude Code

Automatically add authorship annotations to your text files when Claude Code edits them, using the [iA Writer Markdown Annotations](https://github.com/iainc/Markdown-Annotations) open format.

## Overview

This plugin tracks Claude's contributions to your markdown and text files by automatically appending authorship metadata at the end of files. The annotations are invisible in iA Writer's editor but can be viewed in other text editors, and help you distinguish between human-written and AI-generated content.

## Features

### 🤖 Automatic Annotation
- Automatically annotates files when Claude Code uses `Write` or `Edit` tools
- Tracks character ranges of Claude's contributions
- Validates annotations with SHA-256 hash
- Works seamlessly in the background - no manual intervention required

### 📝 Manual Commands
- `/annotate [author]` - Manually add authorship annotations
- `/show-authors [file]` - Display authorship information for a file
- `/remove-annotations [file]` - Remove all annotations (useful before exporting)

### ⚙️ Configurable
- Default author name: `@Claude`
- Customizable to use `@AI`, `@Bot`, or any other author name
- Per-project or global configuration

### 📄 File Support
- `.md` - Markdown files
- `.txt` - Plain text files
- `.text` - Text files

## Installation

```bash
# Add the plugin marketplace
/plugin marketplace add KazukiYunoue/claude-code-ia-writer-annotations

# Install the plugin
/plugin install ia-writer-annotations

# Enable the plugin (if not auto-enabled)
/plugin enable ia-writer-annotations
```

## Configuration

The plugin can be configured via `.claude-plugin/plugin.json`:

```json
{
  "name": "ia-writer-annotations",
  "version": "1.0.0",
  "config": {
    "authorName": "Claude",
    "authorKind": "Other"
  }
}
```

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `authorName` | `"Claude"` | The author name to use in annotations (e.g., `"AI"`, `"Bot"`) |
| `authorKind` | `"Other"` | The kind of author for iA Writer (either `"Human"` or `"Other"`) |

## Usage

### Automatic Annotation

Once installed, the plugin works automatically:

1. Edit a markdown or text file using Claude Code
2. The plugin automatically appends annotation metadata to the end of the file
3. Open the file in iA Writer to see visual authorship indicators

**Example:**

When Claude writes "Hello, world!" at the beginning of a file, the annotation block is automatically added:

```markdown
Hello, world!

---
Annotations: 0,13 SHA-256 a948904f2f0f479b8f8197694b30184b0d2ed1c1cd2a1ec0fb85d299a192a447
@Claude: 0,13
```

### Manual Commands

#### `/annotate [author]`

Manually add authorship annotations to a file:

```bash
# Annotate with default author (Claude)
/annotate

# Annotate with custom author name
/annotate ChatGPT
```

#### `/show-authors [file]`

Display authorship information for a file:

```bash
/show-authors document.md
```

Output example:
```
Authorship for document.md:
- @Claude: 245 characters (38.5%)
- @Human: 391 characters (61.5%)
Total: 636 characters
```

#### `/remove-annotations [file]`

Remove all annotations from a file (useful before exporting):

```bash
/remove-annotations document.md
```

### Enable/Disable Plugin

Use Claude Code's built-in plugin management:

```bash
# Disable when you don't need annotations
/plugin disable ia-writer-annotations

# Re-enable when needed
/plugin enable ia-writer-annotations
```

## iA Writer Setup

To visualize annotations in iA Writer, you need to register the author:

### On Mac:
1. Open iA Writer
2. Go to **Settings → Authors**
3. Click **+ Add Author**
4. Enter:
   - **Name**: `Claude` (or your configured `authorName`)
   - **Identifier**: `noreply@anthropic.com` (optional)
   - **Kind**: Select `Other` (for AI)
5. Click **Add**

### On iPhone/iPad:
1. Open iA Writer
2. Go to **Settings → Authors**
3. Tap **Add Author…**
4. Enter the same information as above
5. Tap **Add**

Once registered, the author syncs across all your devices via iCloud.

## How It Works

### Markdown Annotations Format

The plugin uses the [Markdown Annotations](https://github.com/iainc/Markdown-Annotations) open format:

```
[Your text content here]

---
Annotations: start,length SHA-256 hash
@AuthorName: start1,length1 start2,length2 ...
```

**Key features:**
- **Character ranges**: Use grapheme cluster indexes (not byte offsets)
- **SHA-256 hash**: Validates the integrity of annotated ranges
- **Multiple authors**: Support for multiple contributors in the same file
- **Portable**: Plain text format that works across editors

### PostToolUse Hook

The plugin registers a `PostToolUse` hook that triggers when Claude Code edits files:

1. Detects `Write` or `Edit` tool usage on `.md`, `.txt`, or `.text` files
2. Calculates character ranges for Claude's changes
3. Parses existing annotations (if any)
4. Merges new annotations with existing ones
5. Recalculates SHA-256 hash
6. Appends/updates annotation block at end of file

### Character Range Calculation

The plugin uses JavaScript's `Intl.Segmenter` API to correctly count grapheme clusters, ensuring proper handling of:
- Emoji (e.g., 👍 counts as 1, not 2 or 4)
- Combined characters (e.g., é as single character)
- Surrogate pairs (e.g., 𝕳𝖊𝖑𝖑𝖔)

This ensures annotations remain valid across different environments and text encodings.

## Limitations

### Current Limitations

**Incremental Edit Tracking Not Supported**

The plugin currently does not track incremental edits to files that already have annotations. This means:

- ✅ **New files created by Claude** (`Write` tool): Fully annotated
- ✅ **Files without existing annotations** (`Edit` tool): Fully annotated
- ❌ **Files with existing annotations** (`Edit` tool): Not updated

When Claude edits a file that already contains annotations (indicating human or previous AI contributions), the plugin conservatively skips auto-annotation to avoid incorrectly attributing human-written content to Claude.

**Workaround**: Use the `/annotate` command to manually add annotations after edits to existing annotated files.

**Future Enhancement**: A future version may implement proper diff tracking to accurately annotate only the changed portions of files with existing annotations.

## Technical Details

### Directory Structure

```
.claude-plugin/
├── plugin.json              # Plugin metadata and configuration
├── commands/
│   ├── annotate.md         # Manual annotation command
│   ├── show-authors.md     # Display authorship info
│   └── remove-annotations.md
├── hooks/
│   └── hooks.json          # PostToolUse hook configuration
└── scripts/
    ├── auto-annotate.js    # Automatic annotation logic
    ├── manual-annotate.js  # Manual annotation handler
    ├── show-authors.js     # Authorship display
    └── lib/
        ├── parser.js       # Annotation parsing
        ├── generator.js    # Annotation generation
        └── hash.js         # SHA-256 calculation
```

### Dependencies

- Node.js (for script execution)
- Built-in `crypto` module (for SHA-256)
- Built-in `Intl.Segmenter` API (for grapheme counting)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development

```bash
# Clone the repository
git clone <repository-url>

# Test locally
/plugin install /path/to/local/plugin

# Make changes and test
/plugin disable ia-writer-annotations
/plugin enable ia-writer-annotations
```

## License

[To be determined]

## Resources

- [iA Writer Markdown Annotations Specification](https://github.com/iainc/Markdown-Annotations)
- [iA Writer Authorship Documentation](https://ia.net/writer/support/editor/authorship)
- [Claude Code Plugins Documentation](https://docs.claude.com/en/docs/claude-code/plugins)

## Acknowledgments

- iA Inc. for creating the Markdown Annotations open format
- Anthropic for Claude Code and the plugin system
