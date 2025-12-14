# PowerPoint Generator Integration

This document explains the enhanced PowerPoint generation feature that creates actual .pptx files using the SlidesGPT API.

## Overview

The PowerPoint tool uses a two-step process:
1. **Content Generation**: Google Gemini 2.5 Flash generates high-quality presentation content with speaker notes, visual suggestions, and structured layouts
2. **File Creation**: SlidesGPT API converts the content into downloadable .pptx files

## Features

### Content Generation (Gemini)
- Professional presentation structure
- Speaker notes for each slide
- Visual suggestions (images, charts, graphics)
- Multiple presentation styles (professional, creative, academic)
- Bullet points with structured content
- Estimated duration calculation

### File Generation (SlidesGPT API)
- Creates actual .pptx PowerPoint files
- Compatible with Microsoft PowerPoint, Google Slides, LibreOffice
- Simple prompt-based generation
- No template files required
- Fast and reliable file generation

## Setup

### 1. Gemini API Key
```env
OPENAI_API_KEY=your-openai-key-here
```
Get it from: https://makersuite.google.com/app/apikey

**Note:** The same Gemini API key used for other AI features works for PowerPoint generation.

### 2. SlidesGPT API Key
```env
SLIDESGPT_API_KEY=your-slidesgpt-key-here
```

**Default API Key:**
The application comes with a default API key pre-configured. You can override it by setting `SLIDESGPT_API_KEY` in your environment variables.

**Where to get it:**
1. Go to [SlidesGPT API](https://api.slidesgpt.com/)
2. Sign up for an account
3. Get your API key from the dashboard

## How It Works

### 1. User Input
- Topic/title
- Number of slides (3-20)
- Presentation style (professional/creative/academic)

### 2. Content Generation
```typescript
// Gemini generates structured content
const presentation = await generatePresentation(topic, slideCount, style)
```

Result includes:
- Title and subtitle
- Slide titles and bullet points
- Speaker notes
- Visual suggestions
- Layout recommendations

### 3. File Creation (Optional)
```typescript
// SlidesGPT API creates .pptx file
const presentation = await generatePresentation(topic, slideCount, style, true)
```

The API formats the content into a prompt and generates a downloadable .pptx file.

## Usage

### Preview Mode (Default)
1. User enters topic and settings
2. Click "Generate Presentation"
3. Preview slides in the UI
4. Download as Text or JSON if needed

### File Download Mode
1. After preview is generated
2. Click "Download PowerPoint (.pptx)"
3. System creates actual PowerPoint file using SlidesGPT
4. File downloads automatically

## API Endpoints

### Generate Preview
```bash
POST /api/ai/powerpoint
Content-Type: application/json
Authorization: Bearer <user-token>

{
  "topic": "Climate Change",
  "slides": 10,
  "style": "professional"
}
```

### Generate File
```bash
POST /api/ai/powerpoint
Content-Type: application/json
Authorization: Bearer <user-token>

{
  "topic": "Climate Change",
  "slides": 10,
  "style": "professional",
  "downloadFile": true
}
```

## SlidesGPT API Integration

The SlidesGPT API works with simple prompts:

1. **Generate Presentation**: Send a prompt to create a presentation
   - Returns: `id`, `embed`, and `download` URLs
   
2. **Download File**: Use the download URL to get the .pptx file
   - Returns: Binary PowerPoint file

### Example Flow
```typescript
// 1. Generate presentation
const response = await generateSlidesGPTPresentation(prompt);
// Returns: { id: "123", embed: "...", download: "..." }

// 2. Download the file
const fileBlob = await downloadSlidesGPTPresentation(response.id);
// Returns: Blob (PowerPoint file)
```

## Credits

PowerPoint generation costs **6 credits** per presentation due to:
- AI content generation (Gemini API)
- Enhanced features (speaker notes, visual suggestions)
- Premium file creation (.pptx generation via SlidesGPT)

## Limitations

1. **API Quota**: Check SlidesGPT API limits on your plan
2. **File Size**: Large presentations (15+ slides) may take longer to generate
3. **Styling**: Visual styling depends on SlidesGPT's default templates

## Troubleshooting

### "SlidesGPT API token not configured"
- Add `SLIDESGPT_API_KEY` to your `.env.local` file
- Or use the default API key (pre-configured)

### "Failed to generate PowerPoint file"
- Check API key is valid
- Verify SlidesGPT API account has quota remaining
- Check internet connectivity

### Templates Not Working
- SlidesGPT doesn't require template files
- Custom templates can be used with `templateId` parameter (future feature)

## Future Enhancements

- [ ] Custom template support via templateId
- [ ] Presentation embedding via embed URL
- [ ] Batch presentation generation
- [ ] Custom color schemes
- [ ] Presentation themes management

## Resources

- [SlidesGPT API Documentation](https://api.slidesgpt.com/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [PowerPoint Template Creation Guide](https://support.microsoft.com/en-us/office/create-a-powerpoint-template)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check API quota and limits
4. Verify environment variables are set correctly
