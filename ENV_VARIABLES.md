# Environment Variables Reference

This document lists all environment variables required for the AI Assignment Helper application.

## Required Variables

These variables are **required** for the application to function:

### Supabase Configuration

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Where to get them:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Gemini API Configuration

```env
GEMINI_API_KEY=your_gemini_api_key
```

**Where to get it:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key (it's only shown once!)

**Note:** The application uses Google's Gemini 2.5 Flash model for most AI features (essay writing, paraphrasing, grammar checking, citations, summarization, research).

**Note:** The application uses Google's Gemini 2.5 Flash model for PowerPoint presentation generation, providing high-quality presentations with speaker notes, visual suggestions, and better structure.

### SlidesGPT API Configuration (for .pptx File Generation)

```env
SLIDESGPT_API_KEY=your_slidesgpt_api_key
```

**Default API Key:**
The application comes with a default API key pre-configured. You can override it by setting `SLIDESGPT_API_KEY` in your environment variables.

**Where to get it:**
1. Go to [SlidesGPT API](https://api.slidesgpt.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your `.env.local` file

**Note:** This API is used to create actual .pptx PowerPoint files. The API generates presentations based on prompts and returns downloadable .pptx files.

### App Configuration

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Values:**
- **Local development:** `http://localhost:3000`
- **Production (Vercel):** `https://your-app.vercel.app`
- **Custom domain:** `https://yourdomain.com`

## Required Variables (for Payments)

### ZenoPay Configuration

```env
ZENOPAY_API_KEY=your_zenopay_api_key
```

**Where to get it:**
1. Register for ZenoPay API access
2. Get your API key from the ZenoPay dashboard
3. The API key is used for mobile money payments in Tanzania

**Note:** ZenoPay handles all mobile money providers (M-Pesa, TigoPesa, AirtelMoney) through a single API. This is the only payment integration needed.

## Local Development Setup

1. Create a `.env.local` file in the root directory:

```bash
# Copy this template
cp ENV_VARIABLES.md .env.local
```

2. Fill in all required variables with your actual values
3. Never commit `.env.local` to Git (it's in `.gitignore`)

## Vercel Deployment Setup

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add each required variable
3. Select environments: **Production**, **Preview**, **Development**
4. Click **Save**
5. Redeploy your application

## Environment Variable Naming

- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Variables without `NEXT_PUBLIC_` are server-side only (more secure)
- Use `NEXT_PUBLIC_` prefix only when the variable is needed in client-side code

## Security Best Practices

1. ✅ Never commit `.env` or `.env.local` files to Git
2. ✅ Use different API keys for development and production
3. ✅ Rotate API keys regularly
4. ✅ Use Vercel's environment variable encryption
5. ✅ Limit access to service role keys (server-side only)
6. ✅ Monitor API usage and set up alerts

## Verification

After setting up environment variables, verify they're working:

1. **Local:** Check that the app runs without errors: `npm run dev`
2. **Vercel:** Check deployment logs for any missing variable errors
3. **Runtime:** Test authentication and AI features to ensure APIs are connected

## Troubleshooting

### "Missing Supabase environment variables" error

- Check that all three Supabase variables are set
- Verify variable names match exactly (case-sensitive)
- Ensure no extra spaces in values

### "Gemini API error"

- Verify `GEMINI_API_KEY` is correct
- Check Google AI Studio account has quota/credits
- Ensure key hasn't been revoked
- Verify the API key has access to Gemini models


### Authentication not working

- Verify `NEXT_PUBLIC_APP_URL` matches your actual URL
- Check Supabase redirect URLs are configured
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

## Quick Reference

| Variable | Required | Client/Server | Description |
|----------|----------|---------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Client | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Client | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server | Supabase service role key |
| `GEMINI_API_KEY` | ✅ | Server | Google Gemini API key (for all AI features including PowerPoint) |
| `SLIDESGPT_API_KEY` | ⚠️ | Server | SlidesGPT API key (for .pptx file generation, has default value) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Client | Application URL |
| `ZENOPAY_API_KEY` | ✅ | Server | ZenoPay API key for mobile money payments (handles all providers) |

**Legend:** ✅ = Required, ⚠️ = Optional but recommended, ➖ = Optional alternative

