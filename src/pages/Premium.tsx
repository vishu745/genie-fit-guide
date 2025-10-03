import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, Zap, Target, TrendingUp } from 'lucide-react';

const Premium = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-r from-primary to-secondary rounded-2xl">
            <Crown className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Upgrade to Premium
        </h1>
        <p className="text-xl text-muted-foreground">
          Unlock advanced features and take your fitness to the next level
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="text-4xl font-bold mt-4">$0</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent mt-0.5" />
                <span>Basic workout tracking</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent mt-0.5" />
                <span>Meal logging</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent mt-0.5" />
                <span>AI Coach (limited)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent mt-0.5" />
                <span>Progress dashboard</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 border-primary">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-secondary px-4 py-1 text-white text-sm font-semibold">
            POPULAR
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              Premium
            </CardTitle>
            <CardDescription>For serious fitness enthusiasts</CardDescription>
            <div className="text-4xl font-bold mt-4">
              $9.99
              <span className="text-lg text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span className="font-medium">Everything in Free, plus:</span>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary mt-0.5" />
                <span>Unlimited AI Coach interactions</span>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-primary mt-0.5" />
                <span>Personalized workout plans</span>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                <span>Advanced analytics & insights</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>Custom meal plans with recipes</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>Progress photos & body measurements</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>Priority support</span>
              </div>
            </div>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Premium features are currently in development
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Premium;