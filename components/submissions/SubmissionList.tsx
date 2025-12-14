'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle2, XCircle, AlertCircle, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

interface Submission {
  id: string;
  title: string;
  subject: string;
  college_name: string | null;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_revision';
  quality_score: number | null;
  credits_awarded: number;
  created_at: string;
  reviewed_at: string | null;
  reviewer_feedback: string | null;
  file_urls: string[] | null;
}

const statusConfig = {
  pending: { icon: Clock, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Pending' },
  under_review: { icon: AlertCircle, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Under Review' },
  approved: { icon: CheckCircle2, color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Approved' },
  rejected: { icon: XCircle, color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Rejected' },
  needs_revision: { icon: AlertCircle, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Needs Revision' },
};

export function SubmissionList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, collegeFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (collegeFilter !== 'all') {
        params.append('collegeName', collegeFilter);
      }
      
      // Get session token for authentication
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const url = `/api/submissions/list${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: session?.access_token ? {
          'Authorization': `Bearer ${session.access_token}`
        } : undefined,
        credentials: 'include', // Ensure cookies are sent
      });
      const data = await response.json();
      
      if (data.success) {
        setSubmissions(data.submissions || []);
        if (data.colleges) {
          setColleges(data.colleges);
        }
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">My Submissions</h2>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="h-5 w-5" />
          My Submissions
        </h2>
        <p className="text-slate-400">
          Track the status of your submitted assignments
        </p>
      </div>
      <div>
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="flex-1">
            <TabsList className="grid w-full grid-cols-6 bg-dashboard-surface border border-dashboard-border">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="pending"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger 
                value="under_review"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                Reviewing
              </TabsTrigger>
              <TabsTrigger 
                value="approved"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                Approved
              </TabsTrigger>
              <TabsTrigger 
                value="rejected"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                Rejected
              </TabsTrigger>
              <TabsTrigger 
                value="needs_revision"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                Revision
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {colleges.length > 0 && (
            <Select value={collegeFilter} onValueChange={setCollegeFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-dashboard-surface border-dashboard-border text-white">
                <SelectValue placeholder="Filter by College" />
              </SelectTrigger>
              <SelectContent className="bg-dashboard-elevated border-dashboard-border">
                <SelectItem value="all" className="text-white hover:bg-dashboard-surface">
                  All Colleges
                </SelectItem>
                {colleges.map((college) => (
                  <SelectItem 
                    key={college} 
                    value={college}
                    className="text-white hover:bg-dashboard-surface"
                  >
                    {college}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No submissions found</p>
              <p className="text-sm text-slate-500 mt-2">
                {statusFilter === 'all' 
                  ? 'Start by submitting your first assignment!'
                  : `No ${statusFilter} submissions`}
              </p>
            </div>
          ) : (
            submissions.map((submission) => {
              const StatusIcon = statusConfig[submission.status].icon;
              return (
                <div 
                  key={submission.id} 
                  className="bg-dashboard-surface border border-dashboard-border rounded-xl p-6 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-white">{submission.title}</h3>
                        <Badge className={`${statusConfig[submission.status].color} border`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[submission.status].label}
                        </Badge>
                      </div>
                        <div className="flex items-center gap-2 mb-3">
                          <p className="text-sm text-slate-400">
                            {submission.subject}
                          </p>
                          {submission.college_name && (
                            <>
                              <span className="text-slate-600">•</span>
                              <p className="text-sm text-slate-400 font-medium">
                                {submission.college_name}
                              </p>
                            </>
                          )}
                        </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>
                          Submitted: {format(new Date(submission.created_at), 'MMM d, yyyy')}
                        </span>
                        {submission.reviewed_at && (
                          <>
                            <span>•</span>
                            <span>
                              Reviewed: {format(new Date(submission.reviewed_at), 'MMM d, yyyy')}
                            </span>
                          </>
                        )}
                      </div>
                      {submission.quality_score && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-slate-300">Quality Score: </span>
                          <span className="text-sm font-bold text-purple-400">
                            {submission.quality_score.toFixed(1)}/5.0
                          </span>
                        </div>
                      )}
                        {submission.credits_awarded > 0 && (
                          <div className="mt-2">
                            <span className="text-sm font-medium text-slate-300">Credits Awarded: </span>
                            <span className="text-sm font-bold text-green-400">
                              {submission.credits_awarded}
                            </span>
                          </div>
                        )}
                        {submission.file_urls && submission.file_urls.length > 0 && (
                          <div className="mt-3 flex gap-2">
                            {submission.file_urls.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 text-sm font-medium hover:bg-purple-500/20 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                Download File {submission.file_urls && submission.file_urls.length > 1 ? `(${idx + 1})` : ''}
                              </a>
                            ))}
                          </div>
                        )}
                      {submission.reviewer_feedback && (
                        <div className="mt-3 p-3 bg-dashboard-elevated border border-dashboard-border rounded-lg">
                          <p className="text-sm font-medium text-white mb-1">Reviewer Feedback:</p>
                          <p className="text-sm text-slate-400">
                            {submission.reviewer_feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

