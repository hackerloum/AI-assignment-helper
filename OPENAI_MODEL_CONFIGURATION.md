# OpenAI Model Configuration

This document describes how the application uses different OpenAI models for different features to optimize performance and cost.

## Model Selection Strategy

The application automatically selects the most appropriate OpenAI model based on the feature being used:

### Model Mapping Table

| Feature                | Model Used  | Max Tokens | Reasoning |
| ---------------------- | ----------- | ---------- | --------- |
| Grammar / Rewrite      | GPT-5 mini  | 400        | Fast, efficient for grammar corrections (paragraphs) |
| Assignment Writer      | GPT-5 mini  | 1500       | Multi-paragraph essays (~700-1000 words) |
| Research Assistant     | **GPT-5.2** | 2000       | Advanced reasoning for deep research with sources |
| Plagiarism Check       | GPT-5 mini  | 400        | Short explanation of copied content/originality |
| APA Referencing        | GPT-5 mini  | 300        | Citation formatting for 5-10 references |
| PowerPoint Generation  | GPT-5 mini  | 600        | Slide outlines and notes for 5-10 slides |
| Paraphrasing           | GPT-5 mini  | 400        | Text transformation at paragraph level |
| Summarization          | GPT-5 mini  | 400        | Fast summarization for quick results |
| Humanization           | GPT-5 mini  | 400        | Style transformation works well with mini |

## Key Points

### Why GPT-5.2 for Research?
- Research tasks require deeper analysis and reasoning
- GPT-5.2 provides more comprehensive and nuanced responses
- Better at synthesizing information from multiple perspectives
- More accurate in handling complex academic queries

### Why GPT-5 mini for Other Tasks?
- Faster response times
- More cost-effective
- Sufficient quality for most text generation tasks
- Better for tasks that don't require deep reasoning

## Implementation Details

### Code Location
The model mapping and token limits are defined in `lib/ai-service.ts`:

```typescript
// Model mapping for different features
const MODEL_MAPPING = {
  GRAMMAR: "gpt-5-mini",
  REWRITE: "gpt-5-mini",
  ASSIGNMENT: "gpt-5-mini",
  RESEARCH: "gpt-5.2",
  PLAGIARISM: "gpt-5-mini",
  REFERENCING: "gpt-5-mini",
  POWERPOINT: "gpt-5-mini",
  SUMMARIZE: "gpt-5-mini",
  PARAPHRASE: "gpt-5-mini",
  HUMANIZE: "gpt-5-mini",
} as const;

// Token limits for different features (max output tokens)
const TOKEN_LIMITS = {
  GRAMMAR: 400,        // 200-400: Enough for paragraphs or a page of text
  REWRITE: 400,        // 200-400: Similar to grammar checking
  ASSIGNMENT: 1500,    // 1000-1500: Multi-paragraph essays (~700-1000 words)
  RESEARCH: 2000,      // 1500-2000: Detailed explanations with multiple sources
  PLAGIARISM: 400,     // 200-400: Short explanation of originality
  REFERENCING: 300,    // 150-300: Formatting 5-10 references
  POWERPOINT: 600,     // 400-600: Slide outlines for 5-10 slides
  SUMMARIZE: 400,      // 200-400: Concise summaries
  PARAPHRASE: 400,     // 200-400: Paragraph-level paraphrasing
  HUMANIZE: 400,       // 200-400: Text transformation
} as const;
```

### API Configuration
- **Endpoint:** `https://api.openai.com/v1/responses`
- **Authentication:** Bearer token with `OPENAI_API_KEY`
- **Request Format:**
  ```json
  {
    "model": "gpt-5-mini",
    "input": "system instruction + user prompt",
    "store": true,
    "max_output_tokens": 400
  }
  ```
- **Token Limits:** Automatically set based on feature using `max_output_tokens` (see table above)

## Environment Setup

### Required Environment Variable
Only one environment variable is needed:

```env
OPENAI_API_KEY=your_openai_api_key
```

### Model Selection is Automatic
- No need to specify models manually
- The application automatically selects the correct model
- Model selection happens at the service layer

## API Key Requirements

Your OpenAI API key must have access to:
- ✅ **GPT-5 mini** (used for most features)
- ✅ **GPT-5.2** (used for research assistant)

Check your OpenAI account to ensure both models are available.

## Cost Optimization

The model selection and token limits are designed to optimize costs:

1. **Heavy Usage Tasks** → GPT-5 mini with modest token limits
   - Essay writing (1500 tokens), grammar checking (400 tokens), citations (300 tokens)
   - These are frequently used, so mini model + reasonable tokens saves costs

2. **Deep Analysis Tasks** → GPT-5.2 with higher token limits
   - Research assistant (2000 tokens)
   - Used less frequently, justifies premium model and higher token allocation

3. **Specialized Tasks** → GPT-5 mini with optimized token limits
   - PowerPoint (600 tokens for 5-10 slides)
   - Plagiarism (400 tokens for explanations)
   - Each feature gets exactly what it needs

4. **Result:** Balanced approach between quality, speed, and cost

## Testing the Configuration

To verify the configuration is working:

1. **Test Grammar Check** (should use GPT-5 mini)
2. **Test Research Assistant** (should use GPT-5.2)
3. Check server logs to confirm model selection

## Troubleshooting

### "Model not found" Error
- Verify your OpenAI account has access to both GPT-5 mini and GPT-5.2
- Check API key permissions in OpenAI dashboard
- Ensure API key hasn't been revoked

### "Rate limit exceeded" Error
- Different models have different rate limits
- Check OpenAI usage dashboard
- Consider upgrading your OpenAI plan if needed

### Wrong Model Being Used
- Check `lib/ai-service.ts` for `MODEL_MAPPING` configuration
- Verify function is calling `callGemini` with correct model parameter
- Review server logs for model selection

## Future Considerations

### Adding New Features
When adding a new AI feature:

1. Choose appropriate model (mini for speed, 5.2 for depth)
2. Add to `MODEL_MAPPING` constant
3. Pass model to `callGemini` function
4. Update this documentation

### Changing Models
To change a feature's model:

1. Update `MODEL_MAPPING` in `lib/ai-service.ts`
2. Test the feature thoroughly
3. Update this documentation

## Summary

✅ **Automatic model selection** based on feature
✅ **Optimized for cost** - mini for most tasks
✅ **Optimized for quality** - 5.2 for research
✅ **Single API key** manages all models
✅ **No manual configuration** needed

The system is designed to "just work" with intelligent model selection happening behind the scenes.

