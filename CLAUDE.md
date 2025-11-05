# Claude Development Guide

This document provides guidelines for Claude Code when working on this project.

## Project Overview

**iA Writer Annotations Plugin for Claude Code** - A plugin that automatically adds iA Writer-style authorship annotations to files edited by Claude Code.

- **Supported Platform**: Claude Code (Terminal version) only
- **Supported Files**: `.md`, `.txt`, `.text`
- **Core Feature**: Automatic annotation via PostToolUse hook

## Development Workflow

### PR-Based Development

All changes must go through **Pull Requests**. Never commit/push directly to the main branch.

#### 1. Create Branch

```bash
git checkout main
git pull origin main
git checkout -b <prefix>/<description>
```

**Branch Naming Convention:**
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

#### 2. Development & Testing

```bash
# Development work...

# Test plugin locally (Terminal Claude Code only):
# 1. Run: /plugin
# 2. Select: Add marketplace
# 3. Enter path: ./.
# 4. Select: Browse and install plugins
# 5. Install: ia-writer-annotations

# Verify plugin works:
# - Create a new .md file
# - Confirm annotations are added at the end of the file
```

#### 3. Commit

```bash
git add .
git commit -m "appropriate commit message"
```

**Commit Message Convention:**
- `feat: description` - New features
- `fix: description` - Bug fixes
- `docs: description` - Documentation
- `refactor: description` - Code refactoring
- `chore: description` - Build, configuration, etc.

#### 4. Push & Create PR

```bash
git push origin <branch-name>
```

Then create a PR on GitHub and verify:
- Changes are as intended
- README updates are needed
- Version numbers need updating (plugin.json, marketplace.json)

#### 5. Post-Merge Cleanup

```bash
git checkout main
git pull origin main
git branch -d <branch-name>
```

## File Structure

```
.
├── .claude-plugin/
│   ├── plugin.json           # Plugin metadata & config
│   ├── marketplace.json      # Marketplace information
│   └── scripts/
│       ├── auto-annotate.js  # Auto-annotation logic
│       └── lib/
│           ├── parser.js     # Annotation parsing
│           ├── generator.js  # Annotation generation
│           └── hash.js       # SHA-256 calculation
├── test/                     # Test files (gitignored)
├── package.json
├── README.md
└── CLAUDE.md                 # This file
```

## Important Design Decisions

### Why Manual Commands Were Removed (v0.2.0)

- **Reason 1**: Manual annotation operations are more natural in iA Writer itself
- **Reason 2**: PostToolUse hooks don't work in VSCode extension
- **Reason 3**: Focus on automatic annotation for Terminal version users

### Why Terminal Version Only?

The VSCode extension of Claude Code does not support file writes within PostToolUse hooks. This is likely due to:

1. **Infinite Loop Prevention**: Hook writes file → triggers hook again → infinite loop
2. **Security**: Prevents unintended file modifications

## Versioning

Uses Semantic Versioning (`MAJOR.MINOR.PATCH`):

- **MAJOR**: Breaking changes (e.g., API removal)
- **MINOR**: Backward-compatible feature additions
- **PATCH**: Bug fixes

**Files to update when bumping version:**
1. `.claude-plugin/plugin.json` - `version` field
2. `.claude-plugin/marketplace.json` - `plugins[0].version` field

## Testing

### Local Installation

To test the plugin locally in Terminal Claude Code:

1. Run `/plugin` to enter plugin management mode
2. Select `Add marketplace`
3. Enter the path: `./.` (current directory)
4. Select `Browse and install plugins`
5. Install `ia-writer-annotations`

This installs the plugin from the local development directory to `~/.claude/plugins/marketplaces/ia-writer-annotations-marketplace/`

### Verification Tests

Test the following in Terminal Claude Code:

1. **New File Creation**:
   ```
   Write "Hello, world!" to test/new-file.md
   ```
   → Verify annotations are added at end of file

2. **Edit Existing File (No Annotations)**:
   Edit an existing .md file without annotations
   → Verify annotations are added

3. **Edit Existing File (With Annotations)**:
   Edit an existing .md file with annotations
   → Currently skipped (intentional behavior)

## Troubleshooting

### Plugin Not Working

1. Verify using Terminal version of Claude Code
2. Check if plugin is enabled:
   ```bash
   /plugin list
   ```
3. Reinstall locally:
   - Run `/plugin`
   - Select `Add marketplace`
   - Enter path: `./.`
   - Browse and reinstall the plugin

### Annotations Not Added

1. Verify file extension is `.md`, `.txt`, or `.text`
2. Files with existing annotations are skipped (current behavior)

## Future Enhancement Ideas

- [ ] Diff tracking for files with existing annotations
- [ ] VSCode extension support (requires resolving technical constraints)
- [ ] Custom file extension support
- [ ] Annotation statistics display

## References

- [iA Writer Markdown Annotations Specification](https://github.com/iainc/Markdown-Annotations)
- [iA Writer Authorship Feature](https://ia.net/writer/support/editor/authorship)
- [Claude Code Plugins Documentation](https://docs.claude.com/en/docs/claude-code/plugins)

## Notes

- The `test/` directory is gitignored. Do not commit test files
- Remove debug logging from production code
- Be aware of security issues (infinite loops, etc.)
