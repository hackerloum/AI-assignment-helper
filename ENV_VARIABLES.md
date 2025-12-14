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

### OpenAI API Configuration

```env
OPENAI_API_KEY=your_openai_api_key
```

**Where to get it:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (it's only shown once!)

**Note:** The application uses OpenAI API for all AI features with intelligent model selection based on the task.

**Model Mapping by Feature:**
The application automatically selects the best model and token limit for each feature:

| Feature                | Model Used  | Max Tokens | Description |
| ---------------------- | ----------- | ---------- | ----------- |
| Grammar / Rewrite      | GPT-5 mini  | 800        | Grammar checking with reasoning |
| Assignment Writer      | GPT-5 mini  | 2000       | Essay generation with reasoning |
| Research Assistant     | GPT-5.2     | 3000       | Deep research with advanced reasoning |
| Plagiarism Check       | GPT-5 mini  | 800        | Analysis with reasoning |
| APA Referencing        | GPT-5 mini  | 600        | Citation formatting with reasoning |
| PowerPoint Generation  | GPT-5 mini  | 1200       | Slide generation with reasoning |
| Paraphrasing           | GPT-5 mini  | 800        | Text rephrasing with reasoning |
| Summarization          | GPT-5 mini  | 800        | Summarization with reasoning |
| Humanization           | GPT-5 mini  | 1500       | Content humanization with reasoning |

**Technical Details:**
- API endpoint: `https://api.openai.com/v1/responses`
- Models are automatically selected based on the feature being used
- Token limits include reasoning + output tokens (600-3000 tokens)
- GPT-5 models use reasoning before generating output
- GPT-5.2 with 3000 tokens for research tasks requiring deeper analysis
- GPT-5 mini with 600-2000 tokens for other tasks for optimal performance and cost

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

### "OpenAI API error"

- Verify `OPENAI_API_KEY` is correct
- Check OpenAI account has quota/credits
- Ensure key hasn't been revoked
- Verify the API key has access to both GPT-5 mini and GPT-5.2 models
- Check your OpenAI account's model permissions


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
| `OPENAI_API_KEY` | ✅ | Server | OpenAI API key (for all AI features - auto-selects between GPT-5 mini and GPT-5.2) |
| `SLIDESGPT_API_KEY` | ⚠️ | Server | SlidesGPT API key (for .pptx file generation, has default value) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Client | Application URL |
| `ZENOPAY_API_KEY` | ✅ | Server | ZenoPay API key for mobile money payments (handles all providers) |

**Legend:** ✅ = Required, ⚠️ = Optional but recommended, ➖ = Optional alternative

