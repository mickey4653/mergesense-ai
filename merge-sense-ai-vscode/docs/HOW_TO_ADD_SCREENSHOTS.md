# How to Add Screenshots to README

Complete guide for adding screenshots and images to your README.md file.

---

## 📁 Step 1: Organize Your Screenshots

### Create the Folder Structure

Screenshots should be stored in `docs/images/`:

```
merge-sense-ai-vscode/
├── docs/
│   ├── images/
│   │   ├── README.md (this guide)
│   │   ├── status-bar-conflict-detected.png
│   │   ├── panel-results.png
│   │   └── ...
│   └── ...
├── README.md
└── ...
```

### Naming Convention

Use descriptive, kebab-case names:
- ✅ `status-bar-conflict-detected.png`
- ✅ `panel-results-high-confidence.png`
- ✅ `success-toast-notification.png`
- ❌ `screenshot1.png`
- ❌ `IMG_1234.png`

---

## 📸 Step 2: Take Screenshots

### What to Capture

Based on the features, capture these screenshots:

#### Essential Screenshots

1. **Status Bar States**
   - Conflict detected: `status-bar-conflict-detected.png`
   - Loading: `status-bar-loading.png`
   - Success: `status-bar-success.png`
   - Error: `status-bar-error.png`

2. **Panel Views**
   - Full panel: `panel-full-view.png`
   - Conflict input: `panel-input.png`
   - Loading state: `panel-resolving.png`
   - Results view: `panel-results.png`
   - Diff view: `panel-diff-view.png`

3. **UI Elements**
   - Confidence badges: `confidence-badges.png`
   - Action buttons: `action-buttons.png`
   - Success toast: `success-toast.png`
   - Notification: `notification-conflict-detected.png`

4. **Workflow**
   - Quick demo GIF: `demo-quick-start.gif` (animated)
   - Full workflow: `workflow-full.gif` (animated)

### How to Take Screenshots

#### Windows
1. **Use Snipping Tool**:
   - Press `Windows + Shift + S`
   - Select area to capture
   - Save to `docs/images/`

2. **Full Screen**:
   - Press `PrtScn` (Print Screen)
   - Paste in Paint or Snip & Sketch
   - Crop and save

#### Mac
1. **Selection**:
   - Press `Cmd + Shift + 4`
   - Select area
   - Image saved to Desktop (move to `docs/images/`)

2. **Window**:
   - Press `Cmd + Shift + 4`, then `Space`
   - Click window to capture
   - Image saved to Desktop

#### Linux
1. **Flameshot** (recommended):
   ```bash
   flameshot gui
   ```
   - Select area
   - Save to `docs/images/`

2. **GNOME Screenshot**:
   - Press `Print Screen`
   - Save dialog appears

---

## ✏️ Step 3: Add to README.md

### Basic Syntax

```markdown
![Alt text that describes the image](docs/images/filename.png)
```

### Examples

#### Simple Image

```markdown
![Status Bar Showing Conflict Detected](docs/images/status-bar-conflict-detected.png)
```

#### Image with Link

```markdown
[![Status Bar](docs/images/status-bar-conflict-detected.png)](docs/images/status-bar-conflict-detected.png)
```

#### Image with Size

```markdown
<img src="docs/images/status-bar-conflict-detected.png" alt="Status Bar" width="600">
```

#### Animated GIF

```markdown
![Quick Demo](docs/images/demo-quick-start.gif)
```

#### Image in a List

```markdown
- **Status Bar**: Shows conflict detection
  ![Status Bar](docs/images/status-bar-conflict-detected.png)
```

#### Image with Caption

```markdown
<figure>
  <img src="docs/images/status-bar-conflict-detected.png" alt="Status Bar">
  <figcaption>Status bar automatically detects conflicts when you open a file</figcaption>
</figure>
```

---

## 🎨 Step 4: Optimize Your Screenshots

### Before Adding to README

1. **Crop unnecessary areas**: Focus on the feature
2. **Compress if needed**: Keep files <500KB for fast loading
3. **Use consistent style**: Same window theme, same zoom level
4. **Add annotations** (optional): Arrows, labels, highlights

### Compression Tools

#### Online Tools
- **TinyPNG**: https://tinypng.com/ (PNG compression)
- **Squoosh**: https://squoosh.app/ (All formats, advanced options)

#### Command Line (ImageMagick)

```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt install imagemagick

# Compress PNG
convert input.png -quality 85 output.png

# Resize and compress
convert input.png -resize 1920x1080> -quality 85 output.png
```

---

## 📝 Step 5: Update README.md

### Where to Add Screenshots

The README already has placeholder comments showing where to add screenshots:

1. **Find the comment**: `<!-- ![Alt text](docs/images/filename.png) -->`
2. **Uncomment it**: Remove `<!--` and `-->`
3. **Update filename**: Change to your actual screenshot name
4. **Update alt text**: Describe what the image shows

### Example Transformation

**Before** (placeholder):
```markdown
<!-- ![Status Bar Showing Conflict](docs/images/status-bar-conflict-detected.png) -->
```

**After** (with actual screenshot):
```markdown
![Status Bar Showing Conflict](docs/images/status-bar-conflict-detected.png)
```

---

## 🎬 Step 6: Create Animated GIFs (Optional)

Animated GIFs are great for showing workflows!

### Tools for Creating GIFs

1. **ScreenToGif** (Windows):
   - Download: https://www.screentogif.com/
   - Record screen → Export as GIF

2. **Kap** (Mac):
   - Download: https://getkap.co/
   - Record screen → Export as GIF

3. **Peek** (Linux):
   ```bash
   sudo apt install peek
   ```
   - Record screen → Save as GIF

4. **Online**: 
   - **EZGIF**: https://ezgif.com/video-to-gif
   - Upload video → Convert to GIF

### GIF Best Practices

- **Keep it short**: 5-10 seconds max
- **Optimize size**: Use tools to reduce file size
- **Loop once or infinite**: Depends on the demo
- **Reasonable dimensions**: 800-1200px width is good

---

## ✅ Checklist

Before committing screenshots:

- [ ] Screenshots saved in `docs/images/` folder
- [ ] Files named descriptively (kebab-case)
- [ ] Images compressed (<500KB if possible)
- [ ] README.md updated with image references
- [ ] All placeholder comments either filled or removed
- [ ] Alt text is descriptive
- [ ] Screenshots are cropped/focused on the feature
- [ ] Consistent style across all screenshots

---

## 🎯 Recommended Screenshot List

### Priority 1 (Must Have)

- [ ] Status bar - conflict detected
- [ ] Panel - full view
- [ ] Panel - results with high confidence
- [ ] Success toast notification

### Priority 2 (Should Have)

- [ ] Status bar - loading state
- [ ] Panel - diff view (side-by-side)
- [ ] Confidence badges (all three states)
- [ ] Quick demo GIF (full workflow)

### Priority 3 (Nice to Have)

- [ ] Command palette showing commands
- [ ] Settings UI
- [ ] Error states
- [ ] Notification prompt
- [ ] Auto-apply button (high confidence)

---

## 💡 Pro Tips

1. **Use a consistent theme**: Dark or light theme, stick with one
2. **Hide personal info**: Blur file paths, usernames, etc.
3. **Highlight key areas**: Use arrows or boxes to point out features
4. **Show context**: Include enough of the UI to understand where things are
5. **Keep it updated**: Update screenshots when UI changes
6. **Test on different screens**: Make sure images look good on mobile too

---

## 🚀 Quick Start

1. **Take a screenshot** of the status bar showing conflict
2. **Save it** as `docs/images/status-bar-conflict-detected.png`
3. **Open README.md** and find the placeholder comment
4. **Uncomment** and update:
   ```markdown
   ![Status Bar Showing Conflict](docs/images/status-bar-conflict-detected.png)
   ```
5. **Commit** your changes!

That's it! 🎉

