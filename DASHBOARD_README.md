# Enterprise-Level Dashboard Documentation

## 🎨 Design Philosophy

This dashboard follows the design principles of industry-leading platforms:
- **Linear** - Clean, fast, professional navigation
- **Vercel Dashboard** - Minimalist, data-focused interface
- **Notion** - Intuitive, organized content structure
- **Stripe Dashboard** - Professional, financial-grade UI

## 🚀 Features Implemented

### ✅ Core Components

1. **Collapsible Sidebar**
   - Smooth animations with Framer Motion
   - Icon-only collapsed state
   - Active route indicators
   - Tooltips in collapsed mode
   - Credit counter integration

2. **Command Palette (⌘K)**
   - Quick navigation to any tool
   - Keyboard shortcuts support
   - Search functionality
   - Arrow key navigation

3. **Top Bar**
   - Breadcrumb navigation
   - Notifications dropdown
   - User profile menu
   - Mobile-responsive

4. **Dashboard Analytics**
   - Real-time credit counter with countdown
   - Weekly usage chart
   - Recent activity feed
   - Quick action cards
   - Stats overview

5. **AI Tool Pages**
   - Research Assistant
   - Grammar & Rewrite
   - Plagiarism Checker
   - APA Referencing
   - PowerPoint Maker

6. **Account Pages**
   - Usage History
   - Subscription Management
   - Settings & Preferences

### 🎯 Key Features

- ✅ Dark mode optimized (primary interface)
- ✅ Mobile-first responsive design
- ✅ Glassmorphism effects
- ✅ Bento-style grid layouts
- ✅ Skeleton loading states
- ✅ Toast notifications (using Sonner)
- ✅ Smooth page transitions
- ✅ Hover states and animations
- ✅ Professional empty states

## 📁 File Structure

```
app/
├── (dashboard)/
│   ├── layout.tsx           # Main dashboard layout with sidebar
│   ├── dashboard/
│   │   └── page.tsx         # Dashboard home page
│   ├── research/
│   │   └── page.tsx         # AI Research Assistant
│   ├── rewrite/
│   │   └── page.tsx         # Grammar & Rewrite tool
│   ├── plagiarism/
│   │   └── page.tsx         # Plagiarism Checker
│   ├── referencing/
│   │   └── page.tsx         # APA Referencing tool
│   ├── powerpoint/
│   │   └── page.tsx         # PowerPoint Maker
│   ├── history/
│   │   └── page.tsx         # Usage History
│   ├── subscription/
│   │   └── page.tsx         # Subscription Plans
│   └── settings/
│       └── page.tsx         # User Settings

components/
├── dashboard/
│   ├── Sidebar.tsx          # Collapsible sidebar with navigation
│   ├── TopBar.tsx           # Top navigation bar
│   ├── MobileNav.tsx        # Mobile drawer navigation
│   ├── CommandPalette.tsx   # ⌘K quick navigation
│   ├── CreditCounter.tsx    # Real-time credit display
│   ├── QuickActions.tsx     # Quick access buttons
│   ├── RecentActivity.tsx   # Activity feed widget
│   └── UsageChart.tsx       # Weekly usage visualization
└── ui/
    └── Breadcrumb.tsx       # Breadcrumb navigation

hooks/
├── useUser.ts               # User authentication hook
└── useCredits.ts            # Credits management hook
```

## 🎨 Color Palette

```css
/* Dashboard Background */
--dashboard-bg: #0A0E27;
--dashboard-surface: #0F172A;
--dashboard-elevated: #1E293B;
--dashboard-border: rgba(255, 255, 255, 0.08);

/* Sidebar */
--sidebar-bg: #0A0E27;
--sidebar-item-hover: rgba(245, 158, 11, 0.1);
--sidebar-item-active: rgba(245, 158, 11, 0.15);

/* Accent Colors */
--accent-primary: #F59E0B;      /* Amber */
--accent-secondary: #3B82F6;    /* Blue */
--accent-success: #10B981;      /* Emerald */
--accent-warning: #F59E0B;      /* Amber */
--accent-danger: #EF4444;       /* Red */

/* Tool Colors */
Research:    #3B82F6 (Blue)
Rewrite:     #8B5CF6 (Purple)
Plagiarism:  #10B981 (Emerald)
Referencing: #F59E0B (Amber)
PowerPoint:  #EC4899 (Pink)
```

## 🔧 Usage

### Accessing the Dashboard

1. Navigate to `/dashboard` after logging in
2. The dashboard layout automatically wraps all routes under `(dashboard)`
3. Authentication is enforced - users are redirected to `/login` if not authenticated

### Keyboard Shortcuts

- `⌘K` or `Ctrl+K` - Open Command Palette
- `↑` `↓` - Navigate in Command Palette
- `Enter` - Select item in Command Palette
- `Esc` - Close Command Palette or Mobile Menu

### Component Usage

#### Using the Credit Counter

```tsx
import { CreditCounter } from '@/components/dashboard/CreditCounter'

// Automatically fetches and displays user credits
<CreditCounter />
```

#### Using Custom Hooks

```tsx
import { useUser } from '@/hooks/useUser'
import { useCredits } from '@/hooks/useCredits'

function MyComponent() {
  const { user, loading } = useUser()
  const { credits, loading: creditsLoading, refresh } = useCredits()
  
  // Access user data and credits
}
```

## 🔐 Authentication Flow

The dashboard uses client-side authentication with the following flow:

1. User accesses dashboard route
2. `useUser` hook checks authentication status
3. If not authenticated → redirect to `/login`
4. If authenticated → render dashboard
5. Credits are fetched from `user_profiles` table

## 📊 Database Schema

The dashboard expects the following Supabase schema:

```sql
-- User profiles table
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  credits INTEGER DEFAULT 3,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription tiers
-- 'free'    : 3 credits/day
-- 'premium' : Unlimited credits (shown as ∞)
-- 'pro'     : Unlimited credits (shown as ∞)
```

## 🎯 Next Steps

### To Integrate AI Functionality:

1. **Research Assistant** (`app/(dashboard)/research/page.tsx`)
   - Connect to OpenAI API or your AI service
   - Implement research generation logic
   - Add result export functionality

2. **Grammar & Rewrite** (`app/(dashboard)/rewrite/page.tsx`)
   - Integrate grammar checking API
   - Add diff viewer for before/after comparison
   - Implement style selection

3. **Plagiarism Checker** (`app/(dashboard)/plagiarism/page.tsx`)
   - Connect to plagiarism detection API
   - Add source attribution
   - Implement detailed similarity reports

4. **APA Referencing** (`app/(dashboard)/referencing/page.tsx`)
   - Complete citation form fields
   - Add bibliography export
   - Support multiple citation styles

5. **PowerPoint Maker** (`app/(dashboard)/powerpoint/page.tsx`)
   - Integrate presentation generation
   - Add template selection
   - Implement slide preview and download

### To Track Usage History:

Create a `usage_history` table:

```sql
CREATE TABLE usage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  tool_name TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Then query this table in the History page.

## 🚦 Running the Dashboard

```bash
# Install dependencies (if not already installed)
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## 📱 Responsive Breakpoints

- Mobile: < 768px (uses MobileNav drawer)
- Tablet: 768px - 1024px
- Desktop: > 1024px (sidebar visible)

## 🎨 Customization

### Changing Brand Colors

Edit `app/globals.css`:

```css
--accent-primary: #YOUR_COLOR;
```

### Modifying Sidebar Items

Edit `components/dashboard/Sidebar.tsx`:

```tsx
const navigation = [
  // Add or remove items here
]
```

### Adjusting Credit Limits

Edit `hooks/useCredits.ts` to change:
- Free tier daily limit (currently 3)
- Unlimited threshold (currently 999)
- Reset time (currently midnight)

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Sidebar not collapsing
Ensure Framer Motion is installed:
```bash
npm install framer-motion
```

### Credits not displaying
Check that `user_profiles` table exists and has proper RLS policies

### Command Palette not opening
- Check keyboard event listeners
- Ensure `CommandPalette` component is rendered in layout
- Test with both `Cmd+K` (Mac) and `Ctrl+K` (Windows)

## 📚 Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **Supabase** - Backend & Auth

## 🎉 Success!

You now have a fully functional, enterprise-level dashboard that matches the quality of Linear, Vercel, Notion, and Stripe! 

The UI is production-ready with:
- ✅ Professional design
- ✅ Smooth animations
- ✅ Mobile responsive
- ✅ Real-time updates
- ✅ Excellent UX

Just add your AI integrations and you're ready to launch! 🚀

