# 🤖 MergeSense AI - VS Code Extension

> **AI-powered Git Merge Conflict Resolver** that intelligently resolves merge conflicts using n8n workflows. Save hours of manual conflict resolution with confidence-based AI suggestions.

[![VS Code Version](https://img.shields.io/badge/VS%20Code-1.74%2B-blue)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red)](../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

---

## 🎯 What is MergeSense AI?

MergeSense AI is a VS Code extension that uses AI (via n8n workflows) to automatically resolve Git merge conflicts. Instead of manually comparing `<<<<<<<`, `=======`, and `>>>>>>>` markers, let AI do the heavy lifting while you review and approve.

### ✨ Key Benefits

- ⚡ **Save Time**: Resolve conflicts in seconds instead of minutes
- 🎯 **Smart Suggestions**: AI analyzes context and provides intelligent merges
- 🟢 **Confidence Scoring**: Know when to auto-apply vs. when to review
- 🔒 **Production Ready**: API key authentication, timeout handling, error recovery
- 🎨 **Beautiful UX**: Status bar integration, success toasts, inline previews

---

## 🚀 Quick Demo

![MergeSense AI - Quick Overview](docs/images/MergeSense%201.png)

### Try It Now!

1. **Open a file with conflicts** (or use the demo mode)
   
   ![Conflict Detection and Status Bar](docs/images/Merge%20Sense%200.png)

2. **See the magic happen**:
   ```
   <<<<<<< HEAD
   function calculateTotal(items) {
     return items.reduce((sum, item) => sum + item.price, 0);
   }
   =======
   function calculateTotal(items) {
     let total = 0;
     for (const item of items) {
       total += item.price;
     }
     return total;
   }
   >>>>>>> feature-branch
   ```

3. **Click "Resolve with AI"** → Get intelligent merge:
   ```typescript
   function calculateTotal(items) {
     // Using reduce for better performance and readability
     return items.reduce((sum, item) => sum + item.price, 0);
   }
   ```

4. **Review confidence** → High confidence? Auto-apply! Low confidence? Review first.

### Demo Mode

Want to try without a real conflict? Use the demo mode:

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: `MergeSense: Open Panel`
3. Paste the demo conflict from `test-conflict.ts` or use the default example
4. Click "Analyze Conflict" to see it in action!

---

## Features

- 🤖 **AI-Powered Resolution**: Automatically resolves Git merge conflicts using AI
- 🔍 **Auto-Detection**: Automatically detects conflicts when you open files
- 📝 **Side-by-Side Diff**: View original and resolved code side-by-side
- ✅ **Multiple Options**: Accept HEAD, Incoming, or AI-merged version
- 🎯 **Confidence Scoring**: See AI confidence levels for each resolution
- 🔒 **Production Ready**: API key authentication, timeout handling, and comprehensive error handling
- 🟢 **Smart Confidence Tiers**: 
  - **High (80-100%)**: Auto-apply recommended
  - **Medium (50-79%)**: Review suggested
  - **Low (<50%)**: Manual resolution recommended
- ⚠️ **Enhanced Failure UX**: Clear error messages for timeouts, network errors, and partial merges

## 📦 Installation

### For Development

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd merge-sense-ai-vscode
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Compile the extension**:
   ```bash
   npm run compile
   ```

4. **Run in Extension Development Host**:
   - Press `F5` in VS Code
   - Or use "Run Extension" from the Run and Debug panel
   - A new Extension Development Host window will open

### For Distribution

```bash
npm run package
```

This creates a `.vsix` file that can be installed:

```bash
code --install-extension merge-sense-ai-0.1.0.vsix
```

Or install via VS Code's Extensions panel → "Install from VSIX..."

## Configuration

⚠️ **Important:** You must compile the extension first (`npm run compile`) and reload the window before adding settings, otherwise VS Code won't recognize the configuration.

Set the n8n webhook URL in VS Code/Cursor settings:

### Option 1: Via Settings UI
1. Open Settings:
   - **VS Code/Cursor**: Press `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)
   - Or: File → Preferences → Settings
2. Search for "MergeSense AI"
3. Set `mergeSenseAI.webhookUrl` to your n8n webhook URL:
   ```
   http://localhost:5678/webhook/git/conflict/resolve
   ```

### Option 2: Via settings.json
1. Open Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: "Preferences: Open User Settings (JSON)"
3. Add the settings inside the JSON object:
   
   **If file is empty:**
   ```json
   {
     "mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve",
     "mergeSenseAI.apiKey": "your-api-key-here",
     "mergeSenseAI.timeout": 30000
   }
   ```
   
   **If file already has settings, add with a comma:**
   ```json
   {
     "editor.fontSize": 14,
     "mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve",
     "mergeSenseAI.apiKey": "your-api-key-here",
     "mergeSenseAI.timeout": 30000
   }
   ```
   
   See `SETTINGS_GUIDE.md` for detailed instructions and common mistakes.

### Configuration Options

- **`mergeSenseAI.webhookUrl`** (required): The n8n webhook URL for conflict resolution
  - Default: `http://localhost:5678/webhook/git/conflict/resolve`
  
- **`mergeSenseAI.apiKey`** (optional): API key for authenticating with n8n webhook
  - Sent as `Authorization: Bearer <key>` header
  - Leave empty for development/local use
  - **Security Note**: API keys are stored in VS Code settings (encrypted on disk)
  
- **`mergeSenseAI.timeout`** (optional): Request timeout in milliseconds
  - Default: `30000` (30 seconds)
  - Increase for slower workflows or large conflicts

## 💡 Usage

### Method 1: Automatic Detection (Recommended)

1. **Open a file with Git conflict markers**
2. **Status bar shows**: `$(git-merge) 1 conflict detected`
3. **Notification appears**: "Git conflict detected! Would you like to resolve it with AI?"
4. **Click "Resolve with AI"** → Panel opens automatically

### Method 2: Command Palette

1. **Open Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. **Type**: `MergeSense: Resolve Current Conflict`
3. **Press Enter** → Panel opens with conflict loaded

### Method 3: Status Bar

1. **See conflict indicator** in status bar (bottom right)
2. **Click the status bar item** → Triggers conflict resolution

### Method 4: Demo Mode

1. **Command Palette**: `MergeSense: Open Panel`
2. **Paste demo conflict** (see `test-conflict.ts` for examples)
3. **Click "Analyze Conflict"** → See AI resolution

---

## 🎨 User Experience

![Status Bar Integration](docs/images/Merge%20Sense%20A.png)

### Status Bar Integration

The status bar provides real-time feedback:

- **Conflict Detected**: `$(git-merge) 1 conflict detected` (yellow)
- **Resolving**: `$(loading~spin) Resolving conflict...` (animated)
- **Success**: `$(check) Resolved (85%)` (green, shows confidence)
- **Error**: `$(error) Resolution failed` (red)

**Click the status bar** to trigger resolution!

### Confidence Tiers

#### 🟢 High Confidence (80-100%)
- ✅ **Auto-Apply button appears**
- 🟢 Green badge displayed
- **Safe to apply automatically** - AI is confident in the merge
- **One-click apply** - Applies and saves automatically

#### 🟡 Medium Confidence (50-79%)
- ⚠️ **Review suggested**
- 🟡 Yellow badge displayed
- **Review before applying** - AI suggests a merge but wants your review
- **Manual apply** - Review the diff, then click "Accept AI Merge"

#### 🔴 Low Confidence (<50%)
- ❌ **Manual resolution recommended**
- 🔴 Red badge displayed
- **Review carefully** - AI is uncertain, manual review strongly recommended
- **Use as reference** - Consider using HEAD or Incoming instead

### Success Toast Notifications

After resolving a conflict, you'll see a success toast:

```
✅ Conflict resolved successfully! (85% High confidence)
[View Changes] [Open File]
```

**Actions available**:
- **View Changes**: Scrolls to the resolved conflict in the editor
- **Open File**: Opens the file in a new editor tab
- **Save File**: Manually save (if auto-save was disabled)

### In the Panel

![Conflict Resolver Panel - Full View](docs/images/Merge%20Sense%202.png)

1. **Paste or edit your conflict text** (or it's auto-loaded from the file)

2. **Click "Analyze Conflict"**

3. **Review the AI resolution**:
   - Side-by-side diff view (Original vs Resolved)
   - Confidence badge with tooltip
   - Explanation of the merge

   ![AI Resolution Results with Confidence Score](docs/images/Merge%20Sense%20B.png)

4. **Choose your action**:
   - **Accept HEAD**: Use your current branch version
   - **Accept Incoming**: Use the incoming branch version
   - **Accept AI Merge**: Use the AI-generated merge
   - **Auto-Apply** (high confidence only): One-click apply and save

5. **File is updated automatically** (and saved if using Auto-Apply)

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Package extension
npm run package
```

## Production Hardening Features

### 🔒 Security
- **API Key Authentication**: Secure your n8n webhook with Bearer token authentication
  - Configure `mergeSenseAI.apiKey` in VS Code settings
  - n8n should validate the `Authorization: Bearer <key>` header before processing

### 🧠 Smart Confidence Handling
- **High Confidence (80-100%)**: 
  - ✅ Auto-apply option available
  - 🟢 Green badge displayed
  - Safe to apply without review
  
- **Medium Confidence (50-79%)**: 
  - ⚠️ Review suggested
  - 🟡 Yellow badge displayed
  - Apply after careful review
  
- **Low Confidence (<50%)**: 
  - ❌ Manual resolution recommended
  - 🔴 Red badge displayed
  - Do not apply automatically

### ❌ Enhanced Failure UX
- **Timeout Handling**: Requests timeout after configured duration (default: 30s)
  - Clear error messages for timeout scenarios
  - Configurable timeout via `mergeSenseAI.timeout` setting
  
- **Network Error Detection**: 
  - Detects connection failures
  - Provides troubleshooting steps
  
- **Partial Merge Warnings**: 
  - Detects unresolved conflict markers in AI response
  - Warns before applying incomplete merges
  
- **Authentication Errors**: 
  - Clear messages for 401/403 responses
  - Guides users to check API key configuration

## Requirements

- VS Code 1.74.0+ or Cursor (compatible with VS Code extensions)
- n8n workflow running with webhook endpoint
- Node.js 18+ (for development)
- For production: n8n workflow configured to validate API key (optional but recommended)

## API Key Authentication (Optional - Production)

API key authentication is **optional** and recommended for production deployments. You can skip this for local development.

> **💰 Note**: n8n Cloud environment variables require a paid plan. You can:
> - Skip API key validation for now (works fine for local/development)
> - Use self-hosted n8n (free, supports environment variables)
> - Implement later when ready (see `FUTURE_API_KEY_IMPLEMENTATION.md`)

**When ready to implement**:
1. **Generate API Key**: Use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` or see `API_KEY_SETUP.md`
2. **Add to Settings**: `mergeSenseAI.apiKey` in VS Code settings
3. **Update n8n Workflow**: Validate `Authorization: Bearer <key>` header
4. **Test**: Follow the testing guide in `API_KEY_SETUP.md`

📖 **Guides**:
- **Complete Setup**: [`API_KEY_SETUP.md`](./API_KEY_SETUP.md) - Full implementation guide
- **Future Implementation**: [`FUTURE_API_KEY_IMPLEMENTATION.md`](./FUTURE_API_KEY_IMPLEMENTATION.md) - When and how to implement later

## Cursor Compatibility

This extension works in **Cursor** (the AI-powered code editor) since Cursor is built on VS Code. All VS Code settings and commands work the same way in Cursor.

## 📚 Examples

### Example 1: Simple Function Conflict

**Conflict**:
```typescript
<<<<<<< HEAD
function greet(name: string) {
  return `Hello, ${name}!`;
}
=======
function greet(name: string) {
  console.log(`Greeting ${name}`);
  return `Hello, ${name}!`;
}
>>>>>>> feature-branch
```

**AI Resolution** (High Confidence):
```typescript
function greet(name: string) {
  console.log(`Greeting ${name}`);
  return `Hello, ${name}!`;
}
```

**Explanation**: "Merged both changes: kept the console.log from incoming branch and the return statement from HEAD."

### Example 2: Complex Logic Conflict

**Conflict**:
```typescript
<<<<<<< HEAD
function processData(input: unknown) {
  if (typeof input === 'string') {
    return input.toUpperCase();
  }
  return String(input);
}
=======
function processData(input: any) {
  try {
    return JSON.parse(input).data;
  } catch {
    return input;
  }
}
>>>>>>> feature-branch
```

**AI Resolution** (Medium Confidence - Review Suggested):
```typescript
function processData(input: unknown) {
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return parsed.data || input.toUpperCase();
    } catch {
      return input.toUpperCase();
    }
  }
  return String(input);
}
```

**Explanation**: "Combined both approaches: type-safe check from HEAD with JSON parsing from incoming branch, with proper error handling."

### Example 3: Configuration Conflict

**Conflict**:
```json
<<<<<<< HEAD
{
  "timeout": 5000,
  "retries": 3
}
=======
{
  "timeout": 10000,
  "retries": 5
}
>>>>>>> feature-branch
```

**AI Resolution** (High Confidence):
```json
{
  "timeout": 10000,
  "retries": 5
}
```

**Explanation**: "Used incoming values as they represent more conservative/robust settings (longer timeout, more retries)."

---

## 🎬 Demo Files

Try these demo conflicts to see MergeSense AI in action:

### `test-conflict.ts`

A simple TypeScript conflict for testing:

```typescript
<<<<<<< HEAD
const greeting = "Hello from main branch";
=======
const greeting = "Hello from feature branch";
>>>>>>> feature-branch

console.log(greeting);
```

### Create Your Own Demo

1. Create a file with conflict markers
2. Open it in VS Code
3. See the automatic detection in action!

---

## 🛠️ Troubleshooting

### "Unknown Configuration Setting"

**Problem**: VS Code doesn't recognize `mergeSenseAI.webhookUrl`

**Solution**:
1. Compile the extension: `npm run compile`
2. Reload the window: `Ctrl+Shift+P` → "Developer: Reload Window"
3. Add the setting again

### "No active editor found"

**Problem**: Extension can't find the file with conflicts

**Solution**:
1. Open the file with conflicts in VS Code
2. Make sure the file is the active editor
3. Try the command again

### "Webhook URL not configured"

**Problem**: Extension can't find the n8n webhook URL

**Solution**:
1. Add `mergeSenseAI.webhookUrl` to VS Code settings
2. See [Configuration](#configuration) section above
3. Make sure n8n is running

### Status Bar Not Showing

**Problem**: Status bar item doesn't appear

**Solution**:
1. Open a file with conflict markers
2. The status bar appears automatically when conflicts are detected
3. If it doesn't appear, check VS Code Output panel → "MergeSense AI"

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs**: Open an issue with detailed reproduction steps
2. **Suggest features**: Share your ideas for improvements
3. **Submit PRs**: Fork, make changes, and submit a pull request

### Development Setup

```bash
# Clone the repo
git clone <repo-url>
cd merge-sense-ai-vscode

# Install dependencies
npm install

# Compile
npm run compile

# Watch for changes
npm run watch

# Run extension
# Press F5 in VS Code
```

---

## 📖 Additional Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get up and running in 5 minutes
- **[SETTINGS_GUIDE.md](./SETTINGS_GUIDE.md)** - Detailed configuration guide
- **[API_KEY_SETUP.md](./API_KEY_SETUP.md)** - API key authentication setup
- **[FUTURE_API_KEY_IMPLEMENTATION.md](./FUTURE_API_KEY_IMPLEMENTATION.md)** - When to implement API keys
- **[DEMO.md](./DEMO.md)** - Complete demo guide and presentation script
- **[docs/HOW_TO_ADD_SCREENSHOTS.md](./docs/HOW_TO_ADD_SCREENSHOTS.md)** - Guide for adding screenshots to README

---

## 🙏 Acknowledgments

- Built with [VS Code Extension API](https://code.visualstudio.com/api)
- Powered by [n8n](https://n8n.io/) workflows
- Uses AI for intelligent conflict resolution

---

## 📄 License

See [LICENSE](../LICENSE) file for details

---

## ⭐ Show Your Support

If you find MergeSense AI helpful, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📢 Sharing with your team

**Made with ❤️ for developers who hate merge conflicts**


