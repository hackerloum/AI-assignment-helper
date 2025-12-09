# AI Assignment Helper

A full-stack AI-powered assignment helper web application built for Tanzanian college students. This application provides 5 AI-powered tools with a freemium credit system and local mobile money payment integration.

## 🚀 Features

- **5 AI-Powered Tools:**
  - 📝 Essay Writer - Generate well-structured essays on any topic
  - ✍️ Paraphrase Tool - Rewrite text while maintaining meaning
  - ✓ Grammar Checker - Fix grammar, spelling, and punctuation errors
  - 📚 Citation Generator - Generate citations in APA, MLA, or Chicago formats
  - 📄 Text Summarizer - Summarize long texts into concise summaries

- **Credit System:**
  - Free 50 credits on signup
  - Credit-based usage for all tools
  - Transaction history tracking

- **Payment Integration:**
  - Mobile money payments (M-Pesa, Tigopesa, Airtel Money)
  - Multiple credit packages
  - Secure payment processing

- **User Features:**
  - Secure authentication with Supabase
  - Dashboard with credit balance
  - Assignment history
  - Modern, responsive UI

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** (strict mode)
- **TailwindCSS** + **ShadCN UI**
- **React Hook Form** + **Zod** (validation)
- **Sonner** (toast notifications)
- **Lucide React** (icons)

### Backend
- **Next.js API Routes** (App Router `/app/api`)
- **Server Actions** (for mutations)
- **Supabase** (auth + database)
- **OpenAI API** (GPT-4 for AI features)

### Database
- **Supabase PostgreSQL**
- Row Level Security (RLS)
- Automatic timestamps

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- OpenAI API key
- M-Pesa/Tigopesa API credentials (for production payments)

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-assignment-helper

# Install dependencies
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Get your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory. See `ENV_VARIABLES.md` for a complete reference.

**Required variables:**

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration (REQUIRED for AI features)
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Optional variables (for mobile money payments):**

```env
# Mobile Money Payment Configuration (M-Pesa/Tigopesa) - Optional
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_CALLBACK_URL=http://localhost:3000/api/payments/callback
```

**Important**: 
- See `ENV_VARIABLES.md` for detailed instructions on where to get each variable
- Never commit `.env.local` to Git (it's already in `.gitignore`)
- If you see an error about missing Supabase credentials, visit `/setup` to check your configuration status

### 4. Run Database Migrations

Execute the SQL schema in your Supabase SQL Editor:

```bash
# Copy the contents of supabase/schema.sql and run in Supabase SQL Editor
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
ai-assignment-helper/
├── app/
│   ├── actions/           # Server actions
│   │   ├── ai-actions.ts  # AI tool server actions
│   │   └── payment-actions.ts # Payment processing
│   ├── api/               # API routes
│   │   └── payments/      # Payment endpoints
│   ├── auth/              # Authentication pages
│   ├── tools/             # AI tool pages
│   ├── purchase/          # Credit purchase page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard
│   └── globals.css        # Global styles
├── components/
│   ├── auth/              # Auth components
│   ├── dashboard/         # Dashboard components
│   ├── tools/              # AI tool components
│   ├── purchase/           # Payment components
│   ├── providers/          # Context providers
│   └── ui/                 # ShadCN UI components
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── ai-service.ts      # OpenAI service
│   ├── credits.ts         # Credit management
│   ├── constants.ts       # App constants
│   └── utils.ts           # Utility functions
├── types/
│   └── database.ts        # Database types
├── supabase/
│   └── schema.sql         # Database schema
└── public/                # Static assets
```

## 🎯 Usage

### For Students

1. **Sign Up**: Create an account to receive 50 free credits
2. **Choose Tool**: Select from 5 AI-powered tools
3. **Use Tool**: Enter your input and generate results
4. **Purchase Credits**: Buy more credits via mobile money when needed

### Credit Costs

- Essay Writer: 10 credits
- Paraphrase Tool: 5 credits
- Grammar Checker: 3 credits
- Citation Generator: 2 credits
- Text Summarizer: 4 credits

### Credit Packages

- 100 Credits - TZS 5,000
- 250 Credits - TZS 10,000
- 500 Credits - TZS 18,000
- 1,000 Credits - TZS 30,000

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure authentication with Supabase Auth
- Environment variables for sensitive keys
- Server-side validation for all actions

## 🚢 Deployment

> 📖 **For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Vercel (Recommended)

This project is configured for seamless deployment on Vercel. Follow these steps:

#### Step 1: Prepare Your Repository

1. Push your code to GitHub (or GitLab/Bitbucket)
2. Ensure all your code is committed and pushed

#### Step 2: Deploy to Vercel

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js settings
5. Configure the following:

   **Framework Preset:** Next.js (auto-detected)
   
   **Root Directory:** `./` (default)
   
   **Build Command:** `npm run build` (auto-detected)
   
   **Output Directory:** `.next` (auto-detected)
   
   **Install Command:** `npm install` (auto-detected)

#### Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

**Required Variables:**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Optional Variables (for Mobile Money payments):**

```env
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_CALLBACK_URL=https://your-app.vercel.app/api/payments/callback
```

**How to add environment variables in Vercel:**

1. Go to your project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable for **Production**, **Preview**, and **Development** environments
4. Click **Save**

**Important Notes:**
- `NEXT_PUBLIC_APP_URL` should be your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
- After adding environment variables, you need to **redeploy** for changes to take effect
- Never commit `.env.local` or `.env` files to Git

#### Step 4: Deploy

1. Click **Deploy** in Vercel
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at `https://your-app.vercel.app`

#### Step 5: Update Supabase Settings

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Add your Vercel domain to **Allowed Redirect URLs:**
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**`
4. Save changes

#### Step 6: Verify Deployment

1. Visit your deployed URL
2. Test authentication (sign up/sign in)
3. Test AI tools functionality
4. Check that environment variables are working

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

#### Troubleshooting Vercel Deployment

**Build Errors:**
- Check that all dependencies are in `package.json`
- Ensure TypeScript compiles without errors: `npm run type-check`
- Check build logs in Vercel dashboard

**Environment Variable Issues:**
- Verify all required variables are set in Vercel dashboard
- Ensure variable names match exactly (case-sensitive)
- Redeploy after adding/updating environment variables

**Runtime Errors:**
- Check Vercel function logs in dashboard
- Verify Supabase connection and credentials
- Ensure OpenAI API key is valid and has credits

**Database Connection:**
- Verify Supabase project is active
- Check that RLS policies are correctly configured
- Ensure database schema is applied

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- **Netlify** - Similar to Vercel, supports Next.js
- **Railway** - Good for full-stack apps
- **AWS Amplify** - AWS-managed Next.js hosting
- **DigitalOcean App Platform** - Simple deployment option

### Environment Variables for Production

**Required for all platforms:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `NEXT_PUBLIC_APP_URL` - Your production URL

**Required (for mobile money payments):**
- `ZENOPAY_API_KEY` - ZenoPay API key for processing payments

## 🔄 Mobile Money Integration

The payment system uses **ZenoPay** for mobile money payments in Tanzania. ZenoPay supports all major mobile money providers:
- **M-Pesa** (Safaricom)
- **TigoPesa** (Vodacom)
- **Airtel Money** (Airtel)

### ZenoPay Integration

1. Register for ZenoPay API access
2. Get your API key from the ZenoPay dashboard
3. Add `ZENOPAY_API_KEY` to your environment variables
4. The integration is already implemented and ready to use

**Note**: ZenoPay handles all mobile money providers, so no separate integration is needed for individual providers.

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@example.com or open an issue in the repository.

## 🎓 For Tanzanian Students

This application is specifically designed for Tanzanian college students, with:
- Local currency (TZS) support
- Mobile money payment integration
- Affordable credit packages
- Tools tailored for academic assignments

---

Built with ❤️ for Tanzanian students

