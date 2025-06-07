"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AdminStats {
  users: {
    total: number;
    banned: number;
    active: number;
    newToday: number;
    newThisWeek: number;
  };
  posts: {
    total: number;
    active: number;
    deleted: number;
    newToday: number;
    newThisWeek: number;
  };
  comments: {
    total: number;
    active: number;
    deleted: number;
    newToday: number;
    newThisWeek: number;
  };
  engagement: {
    totalReactions: number;
    avgReactionsPerPost: number;
    avgCommentsPerPost: number;
  };
  recentActivity: Array<{
    type: string;
    id: string;
    title: string;
    createdAt: string;
    status: string;
    author?: string;
    preview?: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = (await response.json()) as AdminStats;
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertTriangle className="text-destructive mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">
              Error loading dashboard
            </h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Users",
      value: stats.users.total,
      subtitle: `${stats.users.active} active, ${stats.users.banned} banned`,
      change: `+${stats.users.newThisWeek} this week`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Posts",
      value: stats.posts.total,
      subtitle: `${stats.posts.active} active, ${stats.posts.deleted} deleted`,
      change: `+${stats.posts.newThisWeek} this week`,
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Comments",
      value: stats.comments.total,
      subtitle: `${stats.comments.active} active, ${stats.comments.deleted} deleted`,
      change: `+${stats.comments.newThisWeek} this week`,
      icon: MessageSquare,
      color: "text-purple-600",
    },
    {
      title: "Engagement",
      value: stats.engagement.totalReactions,
      subtitle: `${stats.engagement.avgReactionsPerPost} avg reactions/post`,
      change: `${stats.engagement.avgCommentsPerPost} avg comments/post`,
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Monitor your platform&apos;s health and activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.value.toLocaleString()}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {card.subtitle}
              </p>
              <p className="mt-1 text-xs text-green-600">{card.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div
                key={`${activity.type}-${activity.id}`}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {activity.type === "user" && (
                      <Users className="h-4 w-4 text-blue-600" />
                    )}
                    {activity.type === "post" && (
                      <FileText className="h-4 w-4 text-green-600" />
                    )}
                    {activity.type === "comment" && (
                      <MessageSquare className="h-4 w-4 text-purple-600" />
                    )}

                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      {activity.author && (
                        <p className="text-muted-foreground text-xs">
                          by {activity.author}
                        </p>
                      )}
                      {activity.preview && (
                        <p className="text-muted-foreground text-xs">
                          &quot;{activity.preview}&quot;...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      activity.status === "active"
                        ? "default"
                        : activity.status === "deleted"
                          ? "destructive"
                          : activity.status === "banned"
                            ? "destructive"
                            : "secondary"
                    }
                  >
                    {activity.status}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
