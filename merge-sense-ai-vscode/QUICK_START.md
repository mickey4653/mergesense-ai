# Quick Start Guide

## Setup Steps

1. **Install Dependencies**
   ```bash
   cd merge-sense-ai-vscode
   npm install
   ```

2. **Compile the Extension First** ⚠️ **IMPORTANT**
   ```bash
   npm run compile
   ```
   **You must compile before adding settings!** Otherwise VS Code won't recognize the configuration.

3. **Reload Window**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type: "Developer: Reload Window"
   - This loads the extension's configuration schema

4. **Configure Webhook URL**

   **Option A: Via Settings UI**
   - Open Settings: `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)
   - Search for "MergeSense AI"
   - Set `mergeSenseAI.webhookUrl` to: `http://localhost:5678/webhook/git/conflict/resolve`

   **Option B: Via settings.json (Faster)**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type: "Preferences: Open User Settings (JSON)"
   - Add inside the JSON object (see SETTINGS_GUIDE.md for details):
     ```json
     {
       "mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve"
     }
     ```
     Or if you already have settings, add it with a comma:
     ```json
     {
       "editor.fontSize": 14,
       "mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve"
     }
     ```
   
   **If you see "Unknown Configuration Setting"** → See TROUBLESHOOTING.md

3. **Compile TypeScript**
   ```bash
   npm run compile
   ```

4. **Run Extension**
   - Press `F5` to launch Extension Development Host
   - Or use "Run Extension" from VS Code's Run and Debug panel

## Testing

1. Create a test file with conflict markers:
   ```typescript
   <<<<<<< HEAD
   function greet() {
     console.log("Hello from main");
   }
   =======
   function greet() {
     console.log("Hello from feature");
   }
   >>>>>>> feature-branch
   ```

2. Open the file in VS Code
3. You should see a notification asking to resolve with AI
4. Or use Command Palette: `MergeSense AI: Resolve Conflict with AI`

## Package for Distribution

```bash
npm run package
```

This creates a `.vsix` file that can be installed via:
```bash
code --install-extension merge-sense-ai-0.1.0.vsix
```

## API Key Setup (Optional - Deferred)

API key authentication is **optional** and can be implemented later when needed.

> **💰 Current Status**: API key validation is deferred because n8n Cloud environment variables require a paid plan. The extension works perfectly without API keys for local/development use.

**For now**: Skip API key setup and continue with development.

**When ready to implement**:
1. **Generate an API key** (see `API_KEY_SETUP.md` for detailed instructions)
2. **Add to VS Code settings**: `mergeSenseAI.apiKey`
3. **Configure n8n workflow** to validate the API key (requires paid plan or self-hosted n8n)
4. **Test the authentication**

📖 **Guides**:
- **Future Implementation**: [`FUTURE_API_KEY_IMPLEMENTATION.md`](./FUTURE_API_KEY_IMPLEMENTATION.md) - When and how to implement later
- **Complete Setup**: [`API_KEY_SETUP.md`](./API_KEY_SETUP.md) - Full implementation guide (for when ready)

