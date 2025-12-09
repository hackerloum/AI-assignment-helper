# PowerPoint Generator Integration

This document explains the enhanced PowerPoint generation feature that creates actual .pptx files using the PowerPoint Generator API.

## Overview

The PowerPoint tool uses a two-step process:
1. **Content Generation**: Google Gemini 2.5 Flash generates high-quality presentation content with speaker notes, visual suggestions, and structured layouts
2. **File Creation**: PowerPoint Generator API converts the content into downloadable .pptx files

## Features

### Content Generation (Gemini)
- Professional presentation structure
- Speaker notes for each slide
- Visual suggestions (images, charts, graphics)
- Multiple presentation styles (professional, creative, academic)
- Bullet points with structured content
- Estimated duration calculation

### File Generation (PowerPoint Generator API)
- Creates actual .pptx PowerPoint files
- Compatible with Microsoft PowerPoint, Google Slides, LibreOffice
- Supports custom templates
- Export in various PowerPoint formats

## Setup

### 1. Gemini API Key
```env
GEMINI_API_KEY=your-gemini-key-here
```
Get it from: https://makersuite.google.com/app/apikey

**Note:** The same Gemini API key used for other AI features works for PowerPoint generation.

### 2. PowerPoint Generator API
```env
PPTX_API_BEARER_TOKEN=your-bearer-token-here
```

**Your Credentials:**
- Email: hackerloum@gmail.com
- API Key: 246ba6d7-09b7-496a-b44a-3ac2a6c01073
- Bearer Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiaGFja2VybG91bUBnbWFpbC5jb20iLCJuYmYiOiIxNzY1Mjk2Nzg3IiwiZXhwIjoiMTc5NjgzMjc4NyJ9.nAZtXXQLu59D6fNjX5gVIIi0iqqulmUC4VMO2zaN-Jo

## How It Works

### 1. User Input
- Topic/title
- Number of slides (3-20)
- Presentation style (professional/creative/academic)

### 2. Content Generation
```typescript
// OpenAI generates structured content
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
// PowerPoint Generator API creates .pptx file
const presentation = await generatePresentation(topic, slideCount, style, true)
```

The API formats the content and generates a downloadable .pptx file.

## Usage

### Preview Mode (Default)
1. User enters topic and settings
2. Click "Generate Presentation"
3. Preview slides in the UI
4. Download as Text or JSON if needed

### File Download Mode
1. After preview is generated
2. Click "Download PowerPoint (.pptx)"
3. System creates actual PowerPoint file
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

## Template System

The PowerPoint Generator API requires .pptx template files. The system currently uses a template-naming convention:

- `professional_template.pptx` - Business/corporate style
- `creative_template.pptx` - Visual/colorful style
- `academic_template.pptx` - Formal/scholarly style

### Creating Templates

To add custom templates:

1. Create a PowerPoint file with placeholder shapes
2. Name shapes according to the API specification:
   - `Title 1` - Main title on each slide
   - `Subtitle 2` - Subtitle on title slide
   - `Content Placeholder 2` - Main content area
   
3. Save as `.pptx` file
4. Upload to your server or storage
5. Reference in the code

Example template structure:
```json
{
  "presentation": {
    "template": "professional_template.pptx",
    "slides": [
      {
        "slide_index": 0,
        "shapes": [
          { "name": "Title 1", "content": "Presentation Title" },
          { "name": "Subtitle 2", "content": "Subtitle" }
        ]
      }
    ]
  }
}
```

## Credits

PowerPoint generation costs **6 credits** per presentation due to:
- AI content generation (Gemini API)
- Enhanced features (speaker notes, visual suggestions)
- Premium file creation (.pptx generation)

## Limitations

1. **Template Files Required**: The PowerPoint Generator API needs actual .pptx template files
2. **API Quota**: Check PowerPoint Generator API limits on your plan
3. **File Size**: Large presentations (15+ slides) may take longer to generate
4. **Styling**: Visual styling depends on template design

## Troubleshooting

### "PowerPoint API token not configured"
- Add `PPTX_API_BEARER_TOKEN` to your `.env.local` file

### "Failed to generate PowerPoint file"
- Check bearer token is valid and not expired
- Verify PowerPoint API account has quota remaining
- Check internet connectivity

### Templates Not Working
- Ensure template files are properly formatted .pptx files
- Verify shape names match API specification
- Check file upload succeeded

## Future Enhancements

- [ ] Custom template upload from UI
- [ ] Template library with multiple designs
- [ ] Chart and table insertion
- [ ] Image embedding from URLs
- [ ] Custom color schemes
- [ ] Presentation themes management

## Resources

- [PowerPoint Generator API Documentation](https://powerpointgeneratorapi.com/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [PowerPoint Template Creation Guide](https://support.microsoft.com/en-us/office/create-a-powerpoint-template)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check API quota and limits
4. Verify environment variables are set correctly

