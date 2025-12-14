# PowerPoint Generator Setup

## Environment Variables

Add these to your `.env.local` file:

```env
# Gemini API - For content generation (same key as other AI features)
OPENAI_API_KEY=your_openai_api_key

# SlidesGPT API - For .pptx file generation (optional, has default)
SLIDESGPT_API_KEY=jm6fbznofjysacspsx653yffstgbij63
```

## SlidesGPT API

The application uses SlidesGPT API for generating .pptx files. A default API key is pre-configured, but you can override it with your own key.

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

✅ AI-generated content with Google Gemini 2.5 Flash
✅ Speaker notes for each slide
✅ Visual suggestions
✅ Multiple export formats (Text, JSON, PowerPoint)
✅ Interactive preview with navigation
✅ Toggle speaker notes
✅ Copy slide content

## Files Changed

1. `lib/powerpoint-service-enhanced.ts` - Main service with Gemini + SlidesGPT API
2. `lib/slidesgpt-service.ts` - SlidesGPT API integration
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

