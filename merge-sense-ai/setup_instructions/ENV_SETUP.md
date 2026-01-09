# Environment Variables Setup

## Quick Setup

1. **Create `.env.local` file** in the root of `merge-sense-ai/` directory

2. **Add the following content:**

```env
# Production webhook URL
N8N_WEBHOOK_URL=http://localhost:5678/webhook/git/conflict/resolve
```

3. **For testing/development**, you can temporarily use:
```env
# Test webhook URL
N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/git/conflict/resolve
```

4. **Restart your Next.js dev server** after creating/modifying `.env.local`:
```bash
npm run dev
```

## Environment Variable Reference

- `N8N_WEBHOOK_URL` - The n8n webhook endpoint URL for conflict resolution
  - Production: `http://localhost:5678/webhook/git/conflict/resolve`
  - Test: `http://localhost:5678/webhook-test/git/conflict/resolve`

## Notes

- `.env.local` is already in `.gitignore`, so it won't be committed to git
- Changes to `.env.local` require a server restart to take effect
- For production deployments, set this environment variable in your hosting platform (Vercel, etc.)

