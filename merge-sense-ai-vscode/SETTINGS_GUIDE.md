# Settings Configuration Guide

## How to Add the Webhook URL to settings.json

The `settings.json` file is a JSON object, so you need to add it as a property. Here's how:

### Step-by-Step

1. **Open settings.json**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type: "Preferences: Open User Settings (JSON)"
   - Press Enter

2. **Add the configuration**

   Your `settings.json` file should look like this:

   ```json
   {
     "mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve",
     "other.setting": "value"
   }
   ```

   **Important Notes:**
   - If the file is **empty**, just add the object:
     ```json
     {
       "mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve"
     }
     ```

   - If the file **already has settings**, add a comma after the last setting and add the new line:
     ```json
     {
       "editor.fontSize": 14,
       "editor.tabSize": 2,
       "mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve"
     }
     ```

   - **Always use commas** between properties (except the last one)
   - **No trailing comma** after the last property

### Common Mistakes to Avoid

❌ **Wrong** - Missing comma:
```json
{
  "editor.fontSize": 14
  "mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve"
}
```

❌ **Wrong** - Trailing comma:
```json
{
  "mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve",
}
```

❌ **Wrong** - Not inside the object:
```json
{
  "editor.fontSize": 14
}
"mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve"
```

✅ **Correct**:
```json
{
  "editor.fontSize": 14,
  "mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve"
}
```

### Example: Complete settings.json

Here's what a typical `settings.json` might look like with the MergeSense AI setting:

```json
{
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "files.autoSave": "afterDelay",
  "mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve"
}
```

### Verify It Works

After saving `settings.json`, you can verify the setting is loaded:
1. Open Settings UI (`Ctrl+,` or `Cmd+,`)
2. Search for "MergeSense AI"
3. You should see the webhook URL you just set

### Troubleshooting

If you get a JSON error:
- Make sure all strings are in double quotes `"` (not single quotes `'`)
- Make sure there are no trailing commas
- Make sure all opening braces `{` have closing braces `}`
- Use a JSON validator if needed

