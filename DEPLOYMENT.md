# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the AI Assignment Helper to Vercel.

## Prerequisites

- A GitHub account with your code pushed to a repository
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Supabase project set up and configured
- Gemini API key

## Quick Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub (or GitLab/Bitbucket)
3. Click **"Import Project"**
4. Select your repository
5. Vercel will auto-detect Next.js settings

### 2. Configure Project Settings

Vercel will auto-detect:
- **Framework Preset:** Next.js
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

You can leave these as default.

### 3. Add Environment Variables

**Before deploying**, add these environment variables in Vercel:

1. In the project import screen, click **"Environment Variables"**
2. Add each variable below:

#### Required Variables

| Variable Name | Description | Where to Get It |
|--------------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | OpenAI API key | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL | Will be `https://your-app.vercel.app` (set after first deploy) |
| `ZENOPAY_API_KEY` | ZenoPay API key for mobile money payments (handles M-Pesa, TigoPesa, AirtelMoney) | ZenoPay Dashboard |

**Important:**
- Add variables for **Production**, **Preview**, and **Development** environments
- After first deployment, update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
- Never commit `.env` files to Git

### 4. Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. Your app will be live at `https://your-app.vercel.app`

### 5. Update Supabase Redirect URLs

After deployment, update Supabase settings:

1. Go to Supabase Dashboard → **Settings** → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs:**
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/**
   ```
3. Add to **Site URL:**
   ```
   https://your-app.vercel.app
   ```
4. Save changes

### 6. Update Environment Variables (Post-Deploy)

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL:
   ```
   https://your-app.vercel.app
   ```
3. Click **"Redeploy"** for changes to take effect

## Using Vercel CLI

Alternatively, you can deploy using the Vercel CLI:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

When using CLI, you'll be prompted to add environment variables interactively.

## Continuous Deployment

Vercel automatically deploys:
- **Production:** Every push to `main` or `master` branch
- **Preview:** Every push to other branches or pull requests

## Environment-Specific Configuration

### Production Environment
- Use production Supabase project
- Use production Gemini API key
- Set `NEXT_PUBLIC_APP_URL` to production URL

### Preview Environment
- Can use same Supabase project or separate test project
- Use same Gemini API key (or separate test key)
- `NEXT_PUBLIC_APP_URL` will be auto-set by Vercel

### Development Environment
- Use local `.env.local` file
- Run `npm run dev` locally

## Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Solution: Add all required environment variables in Vercel dashboard
- Redeploy after adding variables

**Error: TypeScript errors**
- Solution: Run `npm run type-check` locally and fix errors
- Ensure all types are properly defined

**Error: Module not found**
- Solution: Check `package.json` has all dependencies
- Run `npm install` locally to verify

### Runtime Errors

**Error: Supabase connection failed**
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify Supabase project is active
- Check Supabase dashboard for errors

**Error: Gemini API error**
- Verify `OPENAI_API_KEY` is correct
- Check Google AI Studio account has quota/credits
- Review Gemini API status

**Error: Authentication not working**
- Verify Supabase redirect URLs are configured
- Check `NEXT_PUBLIC_APP_URL` matches your Vercel URL
- Review Vercel function logs

### Performance Issues

**Slow API responses**
- Check Vercel function logs for timeout errors
- Consider increasing function timeout in Vercel settings
- Optimize database queries

**Large bundle size**
- Run `npm run build` locally to analyze bundle
- Consider code splitting for large components
- Remove unused dependencies

## Monitoring

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor:
   - Page views
   - Performance metrics
   - Error rates
   - Function execution times

### Logs

View logs in Vercel Dashboard:
- **Deployments** → Select deployment → **Functions** tab
- Real-time logs for debugging

## Custom Domain

To use a custom domain:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain
5. Update Supabase redirect URLs

## Security Checklist

- ✅ All sensitive keys are in environment variables (not in code)
- ✅ `.env` files are in `.gitignore`
- ✅ Supabase RLS policies are enabled
- ✅ API routes have proper authentication
- ✅ Rate limiting is implemented (if needed)
- ✅ HTTPS is enabled (automatic on Vercel)

## Support

For Vercel-specific issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

For project-specific issues:
- Check project README.md
- Review error logs in Vercel dashboard

