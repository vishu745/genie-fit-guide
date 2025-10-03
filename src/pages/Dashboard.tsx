import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Flame, TrendingUp, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    weeklyCaloriesBurned: 0,
    weeklyCaloriesEaten: 0,
    workoutsThisWeek: 0,
    mealsThisWeek: 0,
    streak: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Fetch workouts
      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', weekAgo.toISOString().split('T')[0]);

      if (workoutsError) throw workoutsError;

      // Fetch meals
      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', weekAgo.toISOString().split('T')[0]);

      if (mealsError) throw mealsError;

      // Calculate stats
      const caloriesBurned = workouts?.reduce((sum, w) => sum + (w.total_calories || 0), 0) || 0;
      const caloriesEaten = meals?.reduce((sum, m) => sum + (m.total_calories || 0), 0) || 0;

      setStats({
        weeklyCaloriesBurned: caloriesBurned,
        weeklyCaloriesEaten: caloriesEaten,
        workoutsThisWeek: workouts?.length || 0,
        mealsThisWeek: meals?.length || 0,
        streak: 5, // Placeholder for now
      });

      // Prepare chart data
      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const chartData = daysOfWeek.map((day, index) => {
        const date = new Date(today.getTime() - (6 - index) * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];

        const dayWorkouts = workouts?.filter(w => w.date === dateStr) || [];
        const dayMeals = meals?.filter(m => m.date === dateStr) || [];

        const burned = dayWorkouts.reduce((sum, w) => sum + (w.total_calories || 0), 0);
        const eaten = dayMeals.reduce((sum, m) => sum + (m.total_calories || 0), 0);

        return {
          day,
          burned,
          eaten,
        };
      });

      setChartData(chartData);
    } catch (error: any) {
      toast({
        title: 'Error loading dashboard',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Track your fitness journey</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => navigate('/workouts')} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Workout
          </Button>
          <Button onClick={() => navigate('/meals')} variant="secondary" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Meal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Calories Burned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <span className="text-3xl font-bold">{stats.weeklyCaloriesBurned}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">This week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Calories Eaten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <span className="text-3xl font-bold">{stats.weeklyCaloriesEaten}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">This week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              <span className="text-3xl font-bold">{stats.workoutsThisWeek}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">This week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <span className="text-3xl font-bold">{stats.streak}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Days in a row</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Calories burned vs eaten this week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="burned" fill="hsl(var(--primary))" name="Calories Burned" />
              <Bar dataKey="eaten" fill="hsl(var(--secondary))" name="Calories Eaten" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;