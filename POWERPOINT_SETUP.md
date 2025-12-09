# PowerPoint Generator Setup

## Environment Variables

Add these to your `.env.local` file:

```env
# OpenAI API - For content generation
OPENAI_API_KEY=your_openai_api_key

# PowerPoint Generator API - For .pptx file generation
PPTX_API_BEARER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiaGFja2VybG91bUBnbWFpbC5jb20iLCJuYmYiOiIxNzY1Mjk2Nzg3IiwiZXhwIjoiMTc5NjgzMjc4NyJ9.nAZtXXQLu59D6fNjX5gVIIi0iqqulmUC4VMO2zaN-Jo
```

## Your PowerPoint Generator API Credentials

```
Email: hackerloum@gmail.com
API Key: 246ba6d7-09b7-496a-b44a-3ac2a6c01073
Bearer Token: [added to env above]
```

## Quick Test

1. Add the environment variables above
2. Restart your dev server: `npm run dev`
3. Go to: http://localhost:3000/dashboard/powerpoint
4. Enter a topic like "Introduction to AI"
5. Set slides to 5
6. Choose "Professional" style
7. Click "Generate Presentation"
8. Preview the slides
9. Click "Download PowerPoint (.pptx)" to get the file

## Cost

- 6 credits per presentation generation
- Uses OpenAI API for content
- Uses PowerPoint Generator API for file creation

## Features

✅ AI-generated content with OpenAI GPT-4o-mini
✅ Speaker notes for each slide
✅ Visual suggestions
✅ Multiple export formats (Text, JSON, PowerPoint)
✅ Interactive preview with navigation
✅ Toggle speaker notes
✅ Copy slide content

## Files Changed

1. `lib/powerpoint-service-enhanced.ts` - Main service with OpenAI + PowerPoint API
2. `lib/powerpoint-generator-api.ts` - PowerPoint Generator API integration
3. `app/api/ai/powerpoint/route.ts` - API endpoint
4. `app/(dashboard)/powerpoint/page.tsx` - Enhanced UI
5. `lib/constants.ts` - Added powerpoint to credit costs
6. `lib/credits.ts` - Support for custom credit costs
7. `ENV_VARIABLES.md` - Updated with new variables

## Documentation

- `POWERPOINT_README.md` - Full documentation
- `POWERPOINT_QUICK_START.md` - Quick start guide
- `ENV_VARIABLES.md` - All environment variables

---

Ready to create amazing presentations! 🎉

