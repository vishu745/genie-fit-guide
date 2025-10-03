import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Dumbbell, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  duration: number;
}

interface Workout {
  id: string;
  date: string;
  exercises: Exercise[];
  total_duration: number;
  total_calories: number;
  notes: string;
}

const Workouts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([{
    name: '',
    sets: 0,
    reps: 0,
    weight: 0,
    duration: 0,
  }]);
  const [notes, setNotes] = useState('');
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    }
  }, [user]);

  const fetchWorkouts = async () => {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user?.id)
      .order('date', { ascending: false });

    if (error) {
      toast({
        title: 'Error loading workouts',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setWorkouts((data || []) as unknown as Workout[]);
    }
  };

  const addExercise = () => {
    setExercises([...exercises, {
      name: '',
      sets: 0,
      reps: 0,
      weight: 0,
      duration: 0,
    }]);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('workouts')
      .insert([{
        user_id: user.id,
        exercises: exercises as any,
        total_duration: totalDuration,
        total_calories: totalCalories,
        notes,
      }]);

    if (error) {
      toast({
        title: 'Error saving workout',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Workout saved!',
        description: 'Your workout has been logged successfully.',
      });
      setIsDialogOpen(false);
      setExercises([{ name: '', sets: 0, reps: 0, weight: 0, duration: 0 }]);
      setNotes('');
      setTotalCalories(0);
      setTotalDuration(0);
      fetchWorkouts();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Workouts
          </h1>
          <p className="text-muted-foreground mt-1">Track your exercise sessions</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Log Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log New Workout</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {exercises.map((exercise, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Exercise {index + 1}</Label>
                      {exercises.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExercise(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label>Exercise Name</Label>
                        <Input
                          placeholder="e.g., Bench Press"
                          value={exercise.name}
                          onChange={(e) => updateExercise(index, 'name', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Sets</Label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <Label>Reps</Label>
                        <Input
                          type="number"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <Label>Weight (kg)</Label>
                        <Input
                          type="number"
                          value={exercise.weight}
                          onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <Label>Duration (min)</Label>
                        <Input
                          type="number"
                          value={exercise.duration}
                          onChange={(e) => updateExercise(index, 'duration', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button variant="outline" onClick={addExercise} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Exercise
              </Button>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Duration (min)</Label>
                  <Input
                    type="number"
                    value={totalDuration}
                    onChange={(e) => setTotalDuration(parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label>Total Calories Burned</Label>
                  <Input
                    type="number"
                    value={totalCalories}
                    onChange={(e) => setTotalCalories(parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="How did it go?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <Button onClick={handleSubmit} className="w-full">
                Save Workout
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workouts History */}
      <div className="grid gap-4">
        {workouts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No workouts logged yet. Start your fitness journey!</p>
            </CardContent>
          </Card>
        ) : (
          workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{new Date(workout.date).toLocaleDateString()}</span>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{workout.total_duration} min</span>
                    <span>{workout.total_calories} cal</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workout.exercises.map((exercise: Exercise, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="font-medium">{exercise.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {exercise.sets} × {exercise.reps} @ {exercise.weight}kg
                      </span>
                    </div>
                  ))}
                  {workout.notes && (
                    <p className="text-sm text-muted-foreground mt-4">{workout.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Workouts;