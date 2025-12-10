# Submission Gamification System

A comprehensive gamification system that allows students to submit assignments (individual or group) and earn credits after approval. This system also collects high-quality training data to improve AI precision.

## Features

### 🎯 Core Functionality
- **Individual & Group Submissions**: Support for both individual and collaborative assignments
- **Credit Rewards**: Earn credits based on assignment quality (25-100+ credits)
- **Quality-Based Scoring**: 5-point rating system across multiple criteria
- **Achievement System**: Unlock badges and bonus credits
- **Leaderboard**: Compete with other contributors
- **Training Data Collection**: Opt-in system to help improve AI models (with 10% bonus credits)

### 📊 Credit Reward System

#### Individual Submissions
- **Base Credits**: 50 credits
- **Quality Multipliers**:
  - Excellent (4.5-5.0): 2.0x = 100 credits
  - Good (3.5-4.4): 1.5x = 75 credits
  - Average (2.5-3.4): 1.0x = 50 credits
  - Poor (1.0-2.4): 0.5x = 25 credits
- **Word Count Bonus**: +25 credits for 5000+ words
- **Training Bonus**: +10% if allowing training data use

#### Group Submissions
- **Base Credits**: 100 credits
- **Member Bonus**: +20 credits per member
- **Quality Multipliers**: Same as individual
- **Training Bonus**: +10% if allowing training data use

#### Achievements
- **First Steps**: 25 credits (first submission)
- **Perfectionist**: 100 credits (perfect 5.0 score)
- **Dedicated Scholar**: 50 credits (10 approved submissions)
- **Master Contributor**: 200 credits (50 approved submissions)
- **Top Contributor**: 500 credits (leaderboard rank #1)

## Database Schema

### Tables Created
1. **assignment_groups**: Groups for collaborative submissions
2. **assignment_group_members**: Group membership management
3. **assignment_submissions**: Main submission records
4. **submission_reviews**: Admin review records
5. **user_achievements**: Achievement tracking
6. **user_leaderboard**: Leaderboard rankings

## API Endpoints

### Student Endpoints
- `POST /api/submissions/submit` - Submit an assignment
- `GET /api/submissions/list` - List user's submissions
- `GET /api/submissions/leaderboard` - Get leaderboard

### Admin Endpoints
- `POST /api/submissions/review` - Review and approve/reject submissions
- `GET /api/submissions/admin/pending` - Get pending submissions
- `GET /api/submissions/training-data` - Get training data
- `POST /api/submissions/training-data` - Mark submissions as used

## UI Components

### Student Components
- **SubmissionForm**: Modern form for submitting assignments
- **SubmissionList**: View and track submission status
- **Leaderboard**: See top contributors

### Admin Components
- **AdminReviewPanel**: Review interface with quality scoring

## Pages

- `/submissions` - Main submissions page (submit, view, leaderboard)
- `/admin/review` - Admin review interface

## Setup Instructions

### 1. Run Database Migration
```bash
# Apply the migration to your Supabase database
supabase migration up
# Or apply manually: supabase/migrations/006_submission_gamification.sql
```

### 2. Environment Variables
No additional environment variables required. Uses existing Supabase configuration.

### 3. Access Control
Currently, all authenticated users can review submissions. To restrict admin access:

1. Create a user roles table or use Supabase auth metadata
2. Add role check in API routes:
```typescript
// Example admin check
const isAdmin = await checkAdminRole(user.id);
if (!isAdmin) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

## Usage

### For Students

1. **Submit Assignment**:
   - Navigate to `/submissions`
   - Fill out the submission form
   - Optionally allow training data use for 10% bonus
   - Submit and wait for review (24-48 hours)

2. **Track Submissions**:
   - View all submissions in "My Submissions" tab
   - See status, quality scores, and credits awarded
   - Read reviewer feedback

3. **View Leaderboard**:
   - Check your ranking
   - See top contributors
   - Track your progress

### For Admins

1. **Review Submissions**:
   - Navigate to `/admin/review`
   - Select a pending submission
   - Rate on 4 criteria (1-5 stars each):
     - Content Quality
     - Formatting Compliance
     - Originality
     - Academic Rigor
   - Provide feedback
   - Approve, reject, or request revision

2. **Collect Training Data**:
   - Use `/api/submissions/training-data` endpoint
   - Get approved submissions with `can_use_for_training = true`
   - Mark as used after processing

## Training Data Collection

### Data Format
```typescript
{
  input: {
    coverPage: {...},
    requirements: {
      title: string,
      subject: string,
      academicLevel: string,
      wordCount: number,
      formattingStyle: string
    }
  },
  output: {
    content: string,
    references: array,
    qualityScore: number
  },
  metadata: {
    submissionId: string,
    submissionType: 'individual' | 'group',
    createdAt: string
  }
}
```

### Collection Process
1. Query approved submissions with `can_use_for_training = true`
2. Filter by quality score (default: ≥3.5)
3. Process and use for AI training
4. Mark submissions as `used_in_training = true`

## Credit Calculation Examples

### Example 1: Individual, Excellent Quality
- Base: 50 credits
- Quality (4.8): 2.0x multiplier = 100 credits
- Word count (6000): +25 bonus = 125 credits
- Training bonus: +12.5 credits = **137.5 credits**

### Example 2: Group, Good Quality
- Base: 100 credits
- Members: 3 = +60 credits
- Quality (3.8): 1.5x multiplier = 240 credits
- Training bonus: +24 credits = **264 credits** (split among members)

## Best Practices

### For Students
- Submit complete, well-formatted assignments
- Follow the specified formatting style
- Include proper references
- Allow training data use for bonus credits
- Submit regularly to unlock achievements

### For Admins
- Review consistently (aim for 24-48 hour turnaround)
- Provide constructive feedback
- Rate fairly across all criteria
- Use training data to improve AI models

## Future Enhancements

- [ ] Automated plagiarism detection integration
- [ ] Peer review system
- [ ] Submission templates
- [ ] File upload support
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Integration with assignment writer tool
- [ ] Automated quality scoring (AI-assisted)

## Troubleshooting

### Submissions Not Appearing
- Check RLS policies are correctly applied
- Verify user authentication
- Check database migration was applied

### Credits Not Awarded
- Verify submission status is "approved"
- Check credit transaction logs
- Ensure quality score is set

### Training Data Not Available
- Check `can_use_for_training` flag
- Verify quality score ≥ 3.5
- Ensure `used_in_training = false`

## Support

For issues or questions, please check:
- Database migration logs
- API error responses
- Browser console for client-side errors
- Supabase dashboard for RLS policy issues

