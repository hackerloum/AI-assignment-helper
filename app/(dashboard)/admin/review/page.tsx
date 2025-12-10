import { AdminReviewPanel } from '@/components/submissions/AdminReviewPanel';

export default function AdminReviewPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Review Submissions</h1>
        <p className="text-muted-foreground">
          Review and approve student assignment submissions
        </p>
      </div>

      <AdminReviewPanel />
    </div>
  );
}

