import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Utensils, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MealItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Meal {
  id: string;
  date: string;
  meal_type: string;
  items: MealItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  notes: string;
}

const Meals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const [items, setItems] = useState<MealItem[]>([{
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  }]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      fetchMeals();
    }
  }, [user]);

  const fetchMeals = async () => {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user?.id)
      .order('date', { ascending: false });

    if (error) {
      toast({
        title: 'Error loading meals',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setMeals((data || []) as unknown as Meal[]);
    }
  };

  const addItem = () => {
    setItems([...items, {
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    }]);
  };

  const updateItem = (index: number, field: keyof MealItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    return items.reduce(
      (totals, item) => ({
        calories: totals.calories + item.calories,
        protein: totals.protein + item.protein,
        carbs: totals.carbs + item.carbs,
        fats: totals.fats + item.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const handleSubmit = async () => {
    if (!user) return;

    const totals = calculateTotals();

    const { error } = await supabase
      .from('meals')
      .insert([{
        user_id: user.id,
        meal_type: mealType,
        items: items as any,
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fats: totals.fats,
        notes,
      }]);

    if (error) {
      toast({
        title: 'Error saving meal',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Meal saved!',
        description: 'Your meal has been logged successfully.',
      });
      setIsDialogOpen(false);
      setMealType('breakfast');
      setItems([{ name: '', calories: 0, protein: 0, carbs: 0, fats: 0 }]);
      setNotes('');
      fetchMeals();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Meals
          </h1>
          <p className="text-muted-foreground mt-1">Track your nutrition</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Log Meal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log New Meal</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Meal Type</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Item {index + 1}</Label>
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label>Food Item</Label>
                        <Input
                          placeholder="e.g., Chicken Breast"
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Calories</Label>
                        <Input
                          type="number"
                          value={item.calories}
                          onChange={(e) => updateItem(index, 'calories', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <Label>Protein (g)</Label>
                        <Input
                          type="number"
                          value={item.protein}
                          onChange={(e) => updateItem(index, 'protein', parseFloat(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <Label>Carbs (g)</Label>
                        <Input
                          type="number"
                          value={item.carbs}
                          onChange={(e) => updateItem(index, 'carbs', parseFloat(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <Label>Fats (g)</Label>
                        <Input
                          type="number"
                          value={item.fats}
                          onChange={(e) => updateItem(index, 'fats', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button variant="outline" onClick={addItem} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
              
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Calories</p>
                      <p className="text-2xl font-bold">{calculateTotals().calories}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Protein</p>
                      <p className="text-2xl font-bold">{calculateTotals().protein}g</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Carbs</p>
                      <p className="text-2xl font-bold">{calculateTotals().carbs}g</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fats</p>
                      <p className="text-2xl font-bold">{calculateTotals().fats}g</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any notes about this meal?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <Button onClick={handleSubmit} className="w-full">
                Save Meal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Meals History */}
      <div className="grid gap-4">
        {meals.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No meals logged yet. Start tracking your nutrition!</p>
            </CardContent>
          </Card>
        ) : (
          meals.map((meal) => (
            <Card key={meal.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <span className="capitalize">{meal.meal_type}</span>
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      {new Date(meal.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{meal.total_calories} cal</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {meal.items.map((item: MealItem, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.calories} cal
                      </span>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-muted/50 rounded">
                    <div>
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="font-medium">{meal.total_protein}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="font-medium">{meal.total_carbs}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fats</p>
                      <p className="font-medium">{meal.total_fats}g</p>
                    </div>
                  </div>
                  {meal.notes && (
                    <p className="text-sm text-muted-foreground mt-4">{meal.notes}</p>
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

export default Meals;