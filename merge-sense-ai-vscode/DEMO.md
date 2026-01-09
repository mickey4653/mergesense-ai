# 🎬 MergeSense AI - Demo Guide

Complete guide to demonstrating MergeSense AI's capabilities.

---

## 🚀 Quick Demo (2 Minutes)

### Step 1: Create a Test Conflict

Create a file `demo-conflict.ts`:

```typescript
<<<<<<< HEAD
function calculateSum(a: number, b: number): number {
  return a + b;
}
=======
function calculateSum(a: number, b: number): number {
  console.log(`Adding ${a} and ${b}`);
  return a + b;
}
>>>>>>> feature-branch
```

### Step 2: Open in VS Code

1. Open `demo-conflict.ts` in VS Code
2. **Status bar shows**: `$(git-merge) 1 conflict detected`
3. **Notification appears**: "Git conflict detected! Would you like to resolve it with AI?"

### Step 3: Resolve with AI

1. Click **"Resolve with AI"** in the notification
2. Panel opens with conflict loaded
3. Click **"Analyze Conflict"**
4. Watch the magic happen! ✨

### Step 4: Review Results

- **See side-by-side diff**: Original vs Resolved
- **Check confidence**: High/Medium/Low badge
- **Read explanation**: Why AI chose this merge
- **Choose action**: Accept HEAD, Incoming, or AI Merge

### Step 5: Apply

- **High confidence (≥80%)**: Click "Auto-Apply" → Done! ✅
- **Lower confidence**: Review diff, then click "Accept AI Merge"

---

## 📝 Demo Scenarios

### Scenario 1: Simple Merge (High Confidence)

**Conflict**:
```typescript
<<<<<<< HEAD
const API_URL = "https://api.example.com";
=======
const API_URL = "https://api.production.com";
>>>>>>> feature-branch
```

**Expected Result**: 
- High confidence (90%+)
- Auto-Apply button appears
- AI chooses production URL (more specific)

**Demo Points**:
- Show confidence badge (green)
- Demonstrate one-click apply
- Show success toast

---

### Scenario 2: Complex Logic (Medium Confidence)

**Conflict**:
```typescript
<<<<<<< HEAD
function validateEmail(email: string): boolean {
  return email.includes("@") && email.includes(".");
}
=======
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
>>>>>>> feature-branch
```

**Expected Result**:
- Medium confidence (60-70%)
- Review suggested
- AI merges: Uses regex (better validation) but keeps type safety

**Demo Points**:
- Show yellow confidence badge
- Explain why review is needed
- Show side-by-side diff

---

### Scenario 3: Low Confidence (Manual Review)

**Conflict**:
```typescript
<<<<<<< HEAD
async function fetchData() {
  return await fetch("/api/data").then(r => r.json());
}
=======
async function fetchData() {
  const response = await fetch("/api/data");
  if (!response.ok) throw new Error("Failed");
  return await response.json();
}
>>>>>>> feature-branch
```

**Expected Result**:
- Low confidence (<50%)
- Manual resolution recommended
- AI suggests keeping error handling but may be uncertain

**Demo Points**:
- Show red confidence badge
- Explain why manual review is needed
- Show all three options (HEAD, Incoming, AI)

---

## 🎥 Demo Script

### Opening (30 seconds)

> "Merge conflicts are a pain. You spend time comparing `<<<<<<<`, `=======`, and `>>>>>>>` markers, trying to figure out which code to keep. What if AI could do that for you?"

### Live Demo (2 minutes)

1. **Show conflict file** (10 seconds)
   - "Here's a typical merge conflict"
   - Point out conflict markers

2. **Trigger resolution** (20 seconds)
   - Click status bar or command palette
   - "Watch as AI analyzes the conflict"

3. **Show results** (30 seconds)
   - Point out confidence score
   - Show side-by-side diff
   - Read AI explanation

4. **Apply merge** (20 seconds)
   - Click "Auto-Apply" (if high confidence)
   - Show success toast
   - File updated automatically

5. **Show status bar** (20 seconds)
   - Point out status bar updates
   - Show confidence in status bar
   - Click to resolve another conflict

### Closing (30 seconds)

> "That's MergeSense AI. It saves you time, provides confidence scores, and handles the tedious work of merge conflicts. Try it yourself - the demo mode works without a real conflict!"

---

## 🎯 Key Demo Points

### 1. Speed
- **Before**: 5-10 minutes per conflict
- **After**: 10-30 seconds per conflict
- **Show**: Real-time resolution

### 2. Confidence
- **High confidence**: Auto-apply safely
- **Medium confidence**: Review suggested
- **Low confidence**: Manual review needed
- **Show**: Color-coded badges

### 3. Intelligence
- **Context-aware**: Understands code structure
- **Smart merging**: Combines best of both versions
- **Explanations**: Tells you why it chose this merge
- **Show**: AI explanation text

### 4. UX
- **Status bar**: Always visible conflict indicator
- **Notifications**: Non-intrusive prompts
- **Toasts**: Success feedback with actions
- **Show**: All UI elements

---

## 🛠️ Demo Setup Checklist

Before demonstrating:

- [ ] Extension compiled (`npm run compile`)
- [ ] Extension loaded in Extension Development Host
- [ ] n8n workflow running
- [ ] Webhook URL configured in VS Code settings
- [ ] Test conflict files ready
- [ ] Demo mode tested

### Test Files to Prepare

1. **Simple conflict** (high confidence expected)
2. **Complex conflict** (medium confidence expected)
3. **Ambiguous conflict** (low confidence expected)
4. **Multi-file conflict** (if supported)

---

## 💡 Demo Tips

### For Live Presentations

1. **Prepare test conflicts** beforehand
2. **Test n8n workflow** to ensure it returns good results
3. **Have backup conflicts** in case one fails
4. **Show status bar** - it's a great visual indicator
5. **Use demo mode** if n8n isn't available

### For Recordings

1. **Use screen recording** with cursor highlights
2. **Zoom in** on status bar and notifications
3. **Show before/after** code comparison
4. **Highlight confidence badges** and tooltips
5. **Include success toast** in the recording

### For Documentation

1. **Screenshots** of each state (conflict detected, resolving, resolved)
2. **GIFs** showing the full flow
3. **Code examples** with before/after
4. **Video walkthrough** (optional but powerful)

---

## 📸 Screenshot Ideas

1. **Status bar showing conflict detected**
2. **Notification prompt**
3. **Panel with conflict loaded**
4. **Resolving state (loading spinner)**
5. **Results with high confidence badge**
6. **Side-by-side diff view**
7. **Success toast notification**
8. **Status bar showing success**

---

## 🎬 Video Script Template

### Intro (0:00 - 0:15)
- Problem: Merge conflicts are time-consuming
- Solution: AI-powered conflict resolution
- Preview: Quick demo

### Setup (0:15 - 0:30)
- Show conflict file
- Explain conflict markers
- Show status bar detection

### Resolution (0:30 - 1:30)
- Trigger resolution
- Show loading state
- Show results with confidence
- Explain AI reasoning

### Application (1:30 - 2:00)
- Show auto-apply (if high confidence)
- Show success toast
- Show updated file

### Features (2:00 - 2:30)
- Status bar integration
- Confidence tiers
- Multiple resolution options

### Outro (2:30 - 2:45)
- Call to action
- Where to get it
- Next steps

---

## 🚀 Ready to Demo?

1. ✅ Extension compiled and loaded
2. ✅ n8n workflow running
3. ✅ Test conflicts prepared
4. ✅ Demo script ready

**Go ahead and show the magic!** ✨

