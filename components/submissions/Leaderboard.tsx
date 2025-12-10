'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  total_submissions: number;
  approved_submissions: number;
  total_credits_earned: number;
  quality_average: number;
  rank_position: number | null;
}

const getRankIcon = (rank: number | null) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
};

const getRankColor = (rank: number | null) => {
  if (rank === 1) return 'bg-yellow-500/10 border-yellow-500/30';
  if (rank === 2) return 'bg-slate-500/10 border-slate-500/30';
  if (rank === 3) return 'bg-amber-500/10 border-amber-500/30';
  return 'bg-dashboard-surface border-dashboard-border';
};

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/submissions/leaderboard?limit=10')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEntries(data.leaderboard || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Top Contributors</h2>
          <p className="text-slate-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Contributors
          </h2>
          <p className="text-slate-400">
            Be the first to submit assignments and earn credits!
          </p>
        </div>
        <div>
          <p className="text-center text-slate-400 py-8">
            No submissions yet. Start submitting to appear on the leaderboard!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Contributors
        </h2>
        <p className="text-slate-400">
          Ranked by total credits earned and quality average
        </p>
      </div>
      <div>
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.user_id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                getRankColor(entry.rank_position)
              } ${index < 3 ? 'shadow-lg' : ''}`}
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex items-center justify-center w-10 h-10">
                  {getRankIcon(entry.rank_position)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white truncate">
                      {entry.rank_position === 1 ? '🥇 ' : ''}
                      {entry.rank_position === 2 ? '🥈 ' : ''}
                      {entry.rank_position === 3 ? '🥉 ' : ''}
                      Contributor #{entry.user_id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                    <span>{entry.approved_submissions} approved</span>
                    <span>•</span>
                    <span>Avg: {entry.quality_average.toFixed(1)}/5.0</span>
                  </div>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-lg text-green-400">
                  {entry.total_credits_earned.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">credits</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-dashboard-surface border border-dashboard-border rounded-lg">
          <p className="text-sm text-slate-400 text-center">
            💡 Submit high-quality assignments to earn more credits and climb the leaderboard!
          </p>
        </div>
      </div>
    </div>
  );
}

