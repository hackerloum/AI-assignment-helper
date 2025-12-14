'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, AlertCircle, Star, Download } from 'lucide-react';
import { format } from 'date-fns';

interface Submission {
  id: string;
  title: string;
  subject: string;
  academic_level: string;
  word_count: number;
  formatting_style: string;
  assignment_content: string | null;
  file_urls: string[] | null;
  status: string;
  quality_score: number | null;
  created_at: string;
  user_id: string;
}

export function AdminReviewPanel() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    contentQuality: 3,
    formattingCompliance: 3,
    originality: 3,
    academicRigor: 3,
    feedback: '',
  });

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions/admin/pending');
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedSubmission) return;

    setReviewing(true);
    try {
      const overallScore = (
        reviewData.contentQuality +
        reviewData.formattingCompliance +
        reviewData.originality +
        reviewData.academicRigor
      ) / 4;

      const response = await fetch('/api/submissions/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          status: reviewData.status,
          qualityScore: overallScore,
          contentQuality: reviewData.contentQuality,
          formattingCompliance: reviewData.formattingCompliance,
          originality: reviewData.originality,
          academicRigor: reviewData.academicRigor,
          feedback: reviewData.feedback,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Submission ${reviewData.status}! ${data.creditsAwarded ? `${data.creditsAwarded} credits awarded.` : ''}`);
        setSelectedSubmission(null);
        fetchPendingSubmissions();
        setReviewData({
          status: 'approved',
          contentQuality: 3,
          formattingCompliance: 3,
          originality: 3,
          academicRigor: 3,
          feedback: '',
        });
      } else {
        alert(data.error || 'Review failed');
      }
    } catch (error) {
      console.error('Review error:', error);
      alert('Failed to submit review');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Submissions</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
          <CardDescription>
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} awaiting review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No pending submissions
              </p>
            ) : (
              submissions.map((sub) => (
                <Card
                  key={sub.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedSubmission?.id === sub.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedSubmission(sub)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{sub.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{sub.subject}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{sub.word_count.toLocaleString()} words</span>
                          <span>•</span>
                          <span>{sub.formatting_style}</span>
                          <span>•</span>
                          <span>{format(new Date(sub.created_at), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{sub.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Submission</CardTitle>
          <CardDescription>
            {selectedSubmission ? `Reviewing: ${selectedSubmission.title}` : 'Select a submission to review'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedSubmission ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Assignment Content Preview</Label>
                <div className="p-4 bg-muted rounded-lg max-h-[200px] overflow-y-auto">
                  {selectedSubmission.assignment_content ? (
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedSubmission.assignment_content.substring(0, 500)}
                      {selectedSubmission.assignment_content.length > 500 ? '...' : ''}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground italic">
                        No text content available. This submission contains file attachments.
                      </p>
                      {selectedSubmission.file_urls && selectedSubmission.file_urls.length > 0 && (
                        <div className="flex flex-col gap-2 mt-3">
                          {selectedSubmission.file_urls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              {selectedSubmission.file_urls && selectedSubmission.file_urls.length > 1 
                                ? `Download File ${idx + 1}` 
                                : 'Download File'}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedSubmission.assignment_content && selectedSubmission.file_urls && selectedSubmission.file_urls.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Additional Files:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSubmission.file_urls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-2 py-1 bg-primary/10 border border-primary/30 rounded text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            File {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Review Decision</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={reviewData.status === 'approved' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setReviewData({ ...reviewData, status: 'approved' })}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant={reviewData.status === 'rejected' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => setReviewData({ ...reviewData, status: 'rejected' })}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      type="button"
                      variant={reviewData.status === 'needs_revision' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setReviewData({ ...reviewData, status: 'needs_revision' })}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Needs Revision
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Content Quality (1-5)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={reviewData.contentQuality}
                        onChange={(e) => setReviewData({ ...reviewData, contentQuality: parseInt(e.target.value) || 3 })}
                      />
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 cursor-pointer ${
                              star <= reviewData.contentQuality
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            onClick={() => setReviewData({ ...reviewData, contentQuality: star })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Formatting (1-5)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={reviewData.formattingCompliance}
                        onChange={(e) => setReviewData({ ...reviewData, formattingCompliance: parseInt(e.target.value) || 3 })}
                      />
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 cursor-pointer ${
                              star <= reviewData.formattingCompliance
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            onClick={() => setReviewData({ ...reviewData, formattingCompliance: star })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Originality (1-5)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={reviewData.originality}
                        onChange={(e) => setReviewData({ ...reviewData, originality: parseInt(e.target.value) || 3 })}
                      />
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 cursor-pointer ${
                              star <= reviewData.originality
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            onClick={() => setReviewData({ ...reviewData, originality: star })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Academic Rigor (1-5)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={reviewData.academicRigor}
                        onChange={(e) => setReviewData({ ...reviewData, academicRigor: parseInt(e.target.value) || 3 })}
                      />
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 cursor-pointer ${
                              star <= reviewData.academicRigor
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            onClick={() => setReviewData({ ...reviewData, academicRigor: star })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Feedback</Label>
                  <Textarea
                    value={reviewData.feedback}
                    onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                    rows={4}
                    placeholder="Provide feedback to the student..."
                  />
                </div>

                <Button
                  onClick={handleReview}
                  disabled={reviewing}
                  className="w-full"
                >
                  {reviewing ? 'Submitting Review...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Select a submission from the list to begin review
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

