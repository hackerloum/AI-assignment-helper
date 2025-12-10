'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Upload, Info, Sparkles } from 'lucide-react';

interface SubmissionFormProps {
  coverPageData?: {
    title?: string;
    subject?: string;
    academicLevel?: string;
    wordCount?: number;
    formattingStyle?: string;
    [key: string]: any;
  };
  onSuccess?: () => void;
}

export function SubmissionForm({ coverPageData, onSuccess }: SubmissionFormProps) {
  const [submissionType, setSubmissionType] = useState<'individual' | 'group'>('individual');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: coverPageData?.title || '',
    subject: coverPageData?.subject || '',
    academicLevel: coverPageData?.academicLevel || 'undergraduate',
    wordCount: coverPageData?.wordCount?.toString() || '',
    formattingStyle: coverPageData?.formattingStyle || 'APA',
    assignmentContent: '',
    canUseForTraining: false,
  });

  const wordCount = formData.assignmentContent.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/submissions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionType,
          ...formData,
          wordCount: parseInt(formData.wordCount) || wordCount,
          coverPageData: {
            ...coverPageData,
            ...formData,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        alert(data.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Submission Successful!</h3>
            <p className="text-muted-foreground mb-4">
              Your assignment has been submitted and is pending review.
            </p>
            <p className="text-sm text-muted-foreground">
              You will receive credits after approval (typically within 24-48 hours).
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Submit Assignment</CardTitle>
        <CardDescription>
          Submit your completed assignment to earn credits and help improve our AI models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={submissionType} onValueChange={(v) => setSubmissionType(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">Individual Submission</TabsTrigger>
              <TabsTrigger value="group">Group Submission</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Assignment Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter assignment title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Computer Science, History"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicLevel">Academic Level</Label>
              <Select
                value={formData.academicLevel}
                onValueChange={(value) => setFormData({ ...formData, academicLevel: value })}
              >
                <SelectTrigger id="academicLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wordCount">Word Count</Label>
              <Input
                id="wordCount"
                type="number"
                value={formData.wordCount}
                onChange={(e) => setFormData({ ...formData, wordCount: e.target.value })}
                placeholder="e.g., 2000"
                min="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formattingStyle">Formatting Style</Label>
              <Select
                value={formData.formattingStyle}
                onValueChange={(value) => setFormData({ ...formData, formattingStyle: value })}
              >
                <SelectTrigger id="formattingStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APA">APA</SelectItem>
                  <SelectItem value="MLA">MLA</SelectItem>
                  <SelectItem value="Chicago">Chicago</SelectItem>
                  <SelectItem value="Harvard">Harvard</SelectItem>
                  <SelectItem value="IEEE">IEEE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Assignment Content *</Label>
              <span className="text-sm text-muted-foreground">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
            </div>
            <Textarea
              id="content"
              value={formData.assignmentContent}
              onChange={(e) => setFormData({ ...formData, assignmentContent: e.target.value })}
              rows={20}
              required
              placeholder="Paste your complete assignment here. Include all sections: introduction, main body, conclusion, and references..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 100 words required. Make sure your assignment is complete and properly formatted.
            </p>
          </div>

          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="training"
                      checked={formData.canUseForTraining}
                      onChange={(e) => setFormData({ ...formData, canUseForTraining: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="training" className="font-semibold cursor-pointer">
                      Allow this assignment to be used for AI training
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    By checking this box, you agree to let us use your assignment (anonymized) to improve our AI models. 
                    You&apos;ll receive a <span className="font-semibold text-blue-600 dark:text-blue-400">10% bonus credits</span> for helping us improve!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
            <Info className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">What happens next?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your submission will be reviewed within 24-48 hours</li>
                <li>Credits are awarded based on quality (25-100+ credits)</li>
                <li>You&apos;ll receive a notification when reviewed</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSuccess?.()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || wordCount < 100}>
              {loading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Assignment
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

