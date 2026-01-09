# Future Implementation: API Key Authentication

This document outlines how to implement API key authentication when you're ready (e.g., when upgrading to n8n Cloud paid plan, moving to self-hosted n8n, or deploying to production).

## When to Implement

✅ **Implement API key authentication when:**
- Deploying to production
- Exposing n8n webhook publicly
- Need to secure your workflow
- Have access to n8n environment variables (paid plan or self-hosted)
- Want to prevent unauthorized access

❌ **You can skip API key authentication for:**
- Local development
- Internal/private networks only
- Testing and development workflows
- When using n8n Cloud free plan (no environment variables)

## Quick Reference

### Option 1: n8n Environment Variables (Recommended for Production)

**Requirements**: n8n Cloud paid plan OR self-hosted n8n

**Steps**:
1. Generate API key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Add to n8n: Settings → Environment Variables → `MERGE_SENSE_API_KEY`
3. Add to VS Code: `mergeSenseAI.apiKey` in settings.json
4. Update workflow: Add IF node to validate `Authorization: Bearer <key>` header

**See**: `API_KEY_SETUP.md` for complete instructions.

---

### Option 2: Hardcode in Workflow (Development Only)

**Use when**: You don't have environment variables but want basic protection for development.

**Steps**:

1. **Generate API key**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Add to VS Code settings** (`settings.json`):
   ```json
   {
     "mergeSenseAI.apiKey": "your-generated-key-here"
   }
   ```

3. **Add IF node in n8n workflow** after Webhook:
   - **Condition**: `String`
   - **Value 1**: `{{ $json.headers.authorization }}`
   - **Operation**: `Contains` or `Equal`
   - **Value 2**: `Bearer your-generated-key-here` (hardcoded)

4. **Add Respond to Webhook** for FALSE branch:
   - Status: `401`
   - Body: `{ "error": "Unauthorized" }`

⚠️ **Security Warning**: This hardcodes the API key in your workflow. Anyone with access to your n8n workflow can see it. Only use for development/internal use.

---

### Option 3: Skip for Now (Current Setup)

**Use when**: Local development, internal network, or testing.

**Current behavior**:
- Extension works without API key
- Set `mergeSenseAI.apiKey` to empty string or omit it
- n8n workflow processes all requests (no validation)

**Security**: 
- Only expose webhook URL to trusted users
- Use HTTPS in production
- Consider firewall rules or IP whitelisting for basic protection

---

## Migration Path

When you're ready to add API key authentication:

### Step 1: Generate and Store API Key
```bash
# Generate key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Save securely (don't commit to git)
# Example: sk_mergesense_dev_abc123...
```

### Step 2: Update VS Code Settings
```json
{
  "mergeSenseAI.apiKey": "sk_mergesense_dev_abc123..."
}
```

### Step 3: Update n8n Workflow

**If you have environment variables** (paid plan/self-hosted):
- Use `{{ $env.MERGE_SENSE_API_KEY }}` in IF node

**If you don't have environment variables**:
- Hardcode the key in IF node (Option 2 above)
- Plan migration to environment variables when possible

### Step 4: Test Authentication
- Test with valid key → Should work
- Test with invalid key → Should return 401
- Test without key → Should return 401 (if validation enabled)

### Step 5: Deploy to Production
- Use environment variables in production
- Rotate keys periodically
- Monitor authentication failures in logs

---

## n8n Environment Variable Access

### Self-Hosted n8n (Free)
✅ Environment variables are available
- Settings → Environment Variables
- Or via `.env` file or environment setup

### n8n Cloud Free Plan
❌ No environment variables
- Workaround: Hardcode in workflow (Option 2)
- Upgrade to paid plan for environment variables

### n8n Cloud Paid Plan
✅ Environment variables available
- Settings → Environment Variables
- Encrypted storage
- Recommended for production

---

## Security Best Practices (When Implementing)

1. **Use Strong Keys**: Minimum 32 characters, random
2. **Rotate Regularly**: Change keys every 90 days
3. **Different Keys**: Use different keys for dev/staging/prod
4. **Use HTTPS**: Never send API keys over HTTP
5. **Monitor Logs**: Watch for authentication failures
6. **Rate Limiting**: Add rate limiting in n8n workflow
7. **IP Whitelisting**: Combine with IP restrictions if possible

---

## Testing Checklist (When Ready)

- [ ] API key generated and stored securely
- [ ] Added to VS Code settings (`mergeSenseAI.apiKey`)
- [ ] Added to n8n (environment variable or hardcoded)
- [ ] Workflow validates `Authorization: Bearer <key>` header
- [ ] Test with valid key → Works ✅
- [ ] Test with invalid key → 401 error ✅
- [ ] Test without key → 401 error ✅
- [ ] Extension shows proper error messages
- [ ] Production deployment with HTTPS

---

## Current Status

**API Key Authentication**: ⏸️ **Deferred for Future Implementation**

**Reason**: n8n Cloud environment variables require paid plan

**Recommended Next Steps**:
1. Continue development without API key validation
2. Use local/internal networks for security
3. Implement when upgrading to paid plan OR moving to self-hosted n8n
4. See `API_KEY_SETUP.md` for complete implementation guide when ready

---

## Resources

- **Complete Setup Guide**: `API_KEY_SETUP.md`
- **n8n Environment Variables**: https://docs.n8n.io/hosting/configuration/environment-variables/
- **n8n Cloud Plans**: https://n8n.io/pricing/

