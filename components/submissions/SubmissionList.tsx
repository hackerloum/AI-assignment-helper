'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Submission {
  id: string;
  title: string;
  subject: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_revision';
  quality_score: number | null;
  credits_awarded: number;
  created_at: string;
  reviewed_at: string | null;
  reviewer_feedback: string | null;
}

const statusConfig = {
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Pending' },
  under_review: { icon: AlertCircle, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Under Review' },
  approved: { icon: CheckCircle2, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Approved' },
  rejected: { icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Rejected' },
  needs_revision: { icon: AlertCircle, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', label: 'Needs Revision' },
};

export function SubmissionList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all' 
        ? '/api/submissions/list'
        : `/api/submissions/list?status=${statusFilter}`;
      
      const response = await fetch(url);
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Submissions</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          My Submissions
        </CardTitle>
        <CardDescription>
          Track the status of your submitted assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="under_review">Reviewing</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="needs_revision">Revision</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-6 space-y-4">
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No submissions found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {statusFilter === 'all' 
                  ? 'Start by submitting your first assignment!'
                  : `No ${statusFilter} submissions`}
              </p>
            </div>
          ) : (
            submissions.map((submission) => {
              const StatusIcon = statusConfig[submission.status].icon;
              return (
                <Card key={submission.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{submission.title}</h3>
                          <Badge className={statusConfig[submission.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[submission.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {submission.subject}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                            <span className="text-sm font-medium">Quality Score: </span>
                            <span className="text-sm font-bold text-primary">
                              {submission.quality_score.toFixed(1)}/5.0
                            </span>
                          </div>
                        )}
                        {submission.credits_awarded > 0 && (
                          <div className="mt-2">
                            <span className="text-sm font-medium">Credits Awarded: </span>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                              {submission.credits_awarded}
                            </span>
                          </div>
                        )}
                        {submission.reviewer_feedback && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Reviewer Feedback:</p>
                            <p className="text-sm text-muted-foreground">
                              {submission.reviewer_feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

