# API Key Setup & Testing Guide

Complete walkthrough for generating, configuring, and testing API key authentication.

> **⚠️ Note**: API key authentication is **optional** and recommended for production. You can skip this for development/local use. The extension works without API keys.

> **💰 n8n Cloud Limitation**: Environment variables require a paid plan on n8n Cloud. However, you can:
> - Use self-hosted n8n (free, supports environment variables)
> - Hardcode API key in workflow for development (less secure but works)
> - Skip API key validation entirely for local development
> - Implement later when you upgrade to paid plan or self-host

---

## Step 1: Generate an API Key

You have several options to generate a secure API key:

### Option A: Using Node.js (Recommended)
```bash
# Run in terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output something like:
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Option B: Using PowerShell (Windows)
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Option C: Using Online Generator
Visit: https://www.uuidgenerator.net/api/version4
- Generate a UUID (or multiple for multiple keys)
- Example: `550e8400-e29b-41d4-a716-446655440000`

### Option D: Using OpenSSL (Linux/Mac/Windows with Git Bash)
```bash
openssl rand -hex 32
```

### Option E: Using Python
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Recommended Format**: Use a long random string (at least 32 characters). Save this key securely - you'll need it in both VS Code and n8n.

**Example API Key**: `sk_live_mergesense_a1b2c3d4e5f6789012345678901234567890abcdef`

---

## Step 2: Add API Key to VS Code Settings

### Method A: Via Settings UI
1. **Open Settings**:
   - Press `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)
   - Or: File → Preferences → Settings

2. **Search for "MergeSense AI"**

3. **Find `mergeSenseAI.apiKey`** and enter your generated API key

### Method B: Via settings.json (Faster - Recommended)
1. **Open Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)

2. **Type**: `Preferences: Open User Settings (JSON)`

3. **Add the API key** inside the JSON object:

   **If settings.json is empty:**
   ```json
   {
     "mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve",
     "mergeSenseAI.apiKey": "sk_live_mergesense_a1b2c3d4e5f6789012345678901234567890abcdef",
     "mergeSenseAI.timeout": 30000
   }
   ```

   **If settings.json already has settings:**
   ```json
   {
     "editor.fontSize": 14,
     "editor.fontFamily": "Consolas",
     "mergeSenseAI.webhookUrl": "http://localhost:5678/webhook/git/conflict/resolve",
     "mergeSenseAI.apiKey": "sk_live_mergesense_a1b2c3d4e5f6789012345678901234567890abcdef",
     "mergeSenseAI.timeout": 30000
   }
   ```

4. **Save the file** (`Ctrl+S` or `Cmd+S`)

**⚠️ Important**: 
- Don't commit your API key to git (settings.json might be synced - use workspace settings if needed)
- The key is stored encrypted on disk by VS Code
- You'll need to reload the extension if it's already running

---

## Step 3: Update n8n Workflow to Validate API Key

Your n8n workflow needs to check the `Authorization: Bearer <key>` header before processing.

### Step 3.1: Add API Key to n8n Environment Variables (Recommended)

1. **In n8n**, go to **Settings** → **Environment Variables**
2. **Add a new variable**:
   - **Name**: `MERGE_SENSE_API_KEY`
   - **Value**: The same API key you generated (e.g., `sk_live_mergesense_a1b2c3d4e5f6789012345678901234567890abcdef`)
   - **Encrypt**: ✅ (recommended)

### Step 3.2: Update Your n8n Workflow

Add a **"IF" node** right after your **Webhook** node to validate the API key:

#### Option A: Using IF Node (Visual Method)

1. **Add an "IF" node** after your Webhook node
2. **Configure the IF node**:
   - **Condition**: `String`
   - **Value 1**: `{{ $json.headers.authorization }}`
   - **Operation**: `Contains`
   - **Value 2**: `Bearer {{ $env.MERGE_SENSE_API_KEY }}`

   Or more precise:
   - **Value 1**: `{{ $json.headers.authorization }}`
   - **Operation**: `Equal`
   - **Value 2**: `Bearer {{ $env.MERGE_SENSE_API_KEY }}`

3. **Add a "Respond to Webhook" node** for unauthorized (FALSE branch):
   - **Status Code**: `401`
   - **Body**: 
     ```json
     {
       "error": "Unauthorized",
       "message": "Invalid or missing API key"
     }
     ```

4. **Connect nodes**:
   ```
   Webhook → IF Node
              ├─ TRUE (valid key) → Continue to your workflow
              └─ FALSE (invalid key) → Respond to Webhook (401)
   ```

#### Option B: Using Code Node (More Flexible)

1. **Add a "Code" node** after your Webhook node
2. **Name it**: "Validate API Key"
3. **Set Mode**: `Run Once for All Items`
4. **Add this code**:

```javascript
// Get the Authorization header
const authHeader = $input.all()[0].json.headers?.authorization || '';
const expectedKey = process.env.MERGE_SENSE_API_KEY;

// Check if API key is provided
if (!expectedKey) {
  // If no API key is configured in n8n, allow all requests (for development)
  return $input.all();
}

// Extract Bearer token from header
const bearerToken = authHeader.startsWith('Bearer ') 
  ? authHeader.substring(7).trim() 
  : null;

// Validate API key
if (!bearerToken || bearerToken !== expectedKey) {
  // Return error response
  return [{
    json: {
      error: 'Unauthorized',
      message: 'Invalid or missing API key. Please check your mergeSenseAI.apiKey in VS Code settings.',
      statusCode: 401
    },
    statusCode: 401
  }];
}

// API key is valid - continue with original data
return $input.all();
```

5. **Add a "Switch" node** after the Code node:
   - **Mode**: `Route`
   - **Rules**: 
     - **Rule 1**: `{{ $json.statusCode }}` equals `401` → Connect to Error Response
     - **Default**: Continue to your workflow

6. **Add "Respond to Webhook" for errors**:
   - **Status Code**: `{{ $json.statusCode }}`
   - **Body**: `{{ $json }}`

#### Option C: Direct in Webhook Node (Simplest for Testing)

1. **Edit your Webhook node**
2. **In the "Response" tab**, add:
   - **Response Mode**: `Using 'Respond to Webhook' Node`
   - **Response Code**: `401` for unauthorized

3. **Add "IF" node** to check authorization header (as in Option A)

---

### Step 3.3: Test the n8n Workflow Validation

1. **Start/activate your n8n workflow**

2. **Test with Postman or curl**:

   **Test 1: Valid API Key** (should work):
   ```bash
   curl -X POST http://localhost:5678/webhook/git/conflict/resolve \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer sk_live_mergesense_a1b2c3d4e5f6789012345678901234567890abcdef" \
     -d '{
       "fileName": "test.ts",
       "conflictText": "<<<<<<< HEAD\nconst x = 1;\n=======\nconst x = 2;\n>>>>>>> branch"
     }'
   ```
   **Expected**: Should process normally

   **Test 2: Invalid API Key** (should return 401):
   ```bash
   curl -X POST http://localhost:5678/webhook/git/conflict/resolve \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer wrong-key-12345" \
     -d '{
       "fileName": "test.ts",
       "conflictText": "<<<<<<< HEAD\nconst x = 1;\n=======\nconst x = 2;\n>>>>>>> branch"
     }'
   ```
   **Expected**: Should return `401 Unauthorized`

   **Test 3: Missing API Key** (should return 401):
   ```bash
   curl -X POST http://localhost:5678/webhook/git/conflict/resolve \
     -H "Content-Type: application/json" \
     -d '{
       "fileName": "test.ts",
       "conflictText": "<<<<<<< HEAD\nconst x = 1;\n=======\nconst x = 2;\n>>>>>>> branch"
     }'
   ```
   **Expected**: Should return `401 Unauthorized`

---

## Step 4: Test All Features in VS Code Extension

### Prerequisites
1. **Compile the extension**:
   ```bash
   cd merge-sense-ai-vscode
   npm run compile
   ```

2. **Reload the Extension Development Host window**:
   - Press `Ctrl+Shift+P`
   - Type: `Developer: Reload Window`
   - Press Enter

3. **Ensure n8n is running** and workflow is active

---

### Test 1: High Confidence Merge (Auto-Apply Button)

**Goal**: Verify that high confidence merges (≥80%) show the Auto-Apply button.

1. **Create a test file** `test-high-confidence.ts`:
   ```typescript
   <<<<<<< HEAD
   function calculateSum(a: number, b: number): number {
     return a + b;
   }
   =======
   function calculateSum(a: number, b: number): number {
     return a + b;
   }
   >>>>>>> feature-branch
   ```

2. **Ensure your n8n workflow returns high confidence**:
   - In your n8n workflow, set `confidence: 0.85` (or any value ≥ 0.8)
   - Make sure the merged code is clean (no conflict markers)

3. **Test in VS Code**:
   - Open the test file in Extension Development Host
   - Press `Ctrl+Shift+P` → `MergeSense AI: Resolve Conflict with AI`
   - Or the panel should open automatically
   - Click **"Analyze Conflict"**

4. **Expected Results**:
   - ✅ Status alert shows: `🟢 High confidence merge (85%) — Auto-apply recommended`
   - ✅ Confidence badge shows: `🟢 High Confidence: 85%`
   - ✅ **Auto-Apply button is visible** and enabled
   - ✅ Confidence info box shows: `Auto-apply recommended`
   - ✅ Green styling (high-confidence badge)

5. **Test Auto-Apply**:
   - Click **"Auto-Apply (High Confidence)"**
   - File should be updated automatically
   - Success message should appear

---

### Test 2: Low Confidence Merge (Warning Message)

**Goal**: Verify that low confidence merges (<50%) show warnings.

1. **Create a test file** `test-low-confidence.ts`:
   ```typescript
   <<<<<<< HEAD
   function processData(input: unknown) {
     // Complex logic here
     return input;
   }
   =======
   function processData(input: any) {
     // Different complex logic
     return JSON.parse(JSON.stringify(input));
   }
   >>>>>>> feature-branch
   ```

2. **Ensure your n8n workflow returns low confidence**:
   - In your n8n workflow, set `confidence: 0.45` (or any value < 0.5)
   - Or modify your AI prompt to return lower confidence for complex conflicts

3. **Test in VS Code**:
   - Open the test file
   - Click **"Analyze Conflict"**

4. **Expected Results**:
   - ⚠️ Status alert shows: `🔴 Low confidence merge (45%) — Manual resolution recommended`
   - 🔴 Confidence badge shows: `🔴 Low Confidence: 45%`
   - ❌ **Auto-Apply button is hidden** (not visible)
   - 🔴 Confidence info box shows: `Manual resolution warning`
   - Red styling (low-confidence badge)
   - Warning message in explanation

5. **Verify Options**:
   - "Accept HEAD", "Accept Incoming", and "Accept AI Merge" buttons should still be available
   - User can manually choose which version to accept

---

### Test 3: Medium Confidence Merge (Review Suggested)

**Goal**: Verify medium confidence merges (50-79%) show review suggestion.

1. **Modify your n8n workflow** to return `confidence: 0.65` (between 0.5 and 0.8)

2. **Test in VS Code** with any conflict

3. **Expected Results**:
   - 🟡 Status alert shows: `🟡 Medium confidence merge (65%) — Review suggested before applying`
   - 🟡 Confidence badge shows: `🟡 Medium Confidence: 65%`
   - ❌ **Auto-Apply button is hidden**
   - 🟡 Confidence info box shows: `Review suggested`
   - Yellow styling (medium-confidence badge)

---

### Test 4: Timeout Handling

**Goal**: Verify timeout errors are handled gracefully.

1. **Stop your n8n service** (or use a non-existent webhook URL temporarily)

2. **Update webhook URL in settings.json** to a slow/non-responsive endpoint:
   ```json
   {
     "mergeSenseAI.webhookUrl": "http://localhost:9999/nonexistent"
   }
   ```

   Or better: **Temporarily increase timeout** to see it faster:
   ```json
   {
     "mergeSenseAI.timeout": 5000
   }
   ```
   (5 seconds for faster testing)

3. **Test in VS Code**:
   - Click **"Analyze Conflict"**

4. **Expected Results**:
   - ⏱️ Error message shows: `⏱️ Request timed out after 5 seconds. The n8n workflow may be taking too long or experiencing issues. Please try again or check your workflow configuration.`
   - Error displayed in red error box
   - Loading spinner stops
   - Result panel is hidden

5. **Restore settings**:
   - Set correct webhook URL
   - Set timeout back to `30000` (30 seconds)
   - Start n8n again

---

### Test 5: API Key Authentication

**Goal**: Verify API key validation works and shows proper errors.

#### Test 5A: Valid API Key

1. **Ensure**:
   - API key is set in VS Code settings: `mergeSenseAI.apiKey`
   - Same API key is configured in n8n workflow
   - n8n workflow validates the API key

2. **Test in VS Code**:
   - Click **"Analyze Conflict"**

3. **Expected Results**:
   - ✅ Request succeeds
   - ✅ Conflict is resolved
   - ✅ Check n8n workflow execution logs to confirm API key was received

#### Test 5B: Invalid API Key

1. **Temporarily set wrong API key** in settings.json:
   ```json
   {
     "mergeSenseAI.apiKey": "wrong-key-12345"
   }
   ```

2. **Test in VS Code**:
   - Click **"Analyze Conflict"**

3. **Expected Results**:
   - ❌ Error message shows: `Authentication failed (401). Please check your API key in VS Code settings.`
   - Error displayed in red error box
   - Check VS Code Debug Console (View → Output → MergeSense AI) for detailed logs

4. **Restore correct API key**

#### Test 5C: Missing API Key (Optional Test)

1. **Remove API key** from settings.json (or set to empty string)

2. **If n8n requires API key**:
   - Should see `401 Unauthorized` error
   - Message: `Authentication failed (401). Please check your API key in VS Code settings.`

3. **If n8n allows requests without API key** (development mode):
   - Request should work normally
   - Useful for local development

---

### Test 6: Network Error Handling

**Goal**: Verify network errors show helpful messages.

1. **Set incorrect webhook URL**:
   ```json
   {
     "mergeSenseAI.webhookUrl": "http://192.168.1.999:5678/webhook/git/conflict/resolve"
   }
   ```

2. **Test in VS Code**:
   - Click **"Analyze Conflict"**

3. **Expected Results**:
   - 🌐 Error message shows: 
     ```
     🌐 Network error: Could not connect to webhook at http://192.168.1.999:5678/...
     Please ensure:
       • n8n is running
       • The webhook URL is correct
       • There are no firewall/network restrictions
     ```
   - Helpful troubleshooting steps included

4. **Restore correct webhook URL**

---

### Test 7: Partial Merge Detection

**Goal**: Verify partial merges (with conflict markers) are detected.

1. **Modify your n8n workflow** to return a response that still contains conflict markers:
   ```json
   {
     "mergedCode": "<<<<<<< HEAD\nconst x = 1;\n=======\nconst x = 2;\n>>>>>>> branch",
     "confidence": 0.9,
     "explanation": "Partial merge"
   }
   ```

2. **Test in VS Code**:
   - Click **"Analyze Conflict"**

3. **Expected Results**:
   - ⚠️ Status shows: `unresolved`
   - ⚠️ Status alert shows: `⚠️ Conflict not fully resolved — conflict markers still present in merged code. Please review manually.`
   - Warning message in explanation
   - **Auto-Apply button is hidden** (even with high confidence)
   - User should review before applying

---

## Troubleshooting

### API Key Not Working?

1. **Check VS Code settings**:
   - Open settings.json
   - Verify `mergeSenseAI.apiKey` is set correctly
   - Check for typos or extra spaces

2. **Check n8n environment variables**:
   - Go to n8n Settings → Environment Variables
   - Verify `MERGE_SENSE_API_KEY` is set
   - Check the value matches VS Code setting (without "Bearer " prefix)

3. **Check n8n workflow logs**:
   - In n8n, open your workflow execution
   - Check the "Validate API Key" node output
   - Verify the authorization header is being received

4. **Check VS Code Debug Console**:
   - View → Output → Select "MergeSense AI" from dropdown
   - Look for: `MergeSense AI: API key provided: true/false`
   - Check request/response logs

### Auto-Apply Button Not Showing?

1. **Check confidence score**:
   - Must be ≥ 0.8 (80%)
   - Check n8n workflow returns correct confidence value

2. **Check status**:
   - Must be `success` status
   - Check merged code has no conflict markers

3. **Check browser console** (if accessible):
   - Look for JavaScript errors
   - Verify `currentResult.confidence >= 0.8`

### Timeout Too Short/Long?

- **Adjust in settings.json**:
  ```json
  {
    "mergeSenseAI.timeout": 60000  // 60 seconds
  }
  ```
- Default is 30000 (30 seconds)
- Minimum recommended: 10000 (10 seconds)
- Maximum recommended: 120000 (2 minutes)

---

## Summary Checklist

✅ Generate API key using one of the methods  
✅ Add API key to VS Code settings (`mergeSenseAI.apiKey`)  
✅ Add API key to n8n environment variables (`MERGE_SENSE_API_KEY`)  
✅ Update n8n workflow to validate `Authorization: Bearer <key>` header  
✅ Test n8n workflow with Postman/curl (valid, invalid, missing key)  
✅ Compile VS Code extension (`npm run compile`)  
✅ Reload Extension Development Host window  
✅ Test high confidence merge (auto-apply button appears)  
✅ Test low confidence merge (warning message shows)  
✅ Test timeout handling (stop n8n, see timeout error)  
✅ Test API key validation (invalid key shows auth error)  
✅ Test network errors (wrong URL shows helpful message)  
✅ Test partial merge detection (conflict markers detected)  

---

## Production Deployment Notes

1. **Use strong API keys**: At least 32 characters, random
2. **Rotate keys periodically**: Update both VS Code settings and n8n
3. **Use environment-specific keys**: Different keys for dev/staging/prod
4. **Monitor authentication failures**: Check n8n logs for 401 errors
5. **Consider rate limiting**: Add rate limiting in n8n workflow
6. **Use HTTPS in production**: Never send API keys over unencrypted HTTP

---

## Need Help?

- Check VS Code Debug Console (View → Output → MergeSense AI)
- Check n8n workflow execution logs
- Verify all settings are saved and extension is reloaded
- Ensure n8n workflow is active and webhook is reachable

