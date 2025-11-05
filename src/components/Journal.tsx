import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, Mic, LogOut, BarChart3, User as UserIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Message {
  role: "user" | "assistant";
  content: string;
  emotions?: any;
}

const Journal = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: [...messages, userMessage] },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
        emotions: data.emotions,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save to database
      if (user) {
        await supabase.from("journal_entries").insert({
          user_id: user.id,
          content: input,
          emotions: data.emotions,
        });

        // Save mood log if emotions detected
        if (data.emotions && data.emotions.length > 0) {
          const moodLogs = data.emotions.map((emotion: any) => ({
            user_id: user.id,
            emotion: emotion.label,
            intensity: emotion.score,
          }));
          await supabase.from("mood_logs").insert(moodLogs);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">EchoMind</h1>
              <p className="text-xs text-muted-foreground">Your safe space</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Insights
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-4 mb-24">
          {messages.length === 0 && (
            <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <h2 className="text-2xl font-semibold mb-2">
                How are you feeling today?
              </h2>
              <p className="text-muted-foreground">
                Share your thoughts, feelings, or anything on your mind. I'm here
                to listen and understand.
              </p>
            </Card>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.emotions && message.emotions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs opacity-70">
                      Detected emotions:{" "}
                      {message.emotions
                        .map((e: any) => e.label)
                        .join(", ")}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-4 bg-card">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border p-4">
          <div className="container mx-auto max-w-4xl flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Share what's on your mind..."
              className="resize-none"
              rows={3}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Button variant="outline" disabled>
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
