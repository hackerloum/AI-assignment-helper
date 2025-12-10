import { SubmissionForm } from '@/components/submissions/SubmissionForm';
import { SubmissionList } from '@/components/submissions/SubmissionList';
import { Leaderboard } from '@/components/submissions/Leaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SubmissionsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submit Assignments</h1>
        <p className="text-muted-foreground">
          Submit your completed assignments to earn credits and help improve our AI models
        </p>
      </div>

      <Tabs defaultValue="submit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="submit">Submit Assignment</TabsTrigger>
          <TabsTrigger value="my-submissions">My Submissions</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-6">
          <SubmissionForm />
        </TabsContent>

        <TabsContent value="my-submissions" className="space-y-6">
          <SubmissionList />
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Leaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

