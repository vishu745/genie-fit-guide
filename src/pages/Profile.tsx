import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    age: '',
    sex: 'male',
    height: '',
    weight: '',
    activity_level: 'moderately_active',
    goal: 'maintain',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      toast({
        title: 'Error loading profile',
        description: error.message,
        variant: 'destructive',
      });
    } else if (data) {
      setProfile({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        age: data.age?.toString() || '',
        sex: data.sex || 'male',
        height: data.height?.toString() || '',
        weight: data.weight?.toString() || '',
        activity_level: data.activity_level || 'moderately_active',
        goal: data.goal || 'maintain',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user?.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        age: parseInt(profile.age) || null,
        sex: profile.sex,
        height: parseFloat(profile.height) || null,
        weight: parseFloat(profile.weight) || null,
        activity_level: profile.activity_level,
        goal: profile.goal,
      });

    if (error) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profile updated!',
        description: 'Your profile has been saved successfully.',
      });
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Profile
        </h1>
        <p className="text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your profile details to get personalized recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  value={profile.first_name}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  value={profile.last_name}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sex">Sex</Label>
                <Select value={profile.sex} onValueChange={(value) => setProfile({ ...profile, sex: value })}>
                  <SelectTrigger id="sex">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={profile.weight}
                  onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity-level">Activity Level</Label>
              <Select value={profile.activity_level} onValueChange={(value) => setProfile({ ...profile, activity_level: value })}>
                <SelectTrigger id="activity-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                  <SelectItem value="extra_active">Extra Active (physical job + exercise)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Fitness Goal</Label>
              <Select value={profile.goal} onValueChange={(value) => setProfile({ ...profile, goal: value })}>
                <SelectTrigger id="goal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">Lose Weight</SelectItem>
                  <SelectItem value="maintain">Maintain Weight</SelectItem>
                  <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;