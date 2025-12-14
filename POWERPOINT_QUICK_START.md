# PowerPoint Generator - Quick Start Guide

This guide will help you set up and use the enhanced PowerPoint generation feature.

## Prerequisites

1. Gemini API key (same as used for other AI features)
2. PowerPoint Generator API account (optional for .pptx file generation)

## Setup Steps

### 1. Add Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the required values:

```bash
cp .env.local.example .env.local
```

**Required for PowerPoint:**
```env
# For AI content generation (same key as other features)
OPENAI_API_KEY=your-openai-key-here

# For .pptx file generation (optional)
PPTX_API_BEARER_TOKEN=your-bearer-token-here
```

**Your PowerPoint Generator API Credentials:**
```env
PPTX_API_BEARER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiaGFja2VybG91bUBnbWFpbC5jb20iLCJuYmYiOiIxNzY1Mjk2Nzg3IiwiZXhwIjoiMTc5NjgzMjc4NyJ9.nAZtXXQLu59D6fNjX5gVIIi0iqqulmUC4VMO2zaN-Jo
```

### 2. Install Dependencies (if needed)

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Access PowerPoint Tool

Navigate to: http://localhost:3000/dashboard/powerpoint

## How to Use

### Step 1: Generate Presentation Content

1. Enter your presentation topic (e.g., "Climate Change Impact")
2. Select number of slides (3-20)
3. Choose presentation style:
   - **Professional**: Business-focused, formal
   - **Creative**: Visual, engaging, colorful
   - **Academic**: Scholarly, research-focused
4. Click "Generate Presentation"

**Cost**: 6 credits

### Step 2: Preview Slides

After generation, you'll see:
- Title and subtitle
- Slide-by-slide preview
- Speaker notes (toggle with eye icon)
- Visual suggestions
- Estimated presentation duration

### Step 3: Navigate Slides

- Use **< >** buttons to navigate
- Click dots to jump to specific slides
- Toggle speaker notes with eye icon
- Copy slide content with copy icon

### Step 4: Download Options

**Option 1: PowerPoint File (.pptx)** ⭐
- Click "Download PowerPoint (.pptx)" button
- Generates actual PowerPoint file
- Compatible with MS PowerPoint, Google Slides
- *Requires PowerPoint Generator API token*

**Option 2: Text Format**
- Click "Text" button
- Downloads formatted text file
- Includes all content and speaker notes

**Option 3: JSON Format**
- Click "JSON" button
- Downloads structured JSON data
- Useful for custom processing

## Features

### AI-Generated Content
✅ Professional slide titles
✅ Structured bullet points (3-5 per slide)
✅ Speaker notes for presenters
✅ Visual suggestions for each slide
✅ Appropriate slide layouts
✅ Estimated presentation duration

### Interactive Preview
✅ Slide-by-slide navigation
✅ Toggle speaker notes visibility
✅ Copy slide content to clipboard
✅ Visual suggestions display
✅ Progress indicators

### Export Formats
✅ PowerPoint (.pptx) - actual files
✅ Text (.txt) - formatted text
✅ JSON (.json) - structured data

## Example Usage

### Business Presentation
```
Topic: "Q4 Financial Results 2024"
Slides: 10
Style: Professional
```

Result: Professional presentation with:
- Title slide
- Executive summary
- Revenue breakdown
- Key metrics
- Challenges
- Opportunities
- Action items
- Conclusion

### Academic Presentation
```
Topic: "Machine Learning in Healthcare"
Slides: 15
Style: Academic
```

Result: Scholarly presentation with:
- Introduction
- Literature review
- Research methodology
- Data analysis
- Results
- Discussion
- Conclusion
- References

### Creative Presentation
```
Topic: "Social Media Marketing Strategy"
Slides: 8
Style: Creative
```

Result: Engaging presentation with:
- Bold title
- Problem statement
- Creative solutions
- Visual examples
- Campaign ideas
- Success metrics
- Call to action

## Tips for Best Results

### 1. Be Specific with Topics
❌ "Business"
✅ "Digital Transformation in Retail Banking"

### 2. Choose Appropriate Slide Count
- **5-8 slides**: Quick overview/pitch
- **10-12 slides**: Standard presentation
- **15-20 slides**: In-depth training/workshop

### 3. Match Style to Audience
- **Professional**: Executives, stakeholders, clients
- **Creative**: Marketing, design, startups
- **Academic**: Research, education, conferences

### 4. Use Speaker Notes
- Review generated speaker notes
- Add your own insights
- Practice with the notes

### 5. Customize Visual Suggestions
- Review the AI's visual suggestions
- Add relevant images to your PowerPoint
- Use suggested charts and graphs

## Troubleshooting

### "OPENAI_API_KEY is not configured"
**Solution**: Add Gemini API key to `.env.local` (same key used for other AI features)

### "PowerPoint API token not configured"
**Solution**: 
- Add `PPTX_API_BEARER_TOKEN` to `.env.local`
- Or use text/JSON download options instead

### "Insufficient credits"
**Solution**: 
- Purchase more credits from dashboard
- PowerPoint generation costs 6 credits

### Presentation Generation is Slow
**Reasons**:
- Gemini API response time (10-30 seconds)
- Large slide count (15+ slides)
- Network connection

**Tips**:
- Start with fewer slides for testing
- Check internet connection
- Be patient (quality takes time!)

### PowerPoint File Download Fails
**Possible Issues**:
1. PowerPoint API token expired
2. Template files not available
3. API quota exceeded

**Solutions**:
1. Check token expiration date
2. Use text/JSON download as backup
3. Check PowerPoint API dashboard for quota

## Cost Breakdown

| Action | Credits | Notes |
|--------|---------|-------|
| Generate presentation | 6 | Includes AI content generation |
| Preview slides | 0 | Free after generation |
| Download text/JSON | 0 | Free |
| Download .pptx | 0 | Uses PowerPoint API quota |

## API Integration Details

### Architecture
```
User Input
    ↓
OpenAI API (Content Generation)
    ↓
Presentation Data (JSON)
    ↓
PowerPoint Generator API (File Creation)
    ↓
.pptx File Download
```

### Content Generation (Gemini)
- Model: Gemini 2.5 Flash
- Temperature: 0.7
- Max tokens: 4000
- Response format: JSON

### File Generation (PowerPoint API)
- Template: Style-specific .pptx
- Export format: Pptx2010
- Authentication: Bearer token

## Next Steps

1. ✅ Generate your first presentation
2. ✅ Experiment with different styles
3. ✅ Try various slide counts
4. ✅ Download in different formats
5. ✅ Customize the content in PowerPoint

## Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [PowerPoint Generator API](https://powerpointgeneratorapi.com/)
- [Full Documentation](./POWERPOINT_README.md)

## Support

Need help?
1. Check [troubleshooting](#troubleshooting) section
2. Review [ENV_VARIABLES.md](./ENV_VARIABLES.md)
3. Read [POWERPOINT_README.md](./POWERPOINT_README.md)

---

**Happy Presenting! 🎉**

