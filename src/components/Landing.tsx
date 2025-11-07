import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, BarChart3, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your AI Emotional Co-Pilot</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Find Peace in Your Thoughts with EchoMind
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            A safe, private space to explore your emotions with an AI companion that truly listens and understands.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              Start Your Journey
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Empathetic Conversations</h3>
            <p className="text-muted-foreground">
              Express yourself through text or voice. Our AI listens without judgment and responds with genuine empathy.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Emotion Insights</h3>
            <p className="text-muted-foreground">
              Discover patterns in your emotional journey with beautiful visualizations and personalized insights.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Private & Secure</h3>
            <p className="text-muted-foreground">
              Your thoughts are yours alone. All conversations are encrypted and completely confidential.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
          <h2 className="text-3xl font-bold mb-4">Ready to understand yourself better?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands finding clarity and peace through EchoMind.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Get Started Free
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
