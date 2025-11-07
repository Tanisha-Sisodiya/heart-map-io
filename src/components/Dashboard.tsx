import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Calendar } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface MoodLog {
  emotion: string;
  intensity: number;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchMoodLogs(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchMoodLogs(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchMoodLogs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      setMoodLogs(data || []);
    } catch (error) {
      console.error("Error fetching mood logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate emotion frequencies
  const emotionCounts = moodLogs.reduce((acc, log) => {
    acc[log.emotion] = (acc[log.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topEmotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const averageIntensity = moodLogs.length > 0
    ? (moodLogs.reduce((sum, log) => sum + log.intensity, 0) / moodLogs.length).toFixed(2)
    : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/journal")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journal
          </Button>
          <h1 className="text-4xl font-bold mb-2">Your Emotional Insights</h1>
          <p className="text-muted-foreground">
            Discover patterns and trends in your emotional journey
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your insights...</p>
          </div>
        ) : moodLogs.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Start Your Journey</h2>
            <p className="text-muted-foreground mb-6">
              Begin journaling to see your emotional insights and patterns here.
            </p>
            <Button onClick={() => navigate("/journal")} className="bg-primary">
              Start Journaling
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Emotions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Most Frequent Emotions
                </CardTitle>
                <CardDescription>
                  Your top emotions over the last 30 entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topEmotions.map(([emotion, count]) => (
                    <div key={emotion}>
                      <div className="flex justify-between mb-2">
                        <span className="capitalize font-medium">{emotion}</span>
                        <span className="text-muted-foreground">{count} times</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width: `${(count / moodLogs.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Average Intensity Card */}
            <Card>
              <CardHeader>
                <CardTitle>Emotional Intensity</CardTitle>
                <CardDescription>
                  Average intensity of your emotions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {(parseFloat(averageIntensity) * 100).toFixed(0)}%
                  </div>
                  <p className="text-muted-foreground">
                    Average emotional intensity
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  This represents how intensely you've been experiencing emotions
                  during your recent journal entries.
                </p>
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Emotional Timeline</CardTitle>
                <CardDescription>
                  Your emotional journey over the past entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {moodLogs.slice(0, 10).map((log, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: `hsl(160, ${log.intensity * 100}%, ${
                              50 + log.intensity * 20
                            }%)`,
                          }}
                        />
                        <span className="capitalize font-medium">{log.emotion}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {(log.intensity * 100).toFixed(0)}% intensity
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
