import { SubmissionForm } from '@/components/submissions/SubmissionForm';
import { SubmissionList } from '@/components/submissions/SubmissionList';
import { Leaderboard } from '@/components/submissions/Leaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SubmissionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Submit Assignments</h1>
        <p className="text-lg text-slate-400">
          Submit your completed assignments to earn credits and help improve our AI models
        </p>
      </div>

      <Tabs defaultValue="submit" className="space-y-6">
        <TabsList className="bg-dashboard-elevated border border-dashboard-border">
          <TabsTrigger 
            value="submit" 
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border-purple-500/30"
          >
            Submit Assignment
          </TabsTrigger>
          <TabsTrigger 
            value="my-submissions"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border-purple-500/30"
          >
            My Submissions
          </TabsTrigger>
          <TabsTrigger 
            value="leaderboard"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border-purple-500/30"
          >
            Leaderboard
          </TabsTrigger>
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

