# Screenshots Directory

This directory contains screenshots and images for the documentation.

## Adding Screenshots

1. **Take screenshots** of the extension in action
2. **Save them here** with descriptive names:
   - `status-bar-conflict-detected.png`
   - `panel-resolving.png`
   - `results-high-confidence.png`
   - `success-toast.png`
   - etc.

3. **Use in README.md**:
   ```markdown
   ![Alt text](docs/images/filename.png)
   ```

## Recommended Screenshots

Based on the DEMO.md guide, capture these screenshots:

### Essential Screenshots

- [ ] Status bar showing conflict detected
- [ ] Notification prompt
- [ ] Panel with conflict loaded
- [ ] Loading/resolving state
- [ ] Results with high confidence badge
- [ ] Side-by-side diff view
- [ ] Success toast notification
- [ ] Status bar showing success

### Optional (Nice to Have)

- [ ] Command palette showing commands
- [ ] Settings UI showing configuration
- [ ] Error states
- [ ] Low/medium confidence badges
- [ ] Demo mode panel

## Naming Convention

Use descriptive names:
- `feature-state.png` (e.g., `status-bar-conflict-detected.png`)
- `feature-action-result.png` (e.g., `panel-resolving-loading.png`)
- `feature-detail.png` (e.g., `confidence-badge-high.png`)

## Image Guidelines

- **Format**: PNG for screenshots (better quality for UI)
- **Size**: Keep files reasonable (use tools to compress if >500KB)
- **Dimensions**: 
  - Full screenshots: 1920x1080 or similar
  - Cropped highlights: Focus on the feature (e.g., 800x600)
- **Naming**: Use kebab-case (lowercase with hyphens)

## Tools for Screenshots

### Windows
- **Snipping Tool**: Built-in screenshot tool
- **Windows + Shift + S**: Built-in screenshot shortcut
- **ShareX**: Free, powerful screenshot tool with annotations

### Mac
- **Cmd + Shift + 4**: Screenshot selection
- **Cmd + Shift + 3**: Full screen screenshot
- **Skitch**: Free annotation tool

### Linux
- **Flameshot**: Excellent screenshot tool
- **GNOME Screenshot**: Built-in tool

## Compressing Images

If images are too large, compress them:

```bash
# Using ImageMagick (install first)
convert input.png -quality 85 -resize 1920x1080> output.png

# Using online tools
# - TinyPNG: https://tinypng.com/
# - Squoosh: https://squoosh.app/
```

## Annotating Screenshots

Add annotations to highlight features:
- Arrows pointing to important UI elements
- Text labels explaining what's happening
- Red boxes around key features
- Numbered callouts for multi-step processes

Tools:
- **Windows**: Paint, Snip & Sketch
- **Mac**: Preview (built-in annotation)
- **Online**: Photopea, Canva

