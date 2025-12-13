'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, XCircle, AlertCircle, Clock, Star } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Submission {
  id: string;
  title: string;
  subject: string;
  academic_level: string;
  word_count: number;
  formatting_style: string;
  assignment_content: string;
  status: string;
  quality_score: number | null;
  created_at: string;
  user_id: string;
}

export function AdminSubmissionsManagement() {
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
      setLoading(true);
      const response = await fetch('/api/submissions/admin/pending', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error('Unauthorized: You do not have admin permissions');
          setSubmissions([]);
          setLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
      } else {
        console.error('Failed to fetch submissions:', data.error);
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
      setSubmissions([]);
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
        credentials: 'include',
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
        toast.success(`Submission ${reviewData.status}! ${data.creditsAwarded ? `${data.creditsAwarded} credits awarded.` : ''}`);
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
        toast.error(data.error || 'Review failed');
      }
    } catch (error) {
      console.error('Review error:', error);
      toast.error('Failed to submit review');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
        <p className="text-slate-400 mt-4">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      {/* Submissions List */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Pending Reviews</h2>
          <p className="text-sm text-slate-400 mt-1">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No pending submissions</p>
            </div>
          ) : (
            submissions.map((sub, index) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedSubmission(sub)}
                className={`p-4 bg-white/5 border border-dashboard-border rounded-xl cursor-pointer hover:bg-white/10 hover:border-amber-500/30 transition-all ${
                  selectedSubmission?.id === sub.id ? 'border-amber-500/50 bg-amber-500/10' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{sub.title}</h3>
                    <p className="text-sm text-slate-400 mb-2">{sub.subject}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{sub.word_count.toLocaleString()} words</span>
                      <span>•</span>
                      <span>{sub.formatting_style}</span>
                      <span>•</span>
                      <span>{format(new Date(sub.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-semibold">
                    {sub.status}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Review Panel */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Review Submission</h2>
          <p className="text-sm text-slate-400 mt-1">
            {selectedSubmission ? `Reviewing: ${selectedSubmission.title}` : 'Select a submission to review'}
          </p>
        </div>
        {selectedSubmission ? (
          <div className="space-y-6">
            <div className="p-4 bg-white/5 border border-dashboard-border rounded-xl">
              <h4 className="text-sm font-semibold text-slate-400 mb-2">Assignment Content Preview</h4>
              <div className="max-h-[200px] overflow-y-auto">
                <p className="text-sm text-slate-300 whitespace-pre-wrap">
                  {selectedSubmission.assignment_content.substring(0, 500)}
                  {selectedSubmission.assignment_content.length > 500 ? '...' : ''}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Review Decision</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, status: 'approved' })}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                      reviewData.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-slate-400 border border-dashboard-border hover:bg-white/10'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, status: 'rejected' })}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                      reviewData.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/5 text-slate-400 border border-dashboard-border hover:bg-white/10'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, status: 'needs_revision' })}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                      reviewData.status === 'needs_revision'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-white/5 text-slate-400 border border-dashboard-border hover:bg-white/10'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    Needs Revision
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'contentQuality', label: 'Content Quality' },
                  { key: 'formattingCompliance', label: 'Formatting' },
                  { key: 'originality', label: 'Originality' },
                  { key: 'academicRigor', label: 'Academic Rigor' },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm text-slate-400">{label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={reviewData[key as keyof typeof reviewData] as number}
                        onChange={(e) => setReviewData({ ...reviewData, [key]: parseInt(e.target.value) || 3 })}
                        className="w-16 px-2 py-1 bg-white/5 border border-dashboard-border rounded text-white text-sm"
                      />
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 cursor-pointer ${
                              star <= (reviewData[key as keyof typeof reviewData] as number)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-600'
                            }`}
                            onClick={() => setReviewData({ ...reviewData, [key]: star })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Feedback</label>
                <textarea
                  value={reviewData.feedback}
                  onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                  rows={4}
                  placeholder="Provide feedback to the student..."
                  className="w-full px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <button
                onClick={handleReview}
                disabled={reviewing}
                className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reviewing ? 'Submitting Review...' : 'Submit Review'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            Select a submission from the list to begin review
          </div>
        )}
      </div>
    </div>
  );
}
